#!/bin/bash

# Build script for Windows executable
echo "Building Excel Splitter for Windows..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Create icon from SVG if needed
if [ ! -f "assets/icon.ico" ]; then
    echo "Note: You need to convert assets/icon.svg to assets/icon.ico"
    echo "You can use online converters like https://convertio.co/svg-ico/"
    echo "Or install imagemagick: brew install imagemagick"
    echo "Then run: convert assets/icon.svg -resize 256x256 assets/icon.ico"
fi

# Build Windows executable
echo "Building Windows installer and portable version..."
npm run build-win

echo "Build complete! Check the dist/ folder for your Windows executables."
echo "Files generated:"
echo "- Excel Splitter-1.0.0-x64.exe (Installer)"
echo "- Excel Splitter-1.0.0-x64.exe (Portable)"
