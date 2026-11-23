# Implementation Phases

Each phase is self-contained and testable. Complete one phase fully before starting the next. Each level within a phase builds on the previous level. Every level lists the exact files to create or modify, what the code should do, and how to verify it works.

---

## Phase 1: Project Skeleton

Goal: A running app with tab navigation, placeholder screens, and the theme system. Nothing functional yet, but the structure is solid and you can tap between tabs.

### Level 1.1: Initialize Project

**Create these files:**

- Run `npx create-expo-app gallary-app --template blank-typescript` (or set up manually)
- `tsconfig.json` with strict mode enabled
- `app.json` with app name "Gallery", slug "gallary-app", orientation "portrait"
- `.eslintrc.js` with recommended React Native rules
- `.prettierrc` with singleQuote: true, trailingComma: "all", printWidth: 100

**Install dependencies:**

```
npx expo install expo-image expo-media-library expo-camera expo-image-manipulator
npx expo install expo-file-system expo-sqlite expo-sharing expo-status-bar
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install zustand
npx expo install @expo/vector-icons
```

**Verification:**
- Run `npx expo start`. App launches in Expo Go or simulator without errors.
- The default Expo welcome screen appears.

---

### Level 1.2: Theme System

**Create these files:**

`src/theme/tokens.ts`
- Export a spacing scale: `{ xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 }`
- Export font sizes: `{ caption: 12, body: 14, subtitle: 16, title: 20, heading: 28 }`
- Export radii: `{ none: 0, sm: 4, md: 8, lg: 12 }` (note: no pill shapes, max radius is 12)
- Export animation durations: `{ fast: 150, normal: 250, slow: 400 }`

`src/theme/light.ts`
- Export light theme colors:
  - `background: "#FAFAFA"` (warm off-white, not pure white)
  - `surface: "#FFFFFF"`
  - `surfaceAlt: "#F2F2F2"` (for cards, album covers)
  - `text: "#1A1A1A"` (near-black, high contrast)
  - `textSecondary: "#6B6B6B"` (muted, still passes WCAG AA on white)
  - `textTertiary: "#999999"` (captions only on light backgrounds)
  - `border: "#E5E5E5"`
  - `accent: "#2563EB"` (blue, not purple)
  - `accentLight: "#DBEAFE"`
  - `danger: "#DC2626"` (red for delete)
  - `dangerLight: "#FEE2E2"`
  - `icon: "#4B4B4B"`
  - `iconMuted: "#AAAAAA"`
  - `overlay: "rgba(0,0,0,0.5)"`
  - `tabBar: "#FFFFFF"`
  - `tabBarBorder: "#E5E5E5"`
  - `statusBar: "dark"` (dark icons on light background)

`src/theme/dark.ts`
- Export dark theme colors:
  - `background: "#0A0A0A"` (true dark, not gray)
  - `surface: "#1A1A1A"`
  - `surfaceAlt: "#252525"`
  - `text: "#F5F5F5"`
  - `textSecondary: "#A0A0A0"`
  - `textTertiary: "#707070"`
  - `border: "#2A2A2A"`
  - `accent: "#60A5FA"` (lighter blue for dark backgrounds)
  - `accentLight: "#1E3A5F"`
  - `danger: "#EF4444"`
  - `dangerLight: "#450A0A"`
  - `icon: "#D4D4D4"`
  - `iconMuted: "#666666"`
  - `overlay: "rgba(0,0,0,0.7)"`
  - `tabBar: "#0A0A0A"`
  - `tabBarBorder: "#1A1A1A"`
  - `statusBar: "light"`

`src/theme/ThemeContext.tsx`
- Create a React context that holds: current theme colors, isDark boolean, toggle function
- Default to system preference using `useColorScheme()` from react-native
- Persist preference to AsyncStorage (or expo-sqlite later)
- Export `useTheme()` hook that returns `{ colors, isDark, toggleTheme }`
- Export `ThemeProvider` component

**Verification:**
- Import ThemeProvider in App.tsx, wrap the app
- Create a temporary test screen that shows background color and a text element
- Toggle theme programmatically and confirm colors change
- Text is readable on both light and dark backgrounds (check contrast visually)

---

### Level 1.3: Navigation Shell

**Create these files:**

`src/navigation/types.ts`
- Define route param types for each stack:
  - GalleryStackParams: { Gallery: undefined; PhotoViewer: { assetId: string }; PhotoEditor: { uri: string } }
  - AlbumStackParams: { Albums: undefined; AlbumDetail: { albumId: string; albumName: string }; PhotoViewer: { assetId: string }; PhotoEditor: { uri: string } }
  - CameraStackParams: { Camera: undefined; Preview: { uri: string } }
  - SettingsStackParams: { Settings: undefined }

`src/screens/gallery/GalleryScreen.tsx`
- Placeholder: a View with the screen name as text, centered, using theme colors

`src/screens/albums/AlbumsScreen.tsx`
- Same placeholder pattern

`src/screens/camera/CameraScreen.tsx`
- Same placeholder pattern

`src/screens/settings/SettingsScreen.tsx`
- Same placeholder pattern

`src/navigation/GalleryStack.tsx`
- Native stack navigator with GalleryScreen as the initial route
- Header hidden (we will build custom headers later)

`src/navigation/AlbumStack.tsx`
- Native stack navigator with AlbumsScreen as the initial route

`src/navigation/CameraStack.tsx`
- Native stack navigator with CameraScreen as the initial route

`src/navigation/RootNavigator.tsx`
- Bottom tab navigator with 4 tabs: Gallery, Albums, Camera, Settings
- Tab bar styling: background from theme.tabBar, border from theme.tabBarBorder
- Tab icons: use Ionicons: "images-outline"/"images" for Gallery, "folder-outline"/"folder" for Albums, "camera-outline"/"camera" for Camera, "settings-outline"/"settings" for Settings
- Active tab color: theme.accent. Inactive: theme.iconMuted.
- Tab labels: "Gallery", "Albums", "Camera", "Settings" in body font size
- No tab bar animation effects. Simple color change on active/inactive.
- Tab bar has a subtle top border, no shadow, no elevation

`src/app/AppRoot.tsx`
- Wraps everything: ThemeProvider > NavigationContainer > RootNavigator
- StatusBar component from expo-status-bar using theme.statusBar

`App.tsx`
- Renders AppRoot

**Verification:**
- App launches with 4 tabs at the bottom
- Tapping each tab shows the corresponding placeholder screen
- Active tab icon and label are blue (accent color)
- Tab bar respects light/dark theme
- No navigation errors in console
- Status bar icons match the theme (dark icons on light bg, light icons on dark bg)

---

### Level 1.4: Common Components

**Create these files:**

`src/components/Header.tsx`
- Props: title (string), leftAction (optional: { icon: string, onPress: function }), rightActions (optional: array of { icon: string, onPress: function, accessibilityLabel: string })
- Renders a row: left icon button, centered title text, right icon buttons
- Uses theme colors for background (surface), text (text), icons (icon)
- Height: 56px. Horizontal padding: md (16px).
- Title font: subtitle size (16), weight 600
- Each icon button has a 44x44 minimum touch target
- Each icon button has an accessibilityLabel

`src/components/ActionButton.tsx`
- Props: label (string), onPress (function), variant ("primary" | "secondary" | "danger"), disabled (boolean), loading (boolean), accessibilityLabel (string)
- Primary: background accent, text white, border radius sm (4px). NOT pill shaped.
- Secondary: background transparent, border 1px accent, text accent, border radius sm.
- Danger: background danger, text white, border radius sm.
- Disabled: opacity 0.4, press handler disabled
- Loading: show ActivityIndicator instead of label
- Min height: 48px. Horizontal padding: lg (24px).
- Text: subtitle size (16), weight 600, centered

`src/components/EmptyState.tsx`
- Props: title (string), message (string), actionLabel (optional string), onAction (optional function)
- Renders centered in parent: title in heading size, message in body size with textSecondary color, optional ActionButton below
- No illustration/image. Clean text only.

`src/components/PermissionPrompt.tsx`
- Props: title (string), message (string), buttonLabel (string), onPress (function)
- Same layout as EmptyState but specifically for permission requests
- Button opens either permission dialog or system settings

**Verification:**
- Render Header on one placeholder screen with a title and one right action. Tap the action, confirm onPress fires (console.log).
- Render ActionButton in all 3 variants. Confirm styling matches spec. Tap fires onPress.
- Render EmptyState with and without action button. Confirm layout is centered.
- Each interactive element has an accessibilityLabel.
- Run the app in both light and dark theme. All components look correct in both.

---

## Phase 2: Gallery

Goal: Browse all device photos in a grid. Tap a photo to view it full-screen with swipe and zoom.

### Level 2.1: Permission + Photo Loading

**Create these files:**

`src/hooks/usePermission.ts`
- Takes a permission type ("mediaLibrary" or "camera")
- Returns { status, requestPermission, openSettings }
- Uses expo-media-library for mediaLibrary permission, expo-camera for camera permission
- status is "undetermined" | "granted" | "denied"

`src/services/media.ts`
- `requestMediaPermission()`: Requests read/write access to media library
- `fetchPhotos(options: { first: number, after?: string, sortBy?: string })`: Returns { assets: Asset[], endCursor: string, hasNextPage: boolean }
  - Default sort: by creation date, newest first
  - Default page size: 50
  - Only fetch images (mediaType: "photo"), not videos
- `getAssetById(id: string)`: Returns a single Asset or null
- `getAssetsByIds(ids: string[])`: Returns array of Assets

`src/store/galleryStore.ts`
- State: photos (array), endCursor (string | null), hasNextPage (boolean), isLoading (boolean), error (string | null)
- Actions:
  - `loadInitial()`: Calls fetchPhotos with no cursor, replaces photos
  - `loadMore()`: Calls fetchPhotos with current endCursor, appends to photos
  - `refresh()`: Resets cursor, calls loadInitial
  - `setError(msg)`: Sets error state
  - `clearError()`: Clears error state

**Modify:** `src/screens/gallery/GalleryScreen.tsx`
- On mount, check mediaLibrary permission
- If not granted, show PermissionPrompt
- If granted, call galleryStore.loadInitial()
- Show a simple ActivityIndicator while loading
- For now, just render the count of loaded photos as text (grid comes in next level)

**Verification:**
- Launch app, go to Gallery tab
- First time: PermissionPrompt appears asking for media access
- Grant permission: screen shows "Loaded X photos" text
- Deny permission: PermissionPrompt shows with "Open Settings" button
- Check console: no errors, assets are logged correctly
- Kill and reopen app: permission is remembered, photos load immediately

---

### Level 2.2: Photo Grid

**Create these files:**

`src/utils/layout.ts`
- `getGridItemSize(screenWidth: number, numColumns: number, gap: number)`: Returns the width/height for each grid cell
- Default: 3 columns, gap of 2px

`src/components/PhotoThumbnail.tsx`
- Props: uri (string), size (number), onPress (function), onLongPress (function), isSelected (boolean), accessibilityLabel (string)
- Renders expo-image with contentFit="cover", width and height = size
- If isSelected, show a subtle blue border (2px, accent color) and a small checkmark icon in the top-right corner
- Has a very subtle fade-in when the image loads (opacity 0 to 1, duration: fast)
- accessibilityLabel describes the photo (e.g., "Photo from November 22, 2026")

`src/components/PhotoGrid.tsx`
- Props: photos (array of { id, uri, date }), onPhotoPress (function), onPhotoLongPress (function), onEndReached (function), onRefresh (function), isRefreshing (boolean), selectedIds (Set), ListEmptyComponent (ReactNode)
- Uses FlatList with numColumns=3
- ItemSeparatorComponent: not needed since gap is handled by item margins
- Each item has a 1px margin on all sides (creates the grid gap)
- keyExtractor uses photo id
- renderItem is wrapped in useCallback
- Performance props: windowSize=5, maxToRenderPerBatch=10, removeClippedSubviews=true, getItemLayout for fixed-size items
- Pull-to-refresh using RefreshControl with onRefresh
- onEndReached fires when user scrolls within 2 screens of the bottom (onEndReachedThreshold=2)

**Modify:** `src/screens/gallery/GalleryScreen.tsx`
- Replace text count with PhotoGrid
- Pass galleryStore.photos, loadMore for onEndReached, refresh for onRefresh
- When no photos exist, show EmptyState with message "No photos on this device"
- Header: title "Gallery", no back button

**Verification:**
- Gallery shows photos in a 3-column grid
- Thumbnails are square and fill the width properly
- Scrolling is smooth (no dropped frames)
- Pull down to refresh works (spinner appears, photos reload)
- Scroll to bottom: more photos load automatically
- Empty device (or simulator with no photos): EmptyState message appears
- Rotate device: grid recalculates (or stays portrait if locked)
- Both light and dark themes look correct

---

### Level 2.3: Full-Screen Photo Viewer

**Create these files:**

`src/components/FullScreenImage.tsx`
- Props: uri (string), onTap (function), accessibilityLabel (string)
- Renders expo-image at full screen resolution
- Pinch-to-zoom using react-native-gesture-handler PinchGestureHandler + react-native-reanimated
  - Min scale: 1 (original). Max scale: 5.
  - Double-tap toggles between 1x and 2x zoom
  - When zoomed in, pan gesture lets user drag the image
  - When zoomed out (scale <= 1), pan is disabled (so swipe between photos works)
- Single tap fires onTap (used to toggle header/footer visibility)
- Background: black always (regardless of theme)

`src/screens/gallery/PhotoViewerScreen.tsx`
- Receives assetId via route params
- Loads the full asset info using media.ts getAssetById
- Shows a FlatList in horizontal mode with pagingEnabled, displaying one FullScreenImage per page
- Initial scroll position: the tapped photo
- The full photo list comes from galleryStore.photos
- Header (overlay on top of image): back button on left, share icon + edit icon + delete icon on right
  - Header background: semi-transparent black
  - Icons: white
  - Tapping the image toggles header visibility (fade in/out, duration: fast)
- Footer (overlay on bottom): filename, date, resolution (e.g., "3024 x 4032"), file size
  - Same semi-transparent black background
  - Text: white, caption size

**Modify:** `src/screens/gallery/GalleryScreen.tsx`
- When user taps a photo in the grid, navigate to PhotoViewerScreen with assetId
- When user long-presses a photo, enter multi-select mode (implemented in Phase 4)

**Modify:** `src/navigation/GalleryStack.tsx`
- Add PhotoViewerScreen route

**Verification:**
- Tap a photo in the grid: full-screen viewer opens with that photo visible
- Swipe left/right: previous/next photo loads smoothly
- Pinch to zoom in: image scales up, can pan around
- Release pinch below 1x: snaps back to 1x
- Double-tap: zoom to 2x. Double-tap again: zoom to 1x.
- Single tap: header and footer toggle visibility
- Back button returns to gallery grid at the same scroll position
- Photo info (filename, date, size) is displayed correctly in footer
- Works on both light and dark theme (viewer itself is always dark)
- Accessibility: images have alt text labels

---

## Phase 3: Albums

Goal: Create named albums, add photos to them, browse album contents.

### Level 3.1: Database Setup

**Create these files:**

`src/services/database.ts`
- `initDatabase()`: Opens SQLite database, runs CREATE TABLE IF NOT EXISTS for all 4 tables (albums, album_photos, favorites, trash). Called once at app startup.
- `getAllAlbums()`: Returns array of { id, name, coverAssetId, photoCount, createdAt, updatedAt }. The photoCount is a COUNT query joined from album_photos.
- `getAlbum(albumId)`: Returns single album or null
- `createAlbum(name)`: Inserts new album with generated UUID, returns the album object
- `renameAlbum(albumId, newName)`: Updates album name
- `deleteAlbum(albumId)`: Deletes album (cascade deletes album_photos entries)
- `getAlbumPhotoIds(albumId)`: Returns array of assetId strings
- `addPhotosToAlbum(albumId, assetIds)`: Inserts album_photo rows (ignore duplicates)
- `removePhotosFromAlbum(albumId, assetIds)`: Deletes album_photo rows
- `setAlbumCover(albumId, assetId)`: Updates album coverAssetId
- `toggleFavorite(assetId)`: Inserts or deletes from favorites table
- `isFavorite(assetId)`: Returns boolean
- `getAllFavoriteIds()`: Returns array of assetId strings
- `addToTrash(assetIds)`: Inserts into trash with current timestamp
- `removeFromTrash(assetIds)`: Deletes from trash
- `getTrashItems()`: Returns array of { assetId, deletedAt }
- `getExpiredTrashItems(daysOld: number)`: Returns items older than daysOld days

`src/store/albumStore.ts`
- State: albums (array), isLoading (boolean), error (string | null)
- Actions:
  - `loadAlbums()`: Calls getAllAlbums, sets state
  - `createAlbum(name)`: Calls database createAlbum, then loadAlbums
  - `deleteAlbum(albumId)`: Calls database deleteAlbum, then loadAlbums
  - `renameAlbum(albumId, name)`: Calls database renameAlbum, then loadAlbums

**Modify:** `src/app/AppRoot.tsx`
- Call initDatabase() on app startup (useEffect, run once)

**Verification:**
- App starts without database errors
- In a test screen or via console, create an album, verify it appears in getAllAlbums()
- Create, rename, delete album: data persists across app restarts
- Kill app, reopen: albums are still there

---

### Level 3.2: Albums List Screen

**Modify:** `src/screens/albums/AlbumsScreen.tsx`
- On mount, call albumStore.loadAlbums()
- Show list of albums as cards in a 2-column grid
- Each card shows: cover photo (or a gray placeholder if no cover), album name below, photo count below name
  - Card background: surfaceAlt. Border radius: md (8px).
  - Album name: subtitle size, weight 600, text color
  - Photo count: caption size, textSecondary color
  - Card has shadow: none. Border: 1px border color. Clean flat design.
- Floating action button in bottom-right: "+" icon, accent color background, white icon
  - Touch target: 56x56. Border radius: md (8px). NOT circular, NOT pill.
  - accessibilityLabel: "Create new album"
- Empty state: "No albums yet" with "Create Album" button
- Header: title "Albums"

**Create:** `src/screens/albums/CreateAlbumModal.tsx`
- Modal that slides up from bottom (or a simple screen)
- Text input for album name. Placeholder: "Album name"
  - Input style: border 1px border color, border radius sm (4px), padding md, body font
  - Focus state: border changes to accent color
- Two buttons below: "Cancel" (secondary) and "Create" (primary)
- Create is disabled if name is empty
- On create: call albumStore.createAlbum, close modal
- Input auto-focuses when modal opens

**Modify:** `src/navigation/AlbumStack.tsx`
- Add CreateAlbumModal as a modal presentation

**Verification:**
- Albums tab shows empty state initially
- Tap "+": create album modal appears
- Type a name, tap Create: modal closes, album appears in the list with 0 photos
- Album card shows gray placeholder (no cover photo yet)
- Create multiple albums: they all appear in the 2-column grid
- Long names truncate with ellipsis (single line)
- Both themes look correct

---

### Level 3.3: Album Detail + Add Photos

**Create:** `src/screens/albums/AlbumDetailScreen.tsx`
- Receives albumId and albumName via route params
- Header: title is album name, back button on left, right actions: "add photo" icon and overflow menu icon
- On mount: load photo IDs from database, then load full assets from media library
- Display photos using PhotoGrid component (reused from Gallery)
- Empty state: "This album is empty" with "Add Photos" button
- Tapping a photo navigates to PhotoViewerScreen (reused)
- "Add Photos" flow:
  - Opens a new screen (or modal) showing all device photos in a grid with multi-select enabled
  - User selects photos by tapping (checkmark overlay appears)
  - Header shows count: "X selected"
  - "Add" button in top-right. Tapping it calls database.addPhotosToAlbum, then refreshes the album view.
  - First added photo becomes the album cover automatically (if no cover set)

**Modify:** `src/navigation/AlbumStack.tsx`
- Add AlbumDetailScreen and PhotoViewerScreen routes

**Verification:**
- Tap an album card: AlbumDetailScreen opens with album name as title
- Empty album shows empty state
- Tap "Add Photos": selection grid appears with all device photos
- Tap photos to select (checkmark appears), tap again to deselect
- Tap "Add": photos appear in the album
- Album card on AlbumsScreen now shows the cover photo and correct count
- Tap a photo in the album: full-screen viewer opens
- Navigate back: album content is preserved

---

### Level 3.4: Album Management (Rename, Delete, Remove Photos)

**Modify:** `src/screens/albums/AlbumsScreen.tsx`
- Long-press on an album card: show a bottom sheet with options "Rename" and "Delete"
- Rename: show text input with current name, "Save" button
- Delete: show confirmation "Delete album? Photos will not be deleted from your device." Two buttons: "Cancel" (secondary) and "Delete" (danger)

**Modify:** `src/screens/albums/AlbumDetailScreen.tsx`
- Overflow menu (three dots icon) in header: options "Rename Album", "Delete Album"
- Multi-select mode: long-press a photo to enter multi-select
  - SelectionBar appears at bottom: "X selected" text, "Remove" button, "Cancel" button
  - Remove: removes selected photos from album (not from device)

**Create:** `src/components/BottomSheet.tsx`
- Props: isVisible (boolean), onClose (function), children (ReactNode)
- Slides up from bottom with a backdrop overlay
- Rounded top corners (lg radius)
- Has a small drag handle at the top (40px wide, 4px tall, centered, surfaceAlt color)
- Tapping backdrop or swiping down closes it
- Background: surface color

**Create:** `src/components/SelectionBar.tsx`
- Props: count (number), actions (array of { label, onPress, variant }), onCancel (function)
- Fixed bar at the bottom of screen
- Left: "X selected" text. Right: action buttons.
- Background: surface with top border

**Verification:**
- Long-press album card: bottom sheet appears with Rename and Delete
- Rename: name updates in the list
- Delete: album disappears, photos still in device gallery
- In album detail, long-press photo: multi-select mode activates
- Select photos, tap Remove: photos removed from album, still in gallery
- SelectionBar shows correct count
- Cancel exits multi-select mode
- Bottom sheet can be dismissed by tapping backdrop or swiping down

---

## Phase 4: Camera

Goal: Capture photos using the device camera and save them to the gallery.

### Level 4.1: Camera Screen

**Create:** `src/services/camera.ts`
- `requestCameraPermission()`: Request camera permission
- `capturePhoto(cameraRef, options)`: Takes a photo, returns { uri, width, height }
  - options: { quality: number (0-1), skipProcessing: boolean }
  - Default quality: 0.85

**Modify:** `src/screens/camera/CameraScreen.tsx`
- On mount, check camera permission with usePermission
- If not granted, show PermissionPrompt
- If granted, render expo-camera CameraView filling the screen
- Controls overlay at the bottom:
  - Center: shutter button (64x64, white circle with 2px border, border radius md, NOT circular. Actually for shutter: use a circle here, 64px diameter, since it is a camera convention, but give it a subtle square outline container)
    - Actually, let me reconsider: use a large rectangular button with rounded corners (lg radius, 12px), 72x72, white background, with a smaller dark circle (40px) inside as a visual indicator. This avoids the typical circular button while remaining intuitive.
  - Left: flip camera icon (front/back toggle). accessibilityLabel: "Switch camera"
  - Right: flash toggle icon. Cycles: auto > on > off. Shows current state icon. accessibilityLabel: "Flash mode: auto/on/off"
- Controls background: semi-transparent black gradient from bottom
- Camera preview has NO filters, NO overlays, NO frame guides (clean viewfinder)
- Status bar hidden on this screen

**Verification:**
- Navigate to Camera tab: permission prompt or camera viewfinder appears
- Camera shows live preview
- Tap flip: switches between front and back camera
- Tap flash: cycles through auto/on/off (icon changes)
- Viewfinder is clean, no clutter

---

### Level 4.2: Capture and Preview

**Create:** `src/screens/camera/PreviewScreen.tsx`
- Receives uri via route params
- Shows the captured photo full-screen
- Bottom controls:
  - Left: "Retake" button (secondary variant). Returns to CameraScreen.
  - Right: "Save" button (primary variant). Saves to media library and navigates back.
- Saving flow:
  1. Show loading state on Save button
  2. Call expo-media-library createAssetAsync(uri)
  3. Refresh galleryStore
  4. Navigate back to CameraScreen (or Gallery tab)
  5. Brief toast/text: "Photo saved"

**Modify:** `src/screens/camera/CameraScreen.tsx`
- Tap shutter: call capturePhoto, navigate to PreviewScreen with the URI
- Brief shutter animation: screen flashes white for 100ms (using reanimated opacity)

**Modify:** `src/navigation/CameraStack.tsx`
- Add PreviewScreen route

**Verification:**
- Tap shutter button: screen flashes briefly, preview screen opens
- Preview shows the captured photo
- "Retake": returns to camera, can capture again
- "Save": saves to device, photo appears in Gallery tab
- "Save" button shows loading spinner during save
- Back button on preview returns to camera without saving

---

## Phase 5: Photo Editing

Goal: Crop, rotate, flip, and adjust photos. Save as a new copy.

### Level 5.1: Editor Screen Structure

**Create:** `src/services/editor.ts`
- `cropImage(uri, crop: { originX, originY, width, height })`: Returns new URI
- `rotateImage(uri, degrees: 90 | 180 | 270)`: Returns new URI
- `flipImage(uri, direction: "horizontal" | "vertical")`: Returns new URI
- `adjustImage(uri, adjustments: { brightness?, contrast?, saturation? })`: Returns new URI
  - Note: expo-image-manipulator does not support brightness/contrast natively. Use a workaround: apply these as CSS-like filters by manipulating the image. If not feasible, skip brightness/contrast and only offer crop, rotate, and flip. Document the limitation.
- `saveEditedImage(uri)`: Saves to media library using createAssetAsync, returns the new asset

**Create:** `src/types/editor.ts`
```typescript
type EditorTool = "crop" | "rotate" | "adjust";

interface CropState {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

interface EditorState {
  sourceUri: string;
  currentUri: string;
  activeTool: EditorTool | null;
  crop: CropState | null;
  rotation: 0 | 90 | 180 | 270;
  isProcessing: boolean;
}
```

**Create:** `src/screens/gallery/PhotoEditorScreen.tsx`
- Receives uri via route params
- Layout:
  - Top: Header with "Cancel" (left, text button) and "Save" (right, primary button)
  - Center: image preview (shows the current edited state)
  - Bottom: tool bar with tool buttons in a row
- Tool buttons: "Crop", "Rotate", "Flip", each as a text label with icon above
  - Style: simple vertical stack of icon + label, no background, tapping highlights with accentLight
  - Active tool has accent color text and icon
- State management: local React state (useState), not Zustand
- Cancel: discard changes, navigate back
- Save: call saveEditedImage, refresh gallery, navigate back

**Modify:** `src/navigation/GalleryStack.tsx`
- Add PhotoEditorScreen route

**Modify:** `src/screens/gallery/PhotoViewerScreen.tsx`
- Tap edit icon: navigate to PhotoEditorScreen with the current photo URI

**Verification:**
- In full-screen viewer, tap edit: editor opens with the photo
- Three tool buttons visible at the bottom
- Cancel returns to viewer without changes
- Save button is disabled until an edit is made

---

### Level 5.2: Rotate and Flip

**Modify:** `src/screens/gallery/PhotoEditorScreen.tsx`
- When "Rotate" tool is active, show sub-controls:
  - "Rotate Left" button (counter-clockwise 90)
  - "Rotate Right" button (clockwise 90)
  - "Flip H" button (horizontal flip)
  - "Flip V" button (vertical flip)
- Each button applies the operation immediately to the preview image
- Operations are chained: rotate, then flip, etc. Each builds on the previous result.
- The preview image updates after each operation (show brief loading indicator if needed)

**Verification:**
- Tap Rotate tool, tap Rotate Right: image rotates 90 degrees clockwise
- Tap again: 180. Again: 270. Again: back to 0.
- Tap Flip H: image mirrors horizontally
- Apply rotate + flip: both operations combine correctly
- Save: new photo appears in gallery with the edits applied
- Original photo is unchanged (non-destructive)

---

### Level 5.3: Crop

**Create:** `src/components/editor/CropOverlay.tsx`
- Renders over the image preview
- Shows a rectangular crop region with:
  - Semi-transparent dark overlay outside the crop region
  - White border (2px) around the crop region
  - 4 corner handles (small white squares, 20x20, at each corner)
  - Draggable handles: user drags a corner to resize the crop region
  - Draggable center: user drags inside the crop region to move it
  - Maintains minimum crop size (50x50 logical pixels)
- Preset aspect ratios shown as buttons below the image:
  - "Free", "1:1", "4:3", "16:9"
  - Selecting a preset constrains the crop region to that ratio
  - "Free" removes the constraint

**Modify:** `src/screens/gallery/PhotoEditorScreen.tsx`
- When "Crop" tool is active:
  - CropOverlay appears on the image
  - Preset ratio buttons appear below
  - "Apply" button appears (applies the crop to the image)
  - After applying, the preview updates with the cropped image

**Verification:**
- Tap Crop tool: overlay appears on image
- Drag corners: crop region resizes
- Drag inside: crop region moves
- Select "1:1": crop region snaps to square
- Select "16:9": crop region becomes wide
- Tap Apply: image is cropped to the selected region
- Save: cropped photo saved correctly to gallery
- Crop + rotate together: both operations apply correctly

---

## Phase 6: Multi-Select, Delete, Share, Favorites

Goal: Select multiple photos for bulk operations. Delete with trash. Share via native sheet. Mark favorites.

### Level 6.1: Multi-Select Mode

**Create:** `src/store/selectionStore.ts`
- State: isSelecting (boolean), selectedIds (Set of strings)
- Actions:
  - `enterSelectionMode()`: Sets isSelecting to true
  - `exitSelectionMode()`: Sets isSelecting to false, clears selectedIds
  - `toggleSelection(id)`: Adds or removes id from selectedIds
  - `selectAll(ids)`: Adds all given ids
  - `clearSelection()`: Empties selectedIds

**Modify:** `src/screens/gallery/GalleryScreen.tsx`
- Long-press a photo: enter selection mode (call selectionStore.enterSelectionMode and toggleSelection)
- In selection mode:
  - Each tap toggles selection (instead of opening viewer)
  - SelectionBar appears at bottom with count and action buttons: "Share", "Add to Album", "Favorite", "Delete"
  - Header changes: left shows "Cancel" text button, title shows "X selected"
- Exiting selection mode: tap Cancel or back button

**Modify:** `src/components/PhotoThumbnail.tsx`
- When isSelected is true: show checkmark overlay and blue border
- When selection mode is active but photo is not selected: show empty circle in top-right corner

**Verification:**
- Long-press a photo: selection mode activates, that photo is selected (checkmark visible)
- Tap more photos: they get selected, count updates
- Tap a selected photo: it deselects
- Cancel: exits selection mode, no photos selected
- SelectionBar shows correct count
- Action buttons are present (functionality tested in next levels)

---

### Level 6.2: Delete and Trash

**Create:** `src/store/trashStore.ts`
- State: trashedIds (Set of strings), isLoading (boolean)
- Actions:
  - `loadTrash()`: Reads from database, populates trashedIds
  - `trashPhotos(assetIds)`: Calls database.addToTrash, adds to trashedIds
  - `restorePhotos(assetIds)`: Calls database.removeFromTrash, removes from trashedIds
  - `permanentlyDelete(assetIds)`: Calls media.ts deleteAssets, then removes from trash table
  - `cleanupExpired()`: Gets expired items (30 days), permanently deletes them

**Modify:** `src/screens/gallery/GalleryScreen.tsx`
- Filter out trashedIds from the displayed photos
- Delete action in SelectionBar:
  1. Show confirmation: "Move X photos to trash? They will be permanently deleted after 30 days."
  2. Two buttons: "Cancel" (secondary), "Move to Trash" (danger)
  3. On confirm: call trashStore.trashPhotos
  4. Exit selection mode

**Modify:** `src/screens/gallery/PhotoViewerScreen.tsx`
- Delete icon in header: same flow as above but for single photo
- After deleting, navigate to the next photo (or back to grid if it was the last)

**Modify:** `src/screens/settings/SettingsScreen.tsx`
- Add "Trash" row that navigates to a Trash screen
- Show count of trashed items

**Create:** `src/screens/settings/TrashScreen.tsx`
- Shows trashed photos in a grid
- Each photo has a gray overlay to indicate trashed state
- Multi-select enabled by default (or tap to select)
- Bottom actions: "Restore" (primary) and "Delete Forever" (danger)
- "Delete Forever" shows confirmation: "Permanently delete X photos? This cannot be undone."
- Empty state: "Trash is empty"
- Header subtitle: "Photos are deleted permanently after 30 days"

**Modify:** `src/app/AppRoot.tsx`
- On app startup, call trashStore.cleanupExpired() to auto-delete photos older than 30 days

**Verification:**
- In gallery, select photos, tap Delete: confirmation dialog appears
- Confirm: photos disappear from gallery
- Go to Settings > Trash: deleted photos appear there
- Select trashed photos, tap Restore: photos reappear in gallery
- Select trashed photos, tap Delete Forever: confirmation appears. Confirm: photos are permanently gone.
- Photos older than 30 days (mock the date for testing) are auto-deleted on app startup

---

### Level 6.3: Share

**Modify:** `src/screens/gallery/PhotoViewerScreen.tsx`
- Share icon in header: calls expo-sharing shareAsync(uri) with the current photo URI
- If sharing is not available (shareAsync returns that sharing is unavailable), show error message

**Modify:** `src/screens/gallery/GalleryScreen.tsx`
- Share action in SelectionBar (multi-select mode):
  - If 1 photo selected: share directly
  - If multiple selected: share all (expo-sharing may only support one at a time; in that case, share the first and show a note "Sharing is limited to one photo at a time on this device")

**Verification:**
- In viewer, tap share: native share sheet opens with the photo
- Cancel share sheet: returns to viewer
- Share via any app (Messages, email, etc.): photo is shared correctly
- Multi-select, tap share: works for single photo

---

### Level 6.4: Favorites

**Modify:** `src/screens/gallery/PhotoViewerScreen.tsx`
- Add a heart icon in the header actions
- Unfavorited: outline heart icon (icon color)
- Favorited: filled heart icon (danger/red color)
- Tap toggles favorite state via database.toggleFavorite

**Modify:** `src/screens/gallery/GalleryScreen.tsx`
- Favorite action in SelectionBar: marks all selected photos as favorites

**Modify:** `src/screens/albums/AlbumsScreen.tsx`
- Add a "Favorites" entry at the top of the albums list (always present, cannot be deleted)
- Shows heart icon instead of cover photo
- Photo count comes from database.getAllFavoriteIds().length
- Tapping it opens AlbumDetailScreen but loads favorites instead of album photos
  - Pass a special flag: `{ albumId: "__favorites__", albumName: "Favorites" }`

**Modify:** `src/screens/albums/AlbumDetailScreen.tsx`
- If albumId is "__favorites__", load photos from favorites table instead of album_photos
- Hide "Add Photos" action (favorites are added from the viewer, not the album)

**Verification:**
- In viewer, tap heart: icon fills, photo is favorited
- Tap again: icon outlines, photo is unfavorited
- Albums tab shows "Favorites" at the top with correct count
- Open Favorites: shows only favorited photos
- Multi-select, tap Favorite: all selected photos appear in Favorites
- Unfavorite from viewer: photo disappears from Favorites album on next visit

---

## Phase 7: Settings and Polish

Goal: Theme toggle, storage info, sorting, search, and final polish.

### Level 7.1: Settings Screen

**Modify:** `src/screens/settings/SettingsScreen.tsx`
- Render a list of setting rows, each with label on left and value/toggle on right
- Rows:
  1. "Appearance" - Shows current mode ("Light" / "Dark" / "System"). Tap opens bottom sheet with 3 options. Use system as default.
  2. "Trash" - Shows count of trashed items. Tap navigates to TrashScreen.
  3. "Storage Used" - Shows calculated storage usage (sum of all photo file sizes, formatted). Read-only.
  4. "Grid Columns" - Shows current column count (3 or 4). Tap toggles between 3 and 4.
  5. "About" - App name, version. Read-only.
- Section headers: "Preferences", "Data", "Info" - uppercase, caption size, textSecondary, with spacing above
- Row style: surface background, no border between rows within a section, border between sections. Padding md. Min height 52px.

**Create:** `src/services/storage.ts`
- `calculateStorageUsage()`: Iterates through media library assets, sums file sizes. Returns formatted string (e.g., "2.4 GB").
- Cache the result. Recalculate only when user visits settings.

**Modify:** `src/store/settingsStore.ts`
- State: theme ("light" | "dark" | "system"), gridColumns (3 | 4)
- Persist to SQLite (add a settings table or use a key-value table)
- Actions: setTheme, setGridColumns

**Modify:** `src/theme/ThemeContext.tsx`
- Read theme preference from settingsStore
- "system" option uses useColorScheme()

**Modify:** `src/components/PhotoGrid.tsx`
- Accept numColumns as a prop, default to settingsStore.gridColumns

**Verification:**
- Settings screen shows all rows with correct current values
- Toggle theme: app switches between light, dark, and system
- Change grid columns: gallery grid updates to 3 or 4 columns
- Storage shows a reasonable number
- Trash row shows count, tapping opens trash
- Preferences persist across app restart

---

### Level 7.2: Search

**Create:** `src/hooks/useDebounce.ts`
- Takes a value and delay (default 300ms), returns debounced value
- Standard debounce hook implementation

**Modify:** `src/screens/gallery/GalleryScreen.tsx`
- Add a search icon in the header
- Tapping search shows a text input that slides down below the header
  - Input placeholder: "Search by date (e.g., March 2026)"
  - Input style matches CreateAlbumModal input style
  - Close button (X icon) on right of input to dismiss search
- Filtering logic:
  - Parse the search text for month and/or year
  - Filter galleryStore.photos by createdAt matching the month/year
  - If search text does not match a date pattern, show "No results" empty state
  - Debounce the filter with 300ms delay

**Modify:** `src/screens/albums/AlbumsScreen.tsx`
- Same search icon in header
- Filters album list by album name (simple substring match, case-insensitive)

**Verification:**
- Tap search icon: input appears
- Type "March": photos from March (any year) are shown
- Type "March 2026": only March 2026 photos shown
- Type gibberish: "No results" empty state
- Clear search (X button): all photos return
- Album search: type album name, only matching albums shown
- Debounce works: does not filter on every keystroke (wait 300ms)

---

### Level 7.3: Final Polish

**Modify all screens and components:**

1. Screen transitions:
   - Stack navigators use default native transitions (slide from right on iOS, fade on Android)
   - No custom transition animations. Let the platform be itself.

2. Loading states:
   - Every screen that loads data shows a simple centered ActivityIndicator (accent color)
   - Never a skeleton screen. Never a shimmer effect. Just the spinner, then the content.

3. Touch feedback:
   - All touchable elements use appropriate feedback:
     - On iOS: opacity reduction to 0.7
     - On Android: ripple effect (default Pressable behavior)
   - Minimum touch target: 44x44 on all interactive elements

4. Accessibility:
   - Every interactive element has an accessibilityLabel
   - Every image has an accessibilityLabel describing it
   - Screen readers can navigate all tabs, all buttons, all actions
   - Color contrast: all text/background combinations meet WCAG AA (4.5:1 for body, 3:1 for large text)
   - Test with the Accessibility Inspector (iOS) or TalkBack (Android)

5. Safe areas:
   - All screens use SafeAreaView to avoid notch/status bar overlap
   - Tab bar avoids bottom home indicator on modern iPhones

6. Error states:
   - If media library fails to load: show EmptyState with "Could not load photos" and "Retry" button
   - If camera fails: show error text on camera screen
   - If save fails: show brief error text at top of screen, auto-dismiss after 4 seconds

7. Splash screen:
   - Use expo-splash-screen
   - Background: same as theme background (or pure black for a neutral feel)
   - No logo animation. Just the background, then the app appears.
   - Keep splash visible until initial data (albums, gallery first page) is loaded

8. App icon:
   - Simple, clean design
   - A minimal camera aperture or lens shape
   - Blue (#2563EB) icon on white background
   - No gradients, no purple, no glossy effects

**Verification (final checklist):**
- [ ] App launches without errors on Android and iOS
- [ ] All 4 tabs work and navigate correctly
- [ ] Gallery loads photos, scrolls smoothly, pull-to-refresh works
- [ ] Full-screen viewer: swipe, zoom, double-tap all work
- [ ] Albums: create, rename, delete, add/remove photos
- [ ] Camera: capture, preview, save to gallery
- [ ] Editor: crop, rotate, flip, save as new copy
- [ ] Multi-select: works in gallery and albums
- [ ] Delete + trash + restore + permanent delete
- [ ] Share via native share sheet
- [ ] Favorites: toggle, view in albums
- [ ] Settings: theme toggle, grid columns, storage info
- [ ] Search: by date in gallery, by name in albums
- [ ] Dark and light themes both look correct
- [ ] Accessibility: labels on all interactive elements
- [ ] No purple anywhere
- [ ] No pill-shaped buttons (max border radius 12px)
- [ ] No fake content or placeholder marketing copy
- [ ] No crowded screens (generous spacing, breathing room)
- [ ] Smooth, quiet, premium feel throughout

