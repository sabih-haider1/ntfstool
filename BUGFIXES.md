# Bug Fixes for ExFAT Drive Mounting

## Issues Identified and Fixed

### 1. **ExFAT Mount Timeout on MacBook Air 2015** (AlfwShell.js, AlfwDisk.js)
**Problem:** On older Macs (especially MacBook Air 2015 with macOS 12.7.6), the `diskutil mount` command would hang indefinitely when trying to mount ExFAT drives, causing the entire application to freeze and enter an infinite retry loop.

**Root Causes:**
- No timeout on shell commands - commands could hang forever
- Disk info cache wasn't being cleared after mount attempts, causing stale data
- No throttling between mount attempts - rapid retries overwhelmed the system
- Mount command would hang without any error handling

**Fixes Implemented:**
1. **Added `execShellWithTimeout()` function** (AlfwShell.js:39-90)
   - Wraps shell commands with configurable timeout (default 15s)
   - Kills hanging processes automatically
   - Prevents application freeze on slow/stuck commands

2. **Mount Attempt Throttling** (AlfwDisk.js:51-68)
   - Prevents mount attempts within 5 seconds of last attempt
   - Tracks last mount attempt time per disk
   - Eliminates infinite retry loops

3. **Multi-Strategy ExFAT Mounting** (AlfwDisk.js:150-180, 188-218)
   - Strategy 1: Quick mount with 5s timeout
   - Strategy 2: Mount entire disk instead of partition
   - Strategy 3: Verify volume and retry
   - Provides clear error messages with recovery steps

4. **Cache Invalidation** (AlfwDisk.js:72-75, diskutil/index.js:634-656)
   - Clears disk info cache before/after mount operations
   - Added `clearDiskInfoCache()` function to diskutil module
   - Ensures fresh disk status after operations

5. **Improved Force Unmount** (AlfwDisk.js:100-108)
   - Uses `diskutil unmount force` for ExFAT
   - 5-second timeout on unmount operations
   - Better handling of already-unmounted drives

### 2. **ExFAT Mount Verification Bug** (AlfwDisk.js:160-180)
**Problem:** Mount verification was looking for exact string "Mounted:              Yes" with specific spacing, which could fail with different diskutil output formats.

**Fix:** Updated verification logic to be more flexible:
- Now uses regex matching for "Mounted: Yes" (case-insensitive, flexible spacing)
- Added fallback verification using `mount` command
- ExFAT mounts are verified differently than NTFS (no read-only check needed for exFAT)

### 2. **ExFAT Unmounting Bug** (AlfwDisk.js:305-320)
**Problem:** ExFAT drives were being unmounted using `umount` with `execShellSudo`, which requires sudo password unnecessarily since exFAT is natively supported by macOS.

**Fix:** 
- ExFAT now uses `diskutil unmount` without sudo (via `execShell`)
- NTFS continues to use `umount` with sudo
- Added specific logging for each filesystem type

### 3. **Improved Auto-Mount Logic** (AlfwCommon.js:256-287)
**Problem:** The filter function wasn't clear about when to remount exFAT vs NTFS drives.

**Fix:**
- ExFAT drives are now only remounted if unmounted (never have readonly issue)
- NTFS drives are remounted if unmounted OR if mounted as readonly
- Added detailed logging for debugging

### 4. **Better Error Handling and Logging** (AlfwDisk.js:54-75)
**Problem:** Error messages were not descriptive enough for debugging exFAT issues.

**Fix:**
- Added detailed logging showing disk type, mount status, and readonly status
- Improved error messages to indicate what went wrong
- Fixed lock cleanup on error to prevent stuck states

### 5. **Mount Path Handling for ExFAT** (AlfwDisk.js:130-155)
**Problem:** ExFAT mounting code was not properly documented and could cause confusion.

**Fix:**
- Added clear comments explaining that exFAT uses native macOS mounting
- Documented that `diskutil mount` mounts to default `/Volumes/` location
- Added success logging with unicode checkmarks for visual confirmation

## Testing Recommendations

### Manual Testing:
1. **Unmounted ExFAT Drive:**
   - Connect an unmounted exFAT drive
   - Verify it appears in the external volume list
   - Click mount button - should mount instantly without password prompt
   - Verify it shows as mounted with green dot

2. **Already Mounted ExFAT Drive:**
   - Connect a pre-mounted exFAT drive
   - Verify it shows as already mounted
   - Clicking mount should show "already accessible" message

3. **Auto-Mount Feature:**
   - Enable "Automatically mount NTFS and ExFAT disk" in settings
   - Connect an unmounted exFAT drive
   - Verify it auto-mounts within a few seconds

4. **Unmount ExFAT Drive:**
   - Mount an exFAT drive
   - Click eject button
   - Should unmount without password prompt
   - Verify clean unmount without errors

### Command Line Verification:
```bash
# Check if drive is detected
diskutil list

# Check specific drive info (replace disk2s1 with your device)
diskutil info disk2s1

# Mount exFAT drive
diskutil mount disk2s1

# Verify mount
mount | grep disk2s1

# Unmount
diskutil unmount disk2s1
```

## Expected Behavior After Fixes

### ExFAT Drives:
✓ Mount without requiring sudo password  
✓ Unmount without requiring sudo password  
✓ Auto-mount when "auto mount" is enabled  
✓ Show proper mount status (green dot when mounted)  
✓ Never show "Read-Only" badge (exFAT is always read-write on macOS)  

### NTFS Drives:
✓ Mount with sudo password (required for FUSE)  
✓ Unmount with sudo  
✓ Auto-mount when "auto mount" is enabled  
✓ Show "Read-Only" badge if mounted readonly  
✓ Remount as read-write if initially mounted readonly  

## Code Changes Summary

**Files Modified:**
1. `/src/common/utils/AlfwDisk.js` - Main mounting/unmounting logic
2. `/src/common/utils/AlfwCommon.js` - Auto-mount filter logic

**Lines Changed:**
- AlfwDisk.js: ~60 lines modified/improved
- AlfwCommon.js: ~30 lines modified/improved

**No Breaking Changes:**
- All existing NTFS functionality preserved
- ExFAT support enhanced
- Backward compatible with existing configurations
