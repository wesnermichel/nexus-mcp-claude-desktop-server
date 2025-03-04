#!/bin/bash

# Check if the ZIP file exists
ZIP_FILE="nexus-mcp-bridge-0.1.0.zip"
if [ ! -f "$ZIP_FILE" ]; then
    echo "❌ Package file not found: $ZIP_FILE"
    echo "Please run build.sh first."
    exit 1
fi

# Define the extensions directory
EXTENSIONS_DIR="$HOME/.vscode/extensions/nexus-mcp-bridge-0.1.0"

# Create the extension directory if it doesn't exist
echo "📂 Creating extension directory..."
mkdir -p "$EXTENSIONS_DIR"

# Extract the ZIP file to the extensions directory
echo "📦 Extracting package..."
unzip -q -o "$ZIP_FILE" -d "$EXTENSIONS_DIR"

# Set permissions
chmod -R u+rw "$EXTENSIONS_DIR"

echo "✅ Installation complete!"
echo "Please restart VSCode to activate the extension."
