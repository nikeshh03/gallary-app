import * as SQLite from 'expo-sqlite';
import { Album, AlbumPhotoRecord } from '../types/album';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('gallery.db');
    await dbInstance.execAsync('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

export async function initDatabase(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        coverAssetId TEXT,
        coverUri TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS album_photos (
        albumId TEXT NOT NULL,
        assetId TEXT NOT NULL,
        uri TEXT,
        addedAt INTEGER NOT NULL,
        PRIMARY KEY (albumId, assetId),
        FOREIGN KEY (albumId) REFERENCES albums(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS favorites (
        assetId TEXT PRIMARY KEY,
        favoritedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS trash (
        assetId TEXT PRIMARY KEY,
        deletedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    console.log('[database] Initialized successfully');
  } catch (error) {
    console.error('[database] Failed to initialize:', error);
  }
}

export async function getAllAlbums(): Promise<Album[]> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(`
      SELECT 
        a.id,
        a.name,
        a.coverAssetId,
        a.coverUri,
        a.createdAt,
        a.updatedAt,
        COUNT(ap.assetId) as photoCount
      FROM albums a
      LEFT JOIN album_photos ap ON a.id = ap.albumId
      GROUP BY a.id
      ORDER BY a.updatedAt DESC;
    `);

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      coverAssetId: r.coverAssetId,
      coverUri: r.coverUri,
      photoCount: r.photoCount || 0,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  } catch (error) {
    console.error('[database] getAllAlbums error:', error);
    return [];
  }
}

export async function getAlbum(albumId: string): Promise<Album | null> {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `
      SELECT 
        a.id,
        a.name,
        a.coverAssetId,
        a.coverUri,
        a.createdAt,
        a.updatedAt,
        COUNT(ap.assetId) as photoCount
      FROM albums a
      LEFT JOIN album_photos ap ON a.id = ap.albumId
      WHERE a.id = ?
      GROUP BY a.id;
    `,
      [albumId],
    );

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      coverAssetId: row.coverAssetId,
      coverUri: row.coverUri,
      photoCount: row.photoCount || 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  } catch (error) {
    console.error(`[database] getAlbum ${albumId} error:`, error);
    return null;
  }
}

export async function createAlbum(name: string): Promise<Album> {
  const db = await getDatabase();
  const id = `album_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = Date.now();

  await db.runAsync(
    'INSERT INTO albums (id, name, coverAssetId, coverUri, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?);',
    [id, name.trim(), null, null, now, now],
  );

  return {
    id,
    name: name.trim(),
    coverAssetId: null,
    coverUri: null,
    photoCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export async function renameAlbum(albumId: string, newName: string): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync('UPDATE albums SET name = ?, updatedAt = ? WHERE id = ?;', [
    newName.trim(),
    now,
    albumId,
  ]);
}

export async function deleteAlbum(albumId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM album_photos WHERE albumId = ?;', [albumId]);
  await db.runAsync('DELETE FROM albums WHERE id = ?;', [albumId]);
}

export async function getAlbumPhotos(albumId: string): Promise<AlbumPhotoRecord[]> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<AlbumPhotoRecord>(
      'SELECT albumId, assetId, uri, addedAt FROM album_photos WHERE albumId = ? ORDER BY addedAt DESC;',
      [albumId],
    );
    return rows;
  } catch (error) {
    console.error(`[database] getAlbumPhotos ${albumId} error:`, error);
    return [];
  }
}

export async function addPhotosToAlbum(
  albumId: string,
  photos: { assetId: string; uri?: string }[],
): Promise<void> {
  if (photos.length === 0) return;
  const db = await getDatabase();
  const now = Date.now();

  for (const photo of photos) {
    await db.runAsync(
      'INSERT OR IGNORE INTO album_photos (albumId, assetId, uri, addedAt) VALUES (?, ?, ?, ?);',
      [albumId, photo.assetId, photo.uri || null, now],
    );
  }

  // Update cover if none exists
  const currentAlbum = await getAlbum(albumId);
  if (currentAlbum && !currentAlbum.coverUri && photos.length > 0) {
    await db.runAsync(
      'UPDATE albums SET coverAssetId = ?, coverUri = ?, updatedAt = ? WHERE id = ?;',
      [photos[0].assetId, photos[0].uri || null, now, albumId],
    );
  } else {
    await db.runAsync('UPDATE albums SET updatedAt = ? WHERE id = ?;', [now, albumId]);
  }
}

export async function removePhotosFromAlbum(albumId: string, assetIds: string[]): Promise<void> {
  if (assetIds.length === 0) return;
  const db = await getDatabase();

  for (const assetId of assetIds) {
    await db.runAsync('DELETE FROM album_photos WHERE albumId = ? AND assetId = ?;', [
      albumId,
      assetId,
    ]);
  }

  // Recalculate cover photo
  const remaining = await getAlbumPhotos(albumId);
  const now = Date.now();
  if (remaining.length > 0) {
    await db.runAsync(
      'UPDATE albums SET coverAssetId = ?, coverUri = ?, updatedAt = ? WHERE id = ?;',
      [remaining[0].assetId, remaining[0].uri ?? null, now, albumId],
    );
  } else {
    await db.runAsync(
      'UPDATE albums SET coverAssetId = NULL, coverUri = NULL, updatedAt = ? WHERE id = ?;',
      [now, albumId],
    );
  }
}

export async function toggleFavorite(assetId: string): Promise<boolean> {
  const db = await getDatabase();
  const exists = await db.getFirstAsync('SELECT assetId FROM favorites WHERE assetId = ?;', [
    assetId,
  ]);

  if (exists) {
    await db.runAsync('DELETE FROM favorites WHERE assetId = ?;', [assetId]);
    return false;
  } else {
    await db.runAsync('INSERT INTO favorites (assetId, favoritedAt) VALUES (?, ?);', [
      assetId,
      Date.now(),
    ]);
    return true;
  }
}

export async function isFavorite(assetId: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync('SELECT assetId FROM favorites WHERE assetId = ?;', [
      assetId,
    ]);
    return !!row;
  } catch {
    return false;
  }
}

export async function getAllFavoriteIds(): Promise<string[]> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ assetId: string }>(
      'SELECT assetId FROM favorites ORDER BY favoritedAt DESC;',
    );
    return rows.map((r) => r.assetId);
  } catch {
    return [];
  }
}

export async function addFavorites(assetIds: string[]): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  for (const id of assetIds) {
    await db.runAsync('INSERT OR IGNORE INTO favorites (assetId, favoritedAt) VALUES (?, ?);', [
      id,
      now,
    ]);
  }
}

export async function addToTrash(assetIds: string[]): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  for (const id of assetIds) {
    await db.runAsync('INSERT OR REPLACE INTO trash (assetId, deletedAt) VALUES (?, ?);', [
      id,
      now,
    ]);
  }
}

export async function removeFromTrash(assetIds: string[]): Promise<void> {
  const db = await getDatabase();
  for (const id of assetIds) {
    await db.runAsync('DELETE FROM trash WHERE assetId = ?;', [id]);
  }
}

export async function getTrashItems(): Promise<{ assetId: string; deletedAt: number }[]> {
  try {
    const db = await getDatabase();
    return await db.getAllAsync('SELECT assetId, deletedAt FROM trash ORDER BY deletedAt DESC;');
  } catch {
    return [];
  }
}

export async function getExpiredTrashItems(
  daysOld: number,
): Promise<{ assetId: string; deletedAt: number }[]> {
  try {
    const db = await getDatabase();
    const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    return await db.getAllAsync(
      'SELECT assetId, deletedAt FROM trash WHERE deletedAt < ? ORDER BY deletedAt ASC;',
      [cutoff],
    );
  } catch {
    return [];
  }
}

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?;',
      [key],
    );
    return row ? row.value : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);',
      [key, value],
    );
  } catch (error) {
    console.error(`[database] Failed to set setting ${key}:`, error);
  }
}
