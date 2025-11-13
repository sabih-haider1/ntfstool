# 🚀 Quick Start Guide

## For Users

### Installation
1. Download the latest release from [GitHub Releases](https://github.com/ntfstool/ntfstool/releases)
2. Open the `.dmg` file and drag NTFSTool to Applications
3. Launch the app - **no license key required!**

### What You Get
- ✅ Full NTFS read/write support for macOS
- ✅ Completely free - no restrictions
- ✅ Works on Intel and Apple Silicon Macs
- ✅ Simple, clean interface

---

## For Developers

### Development Setup
```bash
# Clone repository
git clone https://github.com/ntfstool/ntfstool.git
cd ntfstool

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Building
```bash
# Build for production
npm run build

# Output: build/NTFSTool-{version}.dmg
```

### Publishing a Release
See [FORK_PUBLISHING_GUIDE.md](./FORK_PUBLISHING_GUIDE.md) for detailed steps.

**Quick version:**
```bash
# 1. Update version in package.json
# 2. Update CHANGELOG.md

# 3. Commit and tag
git add .
git commit -m "release: v{version}"
git tag -a v{version} -m "Release v{version}"

# 4. Push
git push origin master --tags

# 5. Build and upload to GitHub Releases
npm run build
```

---

## Important Documentation

- **[FREE_USE_NOTICE.md](./FREE_USE_NOTICE.md)** - License and permissions
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history
- **[FORK_PUBLISHING_GUIDE.md](./FORK_PUBLISHING_GUIDE.md)** - Detailed publishing guide
- **[README.md](./README.md)** - Full project documentation

---

## Tech Stack

- **Electron** - Desktop framework
- **Vue 3** - UI framework
- **Element Plus** - Component library
- **Node.js** - Runtime

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

**Always maintain attribution to original author Dr_rOot!**

---

## License

MIT License - See [LICENSE](./LICENSE) and [FREE_USE_NOTICE.md](./FREE_USE_NOTICE.md)

**Original Author:** Dr_rOot  
**Community Fork Maintainers:** NTFS Tool Community

---

**Need help?** Open an issue on GitHub!
