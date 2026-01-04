# General Tab Completion - Settings/Preferences

## Overview
The General tab in the Preferences window has been completed with the following enhancements:

## Changes Made

### 1. Menu Bar Icon Toggle ✅
**File:** `src/renderer/page/Setting.vue`

- Added checkbox to show/hide menu bar icon
- Variable: `show_menu` (already existed in data, now connected to UI)
- Method: `changeShowMenu()` - saves setting and notifies main process via IPC
- Displays contextual notices:
  - When disabled: "Warning: You will not be able to operate files directly from the menu bar after disabling"
  - When enabled: "Tip: After enabling, the shortcut menu will be displayed in the upper right corner"

### 2. Theme Selector Enhancement ✅
**Files:** 
- `src/renderer/page/Setting.vue`
- `src/renderer/theme/ntfstool.css`
- `src/renderer/App.vue`

**Changes:**
- Enabled all three theme options (previously only Light was enabled):
  - **System** - Follows macOS system preferences using `@media (prefers-color-scheme: dark)`
  - **Dark** - Always uses dark theme
  - **Light** - Always uses light theme (default)

- Enhanced `changeTheme()` method to:
  - Apply CSS classes (`theme-system`, `theme-dark`, `theme-light`) to `document.body`
  - Notify main process via IPC event
  - Update carousel visual indicator

- Added comprehensive dark theme CSS in `ntfstool.css`:
  - Dark backgrounds (#1e1e1e, #2d2d2d)
  - Light text colors (#e0e0e0)
  - Proper contrast for tabs, checkboxes, and form elements
  - System theme support using CSS media queries

- App.vue now applies saved theme on startup

- Added informative notice: "Theme selection will apply to the application. Dark and System themes are currently in development."

### 3. Translation Updates ✅
**Files:** 
- `lang/en.js` (renderer translations)
- `src/common/lang/en.js` (main process translations)

**New Keys:**
```javascript
"Showmenubaricon": "Show Menu Bar Icon"
"notice_cannot_do_disk01": "Warning: You will not be able to operate files directly from the menu bar after disabling"
"notice_cannot_do_disk02": "Tip: After enabling, the shortcut menu will be displayed in the upper right corner"
"theme_notice": "Theme selection will apply to the application. Dark and System themes are currently in development."
```

## General Tab Features Summary

The General tab now includes:

1. ✅ **NTFSTool Menu** section with translation helper link
2. ✅ **Follow System Startup** checkbox - Auto-launch with macOS
3. ✅ **Automatically Mount NTFS and ExFAT Disk** checkbox - Auto-mount drives
4. ✅ **Show Menu Bar Icon** checkbox (NEW) - Control menu bar visibility
5. ✅ **Theme Selector** - System/Dark/Light themes with visual carousel
6. ✅ **Language Selector** - 20 supported languages
7. ✅ **How to Deal with Mounting Bad Volumes** dropdown
8. ✅ **How to Deal with Hibernation Windows** dropdown

## Technical Implementation

### IPC Events
The following IPC events are sent to the main process:
- `AutoRunEvent` - Auto-launch setting changed
- `ShowMenuEvent` (NEW) - Menu bar icon visibility changed
- `ThemeChangeEvent` (NEW) - Theme preference changed
- `ChangeLangEvent` - Language changed

### Theme Classes
Applied to `document.body`:
- `.theme-system` - Uses OS preference
- `.theme-dark` - Force dark mode
- `.theme-light` - Force light mode

### Storage Keys
Settings saved in electron-store:
- `auto_run` - Boolean
- `auto_mount` - Boolean  
- `show_menu` - Boolean (NEW)
- `theme` - String: "0" (system), "1" (dark), "2" (light)
- `lang` - String: Language code
- `common.install_bug_type` - String
- `common.how_restart_window` - String

## Testing Recommendations

1. **Menu Bar Icon Toggle:**
   - Toggle the "Show Menu Bar Icon" checkbox
   - Verify menu bar icon appears/disappears
   - Verify notice text changes based on state

2. **Theme Switching:**
   - Test all three theme options
   - Verify dark theme applies proper colors
   - Test system theme with macOS dark mode on/off
   - Restart app and verify theme persists

3. **Persistence:**
   - Change all settings
   - Restart the app
   - Verify all settings are preserved

## Notes

- Dark and System themes have basic CSS implementation
- Future work could expand dark theme coverage to all app windows
- All changes are backward compatible
- No breaking changes to existing functionality
