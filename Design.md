# Design System

This document defines every visual rule for the app. Follow it exactly. Do not improvise. Do not add decorative elements that are not listed here.

---

## 1. Design Principles

1. **Quiet confidence.** The app does not shout. It does not sell. It presents your photos and gets out of the way.
2. **Content first.** Photos are the content. UI chrome is minimal. Let the images breathe.
3. **Clarity over cleverness.** Every button says what it does. Every label describes what it represents. No ambiguity.
4. **Generous space.** Whitespace is not wasted space. It makes the interface feel calm and expensive.
5. **Consistent, not uniform.** The same spacing, the same radii, the same font sizes, everywhere. But each screen adapts to its content.

---

## 2. What This App Does NOT Have

This list is non-negotiable. Do not introduce any of these at any point:

- Purple or violet colors anywhere (backgrounds, gradients, buttons, accents, icons)
- Gradients of any kind (backgrounds, buttons, overlays, except the camera bottom fade)
- Pill-shaped buttons (border-radius >= height/2)
- Circular buttons (except system-standard FAB, which we also avoid, see below)
- Fake reviews, testimonials, or social proof
- Metrics, stats, or dashboards (no "photos viewed today" or "storage saved")
- Emoji used as icons or decorative elements (emoji in photo names typed by users is fine)
- Em dashes in any UI copy
- Scroll-triggered animations, parallax effects, or entrance animations
- Skeleton loaders or shimmer effects
- Marketing copy ("Unleash your creativity", "Your photos, reimagined", etc.)
- Onboarding carousel or tutorial screens
- Rating prompts or "rate this app" dialogs
- Splash screen animations
- Badge notifications on tabs
- Toast notifications that slide/bounce in (use static text that appears/disappears)

---

## 3. Color Palette

### Light Theme

| Token | Hex | Usage |
|-------|-----|-------|
| background | #FAFAFA | Screen backgrounds |
| surface | #FFFFFF | Cards, modals, bottom sheets, input backgrounds |
| surfaceAlt | #F2F2F2 | Album card backgrounds, alternate surfaces |
| text | #1A1A1A | Primary text, headings |
| textSecondary | #6B6B6B | Descriptions, timestamps, secondary info |
| textTertiary | #999999 | Captions, placeholders (use sparingly, only on light backgrounds) |
| border | #E5E5E5 | Card borders, input borders, dividers |
| accent | #2563EB | Interactive elements, active states, links |
| accentLight | #DBEAFE | Selected state backgrounds, active tool highlight |
| danger | #DC2626 | Delete buttons, error text |
| dangerLight | #FEE2E2 | Error backgrounds |
| icon | #4B4B4B | Active icons in headers and toolbars |
| iconMuted | #AAAAAA | Inactive tab icons, disabled icons |
| overlay | rgba(0,0,0,0.5) | Modal backdrops, bottom sheet backdrops |
| tabBar | #FFFFFF | Tab bar background |
| tabBarBorder | #E5E5E5 | Tab bar top border |

### Dark Theme

| Token | Hex | Usage |
|-------|-----|-------|
| background | #0A0A0A | Screen backgrounds |
| surface | #1A1A1A | Cards, modals, bottom sheets |
| surfaceAlt | #252525 | Album cards, alternate surfaces |
| text | #F5F5F5 | Primary text |
| textSecondary | #A0A0A0 | Secondary text |
| textTertiary | #707070 | Captions |
| border | #2A2A2A | Borders, dividers |
| accent | #60A5FA | Interactive elements (lighter blue for contrast on dark) |
| accentLight | #1E3A5F | Selected state backgrounds |
| danger | #EF4444 | Delete buttons |
| dangerLight | #450A0A | Error backgrounds |
| icon | #D4D4D4 | Icons |
| iconMuted | #666666 | Inactive icons |
| overlay | rgba(0,0,0,0.7) | Backdrops |
| tabBar | #0A0A0A | Tab bar background |
| tabBarBorder | #1A1A1A | Tab bar border |

### Contrast Verification

All text-on-background combinations must meet WCAG AA:

| Combination | Ratio | Passes |
|-------------|-------|--------|
| text (#1A1A1A) on background (#FAFAFA) | 16.5:1 | Yes |
| textSecondary (#6B6B6B) on background (#FAFAFA) | 5.5:1 | Yes |
| textSecondary (#6B6B6B) on surface (#FFFFFF) | 5.7:1 | Yes |
| textTertiary (#999999) on surface (#FFFFFF) | 2.8:1 | No (use only for non-essential captions alongside primary text) |
| text (#F5F5F5) on background (#0A0A0A) | 18.1:1 | Yes |
| textSecondary (#A0A0A0) on background (#0A0A0A) | 9.6:1 | Yes |
| white (#FFFFFF) on accent (#2563EB) | 4.6:1 | Yes |
| white (#FFFFFF) on danger (#DC2626) | 4.6:1 | Yes |

---

## 4. Typography

The app uses the system default font on each platform:
- iOS: SF Pro
- Android: Roboto

No custom fonts. No font loading. System fonts feel native and load instantly.

### Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| heading | 28px | 700 (bold) | 34px | Screen titles (rarely used, only on major screens) |
| title | 20px | 600 (semibold) | 26px | Section headers, modal titles |
| subtitle | 16px | 600 (semibold) | 22px | Card titles, button labels, header titles |
| body | 14px | 400 (regular) | 20px | General text, descriptions, settings rows |
| caption | 12px | 400 (regular) | 16px | Timestamps, photo counts, metadata |

### Rules

- Never use ALL CAPS for text longer than 3 words. Section labels (like "PREFERENCES") may be uppercase.
- Never use italic for UI text.
- Never use more than 2 font sizes on a single screen.
- Truncate long text with ellipsis. Never wrap album names or photo filenames to multiple lines in grid views.
- Text color is always a theme token. Never hardcode a hex color in a component.

---

## 5. Spacing

All spacing uses the token scale. Never use arbitrary pixel values.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Grid gaps between thumbnails, tight internal padding |
| sm | 8px | Space between icon and label, internal component padding |
| md | 16px | Screen horizontal padding, card padding, input padding |
| lg | 24px | Space between sections, major content blocks |
| xl | 32px | Top/bottom padding on screens, large gaps |
| xxl | 48px | Empty state vertical centering offset |

### Screen Layout

- Every screen has horizontal padding of `md` (16px) on both sides
- Content starts below the header with `md` (16px) gap
- Sections within a screen are separated by `lg` (24px)
- The last item on a scrollable screen has `xl` (32px) bottom padding to clear the tab bar

---

## 6. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| none | 0px | Photo thumbnails in grid (edge-to-edge, no rounded corners) |
| sm | 4px | Buttons, text inputs, small chips |
| md | 8px | Cards, album covers, modals |
| lg | 12px | Bottom sheets (top corners only), large containers |

**Maximum border radius is 12px.** No element has a border radius larger than this. No pills. No circles (the only exception is a selection checkmark indicator, which is 20px diameter and uses 10px radius).

---

## 7. Buttons

### Primary Button

```
Background: accent
Text: white
Font: subtitle (16px, weight 600)
Padding: 12px vertical, 24px horizontal
Border radius: sm (4px)
Min height: 48px
Min width: 120px (or full-width when in a form)
```

### Secondary Button

```
Background: transparent
Border: 1px solid accent
Text: accent color
Font: subtitle (16px, weight 600)
Padding: 12px vertical, 24px horizontal
Border radius: sm (4px)
Min height: 48px
```

### Danger Button

```
Background: danger
Text: white
Font: subtitle (16px, weight 600)
Padding: 12px vertical, 24px horizontal
Border radius: sm (4px)
Min height: 48px
```

### Text Button

```
Background: transparent
Border: none
Text: accent color (or textSecondary for "Cancel")
Font: subtitle (16px, weight 600)
Padding: 8px vertical, 12px horizontal
No min width
```

Used for: Cancel actions, header actions (like "Done", "Cancel")

### Icon Button

```
Background: transparent
Size: 44px x 44px (touch target)
Icon size: 24px
Icon color: icon token (or white on dark overlays)
No border
```

Used for: Header actions, toolbar icons, camera controls

### Disabled State (all button types)

```
Opacity: 0.4
Touch disabled
No other visual change
```

### Press State

```
iOS: opacity reduces to 0.7
Android: default ripple effect
Duration: instant feedback, no delay
```

---

## 8. Component Specifications

### Photo Grid

```
Columns: 3 (default) or 4 (user setting)
Gap: 2px between all items (achieved via 1px margin on each side of each item)
Thumbnails: square, edge-to-edge (border radius: none)
Image fit: cover (crops to fill square)
Background behind grid: screen background color
```

The grid is visually dense by design. The thin 2px gap creates a mosaic effect where photos are the focus.

### Photo Thumbnail (in multi-select mode)

```
Selected: 2px accent border inset, small checkmark in top-right
Checkmark: white check icon on accent circle, 24px diameter, 4px from top and right edges
Unselected (while in select mode): empty circle outline (white with 50% opacity) in same position
Not in select mode: no overlay, just the photo
```

### Album Card

```
Layout: vertical stack
Width: (screen width - 3*md) / 2  (two columns with md gaps)
Cover image: aspect ratio 1:1, border radius md (top corners only if card has rounded corners, but actually apply md to the whole card and clip the image)
  - Actually: entire card has border radius md. Image is at the top, clipped by the card's border radius.
  - If no cover photo: show surfaceAlt background with a folder icon (iconMuted color, 32px)
Album name: subtitle size, weight 600, text color, 1 line, ellipsis overflow
Photo count: caption size, textSecondary, e.g., "24 photos" (not "24" with an icon)
Card padding: sm (8px) on the text area below the image
Card background: surface
Card border: 1px solid border
Card shadow: none
Card margin bottom: md (16px)
```

### Full-Screen Photo Viewer

```
Background: always #000000 (pure black, regardless of theme)
Image: fills width, centered vertically, maintains aspect ratio
Header overlay:
  - Background: rgba(0,0,0,0.6)
  - Height: 56px + safe area top inset
  - Left: back arrow icon (white, 24px)
  - Right: heart icon, share icon, edit icon, delete icon (white, 24px each, 16px gap between)
  - Fades in/out on single tap (duration: fast, 150ms)
Footer overlay:
  - Background: rgba(0,0,0,0.6)
  - Padding: md
  - Filename: body size, white
  - Date and size: caption size, rgba(255,255,255,0.7)
  - Same fade behavior as header
```

### Bottom Sheet

```
Backdrop: overlay color (tapping dismisses)
Sheet background: surface
Top corners: border radius lg (12px)
Drag handle: 40px wide, 4px tall, centered, surfaceAlt color, 12px from top
Content padding: md horizontal, lg top (below handle), md bottom
Max height: 60% of screen height
Animation: slides up from bottom, duration normal (250ms)
```

### Selection Bar

```
Position: fixed at bottom of screen, above tab bar
Background: surface
Top border: 1px solid border
Height: 56px + safe area bottom inset
Padding: md horizontal
Layout: left-aligned count text, right-aligned action buttons
Count text: subtitle size, text color, e.g., "3 selected"
Action buttons: icon buttons with labels below (caption size)
```

### Text Input

```
Background: surface
Border: 1px solid border
Border radius: sm (4px)
Padding: 12px horizontal, 12px vertical
Font: body (14px)
Text color: text
Placeholder color: textTertiary
Focus state: border changes to accent
Height: 48px
No shadow, no glow, no floating label
```

### Settings Row

```
Background: surface
Min height: 52px
Padding: md horizontal
Layout: row, label on left (body, text color), value/control on right (body, textSecondary)
Chevron: if navigable, show right-arrow icon (iconMuted, 16px) on far right
Toggle: if boolean, show Switch component on right
Divider: 1px border color, only between rows in the same section (not after last row)
```

### Header

```
Height: 56px (content area, excluding safe area)
Background: background (not surface, matches screen)
Left: back button (icon, 24px) or text button ("Cancel")
Center: title (subtitle size, weight 600, text color)
Right: up to 3 icon buttons
Bottom border: 1px solid border
Horizontal padding: md
```

For screens where the header should blend with content (like Gallery), the bottom border can be omitted.

### Empty State

```
Layout: centered vertically and horizontally in the available space
Title: title size (20px), weight 600, text color
Message: body size (14px), textSecondary, max width 280px, text-align center
Action button (if any): primary variant, below message with lg (24px) gap
No illustration. No image. Just text and an optional button.
```

### Confirmation Dialog

```
Use React Native Alert.alert() for destructive confirmations
Title: clear, specific (e.g., "Move to trash?")
Message: explains what happens (e.g., "3 photos will be moved to trash. They will be permanently deleted after 30 days.")
Buttons: "Cancel" (default) and the action ("Move to Trash" / "Delete Forever")
Destructive button styled as destructive (red on iOS, automatically handled by Alert)
```

No custom modal dialogs for confirmations. Use the system dialog. It is familiar and trustworthy.

### Camera Controls

```
Background: linear gradient from transparent to rgba(0,0,0,0.6), bottom 120px of screen
Layout: row, centered horizontally, aligned to bottom with xl padding

Shutter button:
  - Outer: 72px square, border radius md (8px), background white
  - Inner: 44px square, border radius sm (4px), background #333333, centered inside outer
  - Touch feedback: outer background dims to #E0E0E0
  - accessibilityLabel: "Take photo"

Flip camera button:
  - Standard icon button (44x44), camera-reverse icon, white
  - Position: left of shutter, with lg gap

Flash button:
  - Standard icon button (44x44), flash icon varies by mode, white
  - Position: right of shutter, with lg gap
  - Modes cycle: auto (flash-auto icon) > on (flash icon) > off (flash-off icon)
```

### Photo Editor

```
Layout: three sections stacked vertically

Top: Header with "Cancel" (text button, left) and "Save" (primary button, right)

Middle: Image preview
  - Centered in available space
  - Maintains aspect ratio
  - Has md padding on sides
  - When crop tool is active, crop overlay appears here

Bottom: Tool bar
  - Background: surface
  - Top border: 1px border
  - Height: auto (content-based), padding md
  - Tools displayed as row of vertical stacks: icon (24px) above label (caption size)
  - Active tool: accent color for icon and label, accentLight background behind the stack
  - Inactive tool: icon color for icon, textSecondary for label
  - Tools: Crop, Rotate, Flip
  - When a tool is active, sub-controls appear between the image and the tool bar:
    - For Rotate: "Left" and "Right" buttons (secondary variant, compact)
    - For Flip: "Horizontal" and "Vertical" buttons
    - For Crop: aspect ratio presets ("Free", "1:1", "4:3", "16:9") as small rectangular chips
      - Active preset: accent background, white text
      - Inactive preset: surfaceAlt background, text color
      - Chip padding: xs vertical, sm horizontal
      - Chip border radius: sm (4px)
      - Chips in a row with sm gaps
```

### Crop Overlay

```
Outside crop region: rgba(0,0,0,0.5) overlay
Crop border: 2px white
Corner handles: 20px x 20px white squares at each corner, positioned so they straddle the border
Rule-of-thirds grid inside crop region: 1px rgba(255,255,255,0.3) lines dividing into 3x3
Minimum crop size: 50x50 logical pixels
```

---

## 9. Iconography

Use Ionicons from @expo/vector-icons. Only these icons are used in the app:

| Context | Icon name (outline) | Icon name (filled) |
|---------|--------------------|--------------------|
| Gallery tab | images-outline | images |
| Albums tab | folder-outline | folder |
| Camera tab | camera-outline | camera |
| Settings tab | settings-outline | settings |
| Back button | chevron-back | - |
| Close / Cancel | close | - |
| Share | share-outline | - |
| Edit | create-outline | - |
| Delete / Trash | trash-outline | - |
| Favorite (off) | heart-outline | - |
| Favorite (on) | - | heart |
| Add | add | - |
| Search | search | - |
| Flip camera | camera-reverse-outline | - |
| Flash auto | flash-outline | - |
| Flash on | flash | - |
| Flash off | flash-off-outline | - |
| Rotate left | return-down-back | - |
| Rotate right | return-down-forward | - |
| Flip horizontal | swap-horizontal | - |
| Flip vertical | swap-vertical | - |
| Crop | crop | - |
| Checkmark | checkmark | - |
| Overflow menu | ellipsis-horizontal | - |
| Chevron right | chevron-forward | - |

Tab bar uses outline icons for inactive tabs and filled icons for the active tab.

All other contexts use outline icons only.

Icon sizes:
- Tab bar: 24px
- Header actions: 24px
- Toolbar: 24px
- Empty state: 32px (if used, but we prefer text-only empty states)
- Camera controls: 28px

---

## 10. Motion and Animation

The app is calm. Motion is functional, not decorative.

### Allowed animations

| What | How | Duration |
|------|-----|----------|
| Screen transitions | Platform default (slide on iOS, fade on Android) | System default |
| Tab switching | Instant, no transition | 0ms |
| Header/footer fade in viewer | Opacity 0 to 1 | 150ms (fast) |
| Bottom sheet slide up | TranslateY from bottom | 250ms (normal) |
| Image load fade-in | Opacity 0 to 1 on thumbnails | 150ms (fast) |
| Button press feedback | Opacity reduction (iOS) / ripple (Android) | Instant |
| Selection checkmark appear | Scale 0 to 1 | 150ms (fast) |
| Camera shutter flash | White overlay opacity 0 > 0.8 > 0 | 100ms |

### Not allowed

- Parallax scrolling
- Entrance animations (content sliding/fading in as you scroll)
- Bouncy spring animations on UI elements
- Animated transitions between grid and viewer (like iOS Photos "zoom" transition)
- Loading skeletons / shimmer
- Lottie animations
- Confetti, sparkles, or celebratory animations

---

## 11. Layout Patterns

### Standard Screen

```
SafeAreaView (flex 1, background color)
  Header (56px)
  Content (flex 1, scrollable or flat list)
```

### Screen with Floating Action

```
SafeAreaView (flex 1, background color)
  Header (56px)
  Content (flex 1, with extra bottom padding for FAB clearance)
  FAB (absolute positioned, bottom-right, 16px from edges)
```

### Screen with Selection Bar

```
SafeAreaView (flex 1, background color)
  Header (modified for selection mode)
  Content (flex 1, with extra bottom padding for selection bar)
  SelectionBar (absolute positioned at bottom)
```

### Modal / Bottom Sheet Screen

```
Backdrop (overlay, full screen, touchable to dismiss)
  Sheet (absolute bottom, surface background, rounded top corners)
    Drag handle
    Content (scrollable if needed, max 60% screen height)
```

---

## 12. Responsive Rules

- The app is portrait-only. Lock orientation in app.json.
- Minimum supported width: 320px (iPhone SE).
- Photo grid adapts: 3 or 4 columns based on user setting, item size is calculated from screen width.
- Album grid is always 2 columns.
- Text never overflows. Use numberOfLines={1} with ellipsizeMode="tail" on all names and titles in lists/grids.
- Bottom safe area is respected on devices with home indicators.
- Top safe area is respected on devices with notches.

---

## 13. Copy Guidelines

All text in the app follows these rules:

- Write in plain, direct language. Say what things are and what they do.
- No exclamation marks in UI copy.
- No marketing language. No "beautiful", "stunning", "powerful", "seamless".
- No filler words. "No photos" not "It looks like you don't have any photos yet!"
- Use sentence case for all labels and messages (not Title Case, except for proper nouns and the app name).
- Error messages state what happened and what to do: "Could not load photos. Pull down to retry."
- Confirmation messages state what will happen: "3 photos will be moved to trash."
- Button labels are verbs: "Save", "Delete", "Create", "Cancel", "Retry", "Add", "Remove".
- Never use "oops", "uh oh", "whoops", or similar infantile error language.

### Specific copy for key screens

| Context | Text |
|---------|------|
| Gallery empty | Title: "No photos" / Message: "Photos on your device will appear here." |
| Album empty | Title: "No photos in this album" / Message: "Tap the add button to add photos." |
| Albums empty | Title: "No albums" / Message: "Create an album to organize your photos." |
| Favorites empty | Title: "No favorites" / Message: "Tap the heart on any photo to add it here." |
| Trash empty | Title: "Trash is empty" / Message: "Deleted photos will appear here for 30 days." |
| Camera no permission | Title: "Camera access needed" / Message: "Allow camera access to take photos." / Button: "Grant access" |
| Media no permission | Title: "Photo access needed" / Message: "Allow photo library access to browse your photos." / Button: "Grant access" |
| Delete confirmation | Title: "Move to trash?" / Message: "X photos will be moved to trash. They will be permanently deleted after 30 days." / Buttons: "Cancel", "Move to trash" |
| Permanent delete | Title: "Delete permanently?" / Message: "X photos will be permanently deleted. This cannot be undone." / Buttons: "Cancel", "Delete forever" |
| Search no results | Title: "No results" / Message: "No photos match your search." |
| Save success | "Photo saved" (brief text, appears and fades after 2 seconds) |
| Save error | "Could not save photo" (brief text, appears and fades after 4 seconds) |

