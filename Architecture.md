# Architecture

## 1. High-Level Overview

This is a React Native (Expo) photo gallery app. It runs on Android and iOS. It stores everything on-device. There is no backend, no cloud, no login screen.

The app has four main areas:

1. Gallery - Browse all photos on the device
2. Albums - Organize photos into named collections
3. Camera - Capture new photos
4. Settings - Theme toggle, storage info

Each area is a tab. Each tab has its own navigation stack. The user moves between tabs at the bottom, and within a tab they push/pop screens.

---

## 2. Technology Choices

| Concern | Library | Why |
|---------|---------|-----|
| Framework | Expo SDK 52+ (managed) | No native build config needed. Fast iteration. |
| Language | TypeScript (strict mode) | Catches bugs before runtime. |
| Navigation | @react-navigation/native + bottom-tabs + native-stack | Industry standard. Performant native transitions. |
| State | Zustand | Tiny API surface. No boilerplate. Works with React Suspense. |
| Persistent State | expo-sqlite | Album metadata, favorites, trash. Survives app restart. |
| Media Access | expo-media-library | Read device photos. Write captured/edited photos. |
| Camera | expo-camera | Access front/back camera, flash control. |
| Image Editing | expo-image-manipulator | Crop, rotate, flip, resize. GPU-accelerated. |
| File System | expo-file-system | Read/write/delete files. Cache thumbnails. |
| Gestures | react-native-gesture-handler | Pinch-to-zoom, swipe, long-press. |
| Animations | react-native-reanimated | 60fps UI thread animations. No jank. |
| Image Display | expo-image | Fast image loading with caching and blur placeholder. |
| Sharing | expo-sharing | Native share sheet. |
| Icons | @expo/vector-icons (Ionicons subset) | Only import what we use. |

---

## 3. Folder Structure

```
gallary-app/
  app.json
  App.tsx
  tsconfig.json
  package.json
  babel.config.js

  assets/
    icon.png
    splash.png
    adaptive-icon.png

  src/
    app/
      AppRoot.tsx              -- Wraps providers (theme, navigation, stores)

    navigation/
      RootNavigator.tsx        -- Bottom tab navigator
      GalleryStack.tsx         -- Stack: Grid > Viewer > Editor
      AlbumStack.tsx           -- Stack: List > Detail > Viewer > Editor
      CameraStack.tsx          -- Stack: Capture > Preview
      types.ts                 -- Route param types (typed navigation)

    screens/
      gallery/
        GalleryScreen.tsx      -- Photo grid, permission handling
        PhotoViewerScreen.tsx  -- Full-screen viewer, swipe, zoom
        PhotoEditorScreen.tsx  -- Crop, rotate, adjust, save

      albums/
        AlbumsScreen.tsx       -- List of albums
        AlbumDetailScreen.tsx  -- Photos inside one album
        CreateAlbumModal.tsx   -- Name input + photo picker

      camera/
        CameraScreen.tsx       -- Viewfinder + controls
        PreviewScreen.tsx      -- Review captured photo, save or discard

      settings/
        SettingsScreen.tsx     -- Theme, storage, about

    components/
      PhotoGrid.tsx            -- Reusable grid (used by Gallery + Album Detail)
      PhotoThumbnail.tsx       -- Single thumbnail cell
      SelectionBar.tsx         -- Appears during multi-select, shows count + actions
      FullScreenImage.tsx      -- Zoomable image with gesture handling
      BottomSheet.tsx          -- Reusable bottom sheet for menus
      ActionButton.tsx         -- Rectangular button, clear label, consistent style
      EmptyState.tsx           -- Message + optional action when list is empty
      PermissionPrompt.tsx     -- Asks user for media/camera permission
      Header.tsx               -- Screen header with back button and optional actions

    store/
      galleryStore.ts          -- Zustand: loaded photos, pagination cursor, loading state
      albumStore.ts            -- Zustand: album list, CRUD operations
      selectionStore.ts        -- Zustand: multi-select state (selected IDs, mode on/off)
      settingsStore.ts         -- Zustand: theme preference, grid columns
      trashStore.ts            -- Zustand: soft-deleted photos, 30-day cleanup

    services/
      media.ts                 -- Wraps expo-media-library. Paginated fetch, permissions.
      camera.ts                -- Wraps expo-camera. Capture, save to media library.
      editor.ts                -- Wraps expo-image-manipulator. Crop, rotate, flip, save.
      database.ts              -- Wraps expo-sqlite. Schema, queries for albums/favorites/trash.
      storage.ts               -- Wraps expo-file-system. Thumbnail cache, storage usage calc.

    hooks/
      usePermission.ts         -- Request and track a single permission
      usePhotoPagination.ts    -- Infinite scroll logic for media library
      usePinchZoom.ts          -- Gesture handler for zoom
      useDebounce.ts           -- Debounce search/filter input

    theme/
      tokens.ts                -- Color palette, spacing scale, font sizes, radii
      light.ts                 -- Light theme colors
      dark.ts                  -- Dark theme colors
      ThemeContext.tsx          -- React context for current theme + toggle function

    types/
      photo.ts                 -- Photo type definition
      album.ts                 -- Album type definition
      editor.ts                -- Editor state type definition

    utils/
      format.ts                -- Format bytes, format dates
      layout.ts                -- Calculate grid item size from screen width
      constants.ts             -- Page size, animation durations, grid gap
```

---

## 4. Data Flow

### 4.1 Reading Photos from Device

```
User opens Gallery tab
  -> GalleryScreen mounts
  -> usePermission("mediaLibrary") checks permission
  -> If denied: show PermissionPrompt
  -> If granted: call media.ts fetchPhotos(cursor, pageSize)
  -> expo-media-library returns a page of assets
  -> galleryStore.addPhotos(assets) appends to state
  -> PhotoGrid renders from galleryStore.photos
  -> User scrolls to bottom -> usePhotoPagination calls fetchPhotos(nextCursor)
```

### 4.2 Album Management

```
Albums are stored in SQLite. Device photos are NOT copied.
An album row has: id, name, createdAt, updatedAt
An album_photo row has: albumId, assetId (references expo-media-library asset ID)

Creating album:
  -> User types name in CreateAlbumModal
  -> database.ts INSERT INTO albums
  -> albumStore refreshes from database

Adding photo to album:
  -> User multi-selects photos, taps "Add to Album"
  -> BottomSheet shows album list
  -> User picks album
  -> database.ts INSERT INTO album_photos for each selected assetId
  -> albumStore refreshes

Viewing album:
  -> AlbumDetailScreen receives albumId
  -> database.ts SELECT assetId FROM album_photos WHERE albumId = ?
  -> media.ts getAssetsByIds(assetIds) fetches full asset info
  -> PhotoGrid renders
```

### 4.3 Photo Editing

```
User taps Edit on PhotoViewerScreen
  -> Navigate to PhotoEditorScreen with photo URI
  -> Editor state is local React state (not in Zustand)
  -> User applies crop/rotate/adjust
  -> Each operation calls editor.ts which uses expo-image-manipulator
  -> Result is a new temporary URI
  -> User taps Save
  -> editor.ts saves to media library as a NEW photo (non-destructive)
  -> Navigate back, gallery refreshes
```

### 4.4 Trash / Delete

```
Soft delete:
  -> User selects photos, taps Delete
  -> Confirmation dialog appears
  -> trashStore moves assetIds to trash list (stored in SQLite with deletedAt timestamp)
  -> Photos are hidden from gallery view (filtered out)

Permanent delete (after 30 days or manual):
  -> media.ts deleteAssets(assetIds) removes from device
  -> database.ts removes from trash table

Restore:
  -> User goes to Settings > Trash
  -> Selects photos, taps Restore
  -> trashStore removes from trash list
  -> Photos reappear in gallery
```

---

## 5. SQLite Schema

```sql
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  coverAssetId TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS album_photos (
  albumId TEXT NOT NULL,
  assetId TEXT NOT NULL,
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
```

---

## 6. Navigation Map

```
Bottom Tabs
  |
  +-- Gallery Tab (GalleryStack)
  |     |-- GalleryScreen (photo grid)
  |     |-- PhotoViewerScreen (full screen, swipe, zoom)
  |     +-- PhotoEditorScreen (crop, rotate, adjust)
  |
  +-- Albums Tab (AlbumStack)
  |     |-- AlbumsScreen (album list)
  |     |-- AlbumDetailScreen (photos in album)
  |     |-- PhotoViewerScreen (reused)
  |     +-- PhotoEditorScreen (reused)
  |
  +-- Camera Tab (CameraStack)
  |     |-- CameraScreen (viewfinder)
  |     +-- PreviewScreen (review + save)
  |
  +-- Settings Tab (single screen)
        +-- SettingsScreen
```

---

## 7. Performance Rules

These rules apply to every screen and component:

1. PhotoGrid uses FlatList with `numColumns`. Never ScrollView with manual layout.
2. Each thumbnail uses `expo-image` with `contentFit="cover"` and `recyclingKey`.
3. FlatList sets `windowSize={5}`, `maxToRenderPerBatch={10}`, `removeClippedSubviews={true}`.
4. Full-screen images load the full-resolution URI. Grid thumbnails request a smaller size from media library.
5. All gesture animations run on the UI thread via `react-native-reanimated` worklets.
6. No inline arrow functions in FlatList `renderItem`. Extract to `useCallback`.
7. Heavy operations (database queries, image manipulation) run async. Show a simple loading indicator, never block the UI.
8. Memoize components that receive stable props with `React.memo`.

---

## 8. Permission Handling

The app requires two permissions:

1. Media Library (read + write) - Required for Gallery and Albums tabs
2. Camera - Required for Camera tab only

Each permission follows this flow:

1. On screen mount, check current permission status
2. If "undetermined", show PermissionPrompt component explaining why the permission is needed, with a "Grant Access" button
3. If "denied", show PermissionPrompt with "Open Settings" button that opens the system settings page
4. If "granted", proceed normally
5. Never request both permissions at app launch. Request each when the user first visits the relevant tab.

---

## 9. Error Handling

Every service function wraps its logic in try/catch:

- media.ts: If fetching fails, return empty array and set galleryStore.error
- database.ts: If query fails, log error and return fallback (empty array or null)
- editor.ts: If manipulation fails, show toast "Could not edit photo" and stay on editor screen
- camera.ts: If capture fails, show toast "Could not capture photo" and stay on camera screen

Errors are shown as simple text banners at the top of the screen (not modals, not popups). They auto-dismiss after 4 seconds.

---

## 10. Testing Strategy

| Layer | Tool | What to test |
|-------|------|--------------|
| Unit | Jest | Utility functions (format.ts, layout.ts), store logic |
| Component | React Native Testing Library | Each component renders, responds to press, shows correct text |
| Integration | Jest + mocked services | Screen-level: GalleryScreen loads photos, AlbumsScreen shows list |
| Manual | Expo Go on device | Gestures, camera, real photo library, performance |

Every phase in Phases.md includes specific test cases. A phase is not complete until its tests pass.

