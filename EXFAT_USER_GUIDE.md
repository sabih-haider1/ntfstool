# NTFS and ExFAT Support - User Guide

## What's New?

The NTFS Tool now fully supports **both NTFS and ExFAT** file systems with a beautiful, modern interface inspired by macOS Monterey! You can now mount, unmount, and manage ExFAT drives alongside your NTFS drives using the same familiar interface.

## Supported File Systems

✅ **NTFS** - Full read/write support via FUSE-T drivers  
✅ **ExFAT** - Full read/write support via native macOS (no password required!)  
ℹ️  **FAT32, HFS+, APFS** - Automatically handled by macOS (no mounting needed)

## Key Features

### 🎨 Modern UI Design
- macOS Monterey-inspired interface with frosted glass effects
- Color-coded disk usage bars:
  - 🟢 Green (0-50% used)
  - 🟡 Yellow (50-80% used)
  - 🔴 Red (80-100% used)
- Accurate disk usage percentages with proper unit conversion
- Modern gear icon menu with smooth animations

### 🌍 Multi-Language Support
- 20+ languages supported
- Language changes apply immediately
- Automatic fallback to English for incomplete translations

### ⚙️ Fully Functional Settings
- **General Tab**: Auto-run, auto-mount, theme selection, language picker
- **Notice Tab**: Notification preferences
- **Privacy Tab**: Privacy policy information
- **Update Tab**: Update preferences and configuration reset

## How to Use

### Mounting a Drive

1. Connect your NTFS or ExFAT external drive
2. The drive will appear in the "External volume" section
3. If unmounted, click the mount icon (↻) next to the drive name
4. **ExFAT drives mount instantly** without requiring a password!
5. **NTFS drives** will prompt for your system password (required for FUSE-T)
6. The drive will be mounted with full read/write access

### Unmounting a Drive

1. Find your mounted drive in the list
2. Click the eject icon (⏏) next to the drive name
3. The drive will be safely unmounted
4. You can now disconnect the drive safely

### Auto-Mount Feature

Enable automatic mounting in **Settings → General**:

1. Click the gear icon in the top-right corner
2. Select "Preferences"
3. Check "Automatically mount NTFS and ExFAT disk"
4. New drives will mount automatically when connected!
- Toggle "Automatically mount NTFS and ExFAT disk"
- Both NTFS and ExFAT drives will auto-mount when connected

## Visual Indicators

- **Green dot** = Drive is mounted and accessible
- **Gray dot** = Drive is not mounted
- **Read-Only badge** = Drive is mounted but in read-only mode (NTFS only)

## Common Questions

**Q: Will my ExFAT drives work the same as NTFS drives?**  
A: Yes! Both file systems are fully supported with read/write access.

**Q: Do I need to install additional drivers for ExFAT?**  
A: No. ExFAT uses native macOS support (no FUSE required).

**Q: Can I use both NTFS and ExFAT drives at the same time?**  
A: Absolutely! Mount and manage as many drives as you need.

**Q: What about FAT32 drives?**  
A: FAT32 drives are automatically mounted by macOS and don't need this tool.

**Q: Why does it still say "NTFS Tool"?**  
A: The name remains for brand consistency, but the tool now supports multiple file systems.

## Error Messages

- **"Only NTFS and ExFAT drives are supported for mounting"**  
  This appears when trying to mount an unsupported file system (FAT32, APFS, etc.)

- **"Mount failed"**  
  Check if you have proper permissions and the drive is properly connected

## Performance Notes

- **ExFAT**: Uses native macOS drivers - excellent performance, **NO sudo password needed**
- **NTFS**: Uses FUSE drivers - good performance, requires sudo password for write access
- **NTFS**: Uses FUSE drivers - requires sudo permissions for write access

## Tips

1. Always safely eject drives before unplugging
2. Enable auto-mount for convenience
3. Keep your drives formatted as NTFS or ExFAT for best compatibility
4. Check drive health regularly

## Troubleshooting

**Drive not appearing?**
- Ensure it's properly connected
- Check if it's already mounted in Finder
- Try refreshing the device list

**Can't mount the drive?**
- Verify it's NTFS or ExFAT formatted
- Check system permissions
- Restart the application

**Read-only mode on NTFS?**
- Enter your admin password when prompted
- Check if FUSE drivers are installed

## Need Help?

- Check the full documentation in EXFAT_SUPPORT_CHANGES.md
- Submit feedback through the app's Feedback menu
- Visit the project repository for support

---

Enjoy seamless management of both NTFS and ExFAT drives! 🎉
