#!/bin/bash


# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set permissions if needed
chmod +x build.sh

# Build the webpack bundle 
echo "🔨 Bundling code with webpack..."
npm run package

# Create a temporary directory for packaging
echo "📦 Creating package..."
TEMP_DIR="temp_package"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy essential files to temp directory
cp -r package.json README.md LICENSE USAGE_GUIDE.md SETUP_GUIDE.md dist "$TEMP_DIR"
mkdir -p "$TEMP_DIR/resources"
touch "$TEMP_DIR/resources/.keep"

# Create zip file (simple alternative to VSIX)
ZIP_FILE="nexus-mcp-bridge-0.1.0.zip"
rm -f "$ZIP_FILE"
cd "$TEMP_DIR"
zip -r "../$ZIP_FILE" .
cd ..

# Clean up
rm -rf "$TEMP_DIR"

echo "✅ Build complete! Package created: $ZIP_FILE"
echo ""
echo "To install the extension in VSCode:"
echo "1. Extract the ZIP file contents to ~/.vscode/extensions/nexus-mcp-bridge-0.1.0/"
echo "2. Restart VSCode"
