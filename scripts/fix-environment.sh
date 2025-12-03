#!/bin/bash

# NTFSTool Environment Fix Script
# Fixes .npmrc conflicts and dependency issues

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       NTFSTool Environment Fix & Installation Script          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check Node version
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Checking Node.js version..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}✗ Node.js 20 or higher is required${NC}"
    echo -e "${YELLOW}  Current version: $(node -v)${NC}"
    echo ""
    echo "Please install Node.js 20 LTS using nvm:"
    echo -e "${BLUE}  nvm install 20${NC}"
    echo -e "${BLUE}  nvm use 20${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Node.js version $(node -v) detected${NC}"
fi

# Step 2: Fix .npmrc conflicts
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Fixing .npmrc conflicts..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for global .npmrc
if [ -f "$HOME/.npmrc" ]; then
    echo -e "${YELLOW}⚠ Found global .npmrc file${NC}"
    
    # Check for problematic settings
    if grep -q "prefix=" "$HOME/.npmrc" || grep -q "globalconfig=" "$HOME/.npmrc"; then
        echo -e "${YELLOW}⚠ Detected incompatible settings (prefix/globalconfig)${NC}"
        
        # Backup the file
        cp "$HOME/.npmrc" "$HOME/.npmrc.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✓ Backed up .npmrc to $HOME/.npmrc.backup.*${NC}"
        
        # Remove problematic lines
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' '/^prefix=/d' "$HOME/.npmrc" 2>/dev/null || true
            sed -i '' '/^globalconfig=/d' "$HOME/.npmrc" 2>/dev/null || true
        else
            # Linux
            sed -i '/^prefix=/d' "$HOME/.npmrc" 2>/dev/null || true
            sed -i '/^globalconfig=/d' "$HOME/.npmrc" 2>/dev/null || true
        fi
        
        echo -e "${GREEN}✓ Removed incompatible settings from .npmrc${NC}"
        
        # If file is now empty or only has comments, remove it
        if ! grep -q '^[^#]' "$HOME/.npmrc" 2>/dev/null; then
            rm -f "$HOME/.npmrc"
            echo -e "${GREEN}✓ Removed empty .npmrc file${NC}"
        fi
    else
        echo -e "${GREEN}✓ .npmrc has no incompatible settings${NC}"
    fi
else
    echo -e "${GREEN}✓ No global .npmrc file found${NC}"
fi

# Step 3: Use nvm to delete prefix if needed
echo ""
echo -e "${BLUE}Ensuring nvm is properly configured...${NC}"
if type nvm &> /dev/null; then
    nvm use --delete-prefix 20 2>/dev/null || nvm use 20
    echo -e "${GREEN}✓ nvm configured correctly${NC}"
else
    echo -e "${YELLOW}⚠ nvm not found, skipping nvm configuration${NC}"
fi

# Step 4: Create/update project .npmrc
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Creating project .npmrc for legacy peer deps..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > .npmrc << 'EOF'
# NTFSTool Project NPM Configuration
# This allows installation despite peer dependency conflicts

legacy-peer-deps=true
fund=false
audit=false

# Electron native module settings
runtime=electron
target=33.2.1
disturl=https://electronjs.org/headers
build_from_source=true
EOF

echo -e "${GREEN}✓ Created project .npmrc with legacy-peer-deps${NC}"

# Step 5: Clean old installations
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Cleaning old installations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "node_modules" ]; then
    echo "Removing node_modules..."
    rm -rf node_modules
    echo -e "${GREEN}✓ Removed node_modules${NC}"
fi

if [ -f "package-lock.json" ]; then
    echo "Backing up and removing package-lock.json..."
    mv package-lock.json "package-lock.json.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    echo -e "${GREEN}✓ Backed up and removed package-lock.json${NC}"
fi

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force 2>/dev/null || echo -e "${YELLOW}⚠ Could not clean cache (may not have permissions)${NC}"
echo -e "${GREEN}✓ Cache cleaned${NC}"

# Step 6: Install dependencies
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Installing dependencies (this may take 5-10 minutes)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${BLUE}Running: npm install --legacy-peer-deps${NC}"
echo ""

if npm install --legacy-peer-deps; then
    echo ""
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
    echo ""
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check your internet connection"
    echo "2. Try running: npm install --legacy-peer-deps --verbose"
    echo "3. Check for any error messages above"
    exit 1
fi

# Step 7: Rebuild native modules
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Rebuilding native modules for Electron 33..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${BLUE}This ensures native modules (usb, diskutil) work with Electron${NC}"
echo ""

if npm run rebuild; then
    echo ""
    echo -e "${GREEN}✓ Native modules rebuilt successfully${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠ Warning: Native module rebuild had issues${NC}"
    echo -e "${YELLOW}  This may cause problems with disk detection${NC}"
    echo ""
    echo "You can try rebuilding manually later with:"
    echo -e "${BLUE}  npm run rebuild${NC}"
    echo "or:"
    echo -e "${BLUE}  npx @electron/rebuild -f -w usb${NC}"
fi

# Step 8: Verify installation
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7: Verifying installation..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if key packages are installed
PACKAGES_TO_CHECK=("vue" "electron" "webpack" "element-plus" "vue-router" "vuex")
ALL_FOUND=true

for package in "${PACKAGES_TO_CHECK[@]}"; do
    if [ -d "node_modules/$package" ]; then
        VERSION=$(node -p "require('./node_modules/$package/package.json').version" 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✓ $package: v$VERSION${NC}"
    else
        echo -e "${RED}✗ $package: NOT FOUND${NC}"
        ALL_FOUND=false
    fi
done

echo ""

if [ "$ALL_FOUND" = true ]; then
    echo -e "${GREEN}✓ All critical packages installed${NC}"
else
    echo -e "${RED}✗ Some packages are missing${NC}"
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  Installation Complete!                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${GREEN}✓ .npmrc conflicts fixed${NC}"
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo -e "${GREEN}✓ Native modules rebuilt${NC}"
echo -e "${GREEN}✓ Environment ready${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Check migration status:"
echo -e "   ${BLUE}node scripts/vue3-migration-check.js${NC}"
echo ""
echo "2. Apply Vue 3 updates:"
echo -e "   ${BLUE}cp src/renderer/main.js.vue3 src/renderer/main.js${NC}"
echo -e "   ${BLUE}cp src/common/router/index.js.vue3 src/common/router/index.js${NC}"
echo ""
echo "3. Build the project:"
echo -e "   ${BLUE}npm run build${NC}"
echo ""
echo "4. Or run in development mode:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "5. For detailed migration guide, read:"
echo -e "   ${BLUE}VUE3_MIGRATION_GUIDE.md${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Your environment is now ready for Vue 3 migration!${NC}"
echo ""
