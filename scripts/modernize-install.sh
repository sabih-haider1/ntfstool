#!/bin/bash

# NTFSTool Modernization Installation Script
# This script automates the installation and setup process

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         NTFSTool Modernization Installation Script            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}✗ Node.js 20 or higher is required${NC}"
    echo -e "${YELLOW}  Current version: $(node -v)${NC}"
    echo ""
    echo "Please install Node.js 20 LTS:"
    echo "  Using nvm: nvm install 20 && nvm use 20"
    echo "  Or download from: https://nodejs.org/"
    exit 1
else
    echo -e "${GREEN}✓ Node.js version $(node -v) detected${NC}"
fi

# Check npm version
echo ""
echo "📦 Checking npm version..."
echo -e "${GREEN}✓ npm version $(npm -v) detected${NC}"

# Backup package-lock.json if exists
if [ -f "package-lock.json" ]; then
    echo ""
    echo "💾 Backing up package-lock.json..."
    mv package-lock.json package-lock.json.backup
    echo -e "${GREEN}✓ Backup created: package-lock.json.backup${NC}"
fi

# Clean node_modules
if [ -d "node_modules" ]; then
    echo ""
    echo "🧹 Cleaning old node_modules..."
    rm -rf node_modules
    echo -e "${GREEN}✓ node_modules removed${NC}"
fi

# Install dependencies
echo ""
echo "📥 Installing dependencies (this may take a few minutes)..."
if npm install; then
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

# Rebuild native modules
echo ""
echo "🔧 Rebuilding native modules..."
if npm run rebuild; then
    echo -e "${GREEN}✓ Native modules rebuilt successfully${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Native module rebuild had issues${NC}"
    echo "  You may need to run 'npm run rebuild' manually"
fi

# Check if Vue 3 files should be applied
echo ""
echo "❓ Would you like to apply Vue 3 updates now? (y/n)"
read -r APPLY_VUE3

if [ "$APPLY_VUE3" = "y" ] || [ "$APPLY_VUE3" = "Y" ]; then
    echo ""
    echo "📝 Applying Vue 3 updates..."
    
    # Backup original files
    if [ -f "src/renderer/main.js" ]; then
        cp src/renderer/main.js src/renderer/main.js.vue2.backup
        echo -e "${GREEN}✓ Backed up src/renderer/main.js → main.js.vue2.backup${NC}"
    fi
    
    if [ -f "src/common/router/index.js" ]; then
        cp src/common/router/index.js src/common/router/index.js.vue2.backup
        echo -e "${GREEN}✓ Backed up src/common/router/index.js → index.js.vue2.backup${NC}"
    fi
    
    # Apply Vue 3 versions
    if [ -f "src/renderer/main.js.vue3" ]; then
        cp src/renderer/main.js.vue3 src/renderer/main.js
        echo -e "${GREEN}✓ Applied Vue 3 version: src/renderer/main.js${NC}"
    fi
    
    if [ -f "src/common/router/index.js.vue3" ]; then
        cp src/common/router/index.js.vue3 src/common/router/index.js
        echo -e "${GREEN}✓ Applied Vue 3 version: src/common/router/index.js${NC}"
    fi
fi

# Run migration checker
echo ""
echo "🔍 Running Vue 3 migration checker..."
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠ Node.js not found, skipping migration checker${NC}"
elif [ -f "scripts/vue3-migration-check.js" ]; then
    node scripts/vue3-migration-check.js
else
    echo -e "${YELLOW}⚠ Migration checker not found${NC}"
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Installation Complete!                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo -e "${GREEN}✓ Native modules rebuilt${NC}"

if [ "$APPLY_VUE3" = "y" ] || [ "$APPLY_VUE3" = "Y" ]; then
    echo -e "${GREEN}✓ Vue 3 files applied${NC}"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Review the migration checker output above"
echo "2. Update remaining Vue components (see VUE3_MIGRATION_GUIDE.md)"
echo "3. Build the project:"
echo "   npm run build"
echo ""
echo "4. Test in development mode:"
echo "   npm run dev"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: MODERNIZATION_README.md"
echo "   - Vue 3 Guide: VUE3_MIGRATION_GUIDE.md"
echo "   - Full Details: MODERNIZATION_PLAN.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
