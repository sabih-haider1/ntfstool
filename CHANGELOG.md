# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.5-free] - 2025-11-13

**Major Update by Sabih Haider**: Complete modernization and enhancement of NTFS Tool

### 🎨 UI/UX Modernization
- **ExFAT File System Support**: Full read/write support for ExFAT drives using native macOS capabilities
- **Modern macOS UI Design**: Complete UI overhaul matching macOS Monterey Disk Utility aesthetics
  - Frosted glass effects and modern gradients
  - Color-coded disk usage bars (green/yellow/red thresholds)
  - Modernized gear icon dropdown menu with blur effects
  - Enhanced button and control styling
- **Multi-language Support**: Added comprehensive language selection with 20+ languages
  - Arabic, Bengali, German, English, Spanish, Persian, French, Hindi, Indonesian, Italian
  - Japanese, Korean, Portuguese, Russian, Swahili, Thai, Turkish, Vietnamese
  - Simplified Chinese, Traditional Chinese
- **Settings Page Enhancements**:
  - Fixed blank Settings page rendering issue
  - Made all tabs (General, Notice, Privacy, Update) fully functional and clickable
  - Improved layout with proper spacing and scrolling
  - Enhanced dropdown styling with modern macOS design
  - Added language selection dropdown with live switching

### Changed
- **Disk Usage Calculations**: Fixed percentage calculations to normalize units before comparison
  - Properly handles TB/GB/MB/KB conversions
  - Accurate usage percentages across all unit combinations
- **ExFAT Mounting**: No longer requires sudo password (uses native macOS support)
- **Settings Window**: Increased default height (500px → 600px) for better content visibility
- **Router Configuration**: Added proper routes for all application pages
- **Form Components**: Replaced non-rendering `<el-form>` components with standard divs while keeping Element Plus controls

### Fixed
- **Critical**: ExFAT drives no longer trigger incorrect sudo password prompts
- **Critical**: Settings page now renders all content correctly
- **Critical**: Fixed disk usage bar percentage calculations (e.g., 86.8 GB / 1.0 TB now shows 8.68% not 86.8%)
- **Webpack Dev Server**: Excluded `.git/**` from file watching to prevent unnecessary reloads
- **Window Communication**: Added `isDestroyed()` checks before all IPC window.send() calls
- **Error Handling**: Fixed `e.getError is not a function` error in disableZoom
- **Tab Navigation**: Fixed Settings page tabs not being clickable due to `-webkit-app-region: drag`
- **Language Switching**: Language changes now apply immediately with `$forceUpdate()`
- **Layout Issues**: Fixed checkbox positioning and container overflow in Settings

### Removed
- Removed technical documentation files (implementation notes, publishing guides)
- Cleaned up debug console.log statements

## [2.3.4-free] - 2025-11-13

### Added
- Created `FREE_USE_NOTICE.md` documenting the free-use fork and original author permission
- Added comprehensive changelog to track project evolution
- Updated attribution to include original author (Dr_rOot) and community contributors

### Changed
- **BREAKING**: Removed all paid-restriction and licensing-check logic
- **BREAKING**: Disabled any activation dialogs or subscription gating
- Updated `LICENSE` file to clarify free-use terms with original author permission
- Updated version to `2.3.4-free` to indicate free fork status
- Modified `package.json` metadata
- Updated all source file headers to reflect new licensing terms
- Changed homepage URL from commercial site to GitHub repository

### Removed
- Removed license server check endpoints
- Removed paid-feature gates
- Removed subscription/activation requirement
- Removed commercial update server references

### Fixed
- Ensured full application functionality in free mode

## [2.3.3] - Prior Releases

Previous versions maintained by original author Dr_rOot. See git history for details.

---

## Migration Notes for Users

If you're migrating from a previous version:

1. **No activation required** - This fork works fully without any license keys or activation
2. **All features enabled** - Every feature is available to all users
3. **ExFAT support** - Now supports both NTFS and ExFAT drives seamlessly
4. **Modern UI** - Enjoy the refreshed macOS Monterey-style interface
3. **Updates via GitHub** - Updates are now distributed through GitHub Releases
4. **Open source** - Full source code available for review and contribution

## Migration Notes for Developers

If you're forking or contributing:

1. **Maintain attribution** - Always credit Dr_rOot as the original author
2. **Include LICENSE** - The MIT license must be distributed with all copies
3. **Update version** - Use semantic versioning with `-free` suffix for fork releases
4. **Document changes** - Update this CHANGELOG for all notable changes
5. **Test thoroughly** - Verify no paid-restriction code remains active

---

**Original Author**: Dr_rOot  
**Fork Maintained By**: NTFS Tool Community  
**License**: MIT License
