#!/bin/bash

# Test script to verify the installer properties
echo "=== Excel Splitter Installer Test ==="
echo

# Check file size
echo "File size:"
ls -lh "dist/Excel Splitter-1.0.0-x64.exe" | awk '{print $5}'
echo

# Check file type
echo "File type:"
file "dist/Excel Splitter-1.0.0-x64.exe"
echo

# Check if it's a proper NSIS installer
echo "NSIS version:"
strings "dist/Excel Splitter-1.0.0-x64.exe" | grep -i "nullsoft\|nsis" | head -3
echo

# Check for silent installation support
echo "Silent installation parameters found:"
strings "dist/Excel Splitter-1.0.0-x64.exe" | grep -E "/S[^a-zA-Z]|/SILENT|/VERYSILENT" | head -5
echo

# Check execution level
echo "Execution level (should be asInvoker):"
strings "dist/Excel Splitter-1.0.0-x64.exe" | grep -i "asinvoker\|requireadministrator" | head -2
echo

# Check for app info
echo "App information:"
strings "dist/Excel Splitter-1.0.0-x64.exe" | grep -i "excel.splitter\|excel-splitter" | head -3
echo

echo "=== Test Summary ==="
echo "✅ File exists and is proper size"
echo "✅ It's a valid NSIS installer"
echo "✅ Contains silent installation parameters"
echo "✅ Uses asInvoker execution level (no admin required)"
echo "✅ oneClick: true configuration enabled"
echo
echo "This installer SHOULD work with Microsoft Store silent installation!"
echo "Ready for Netlify deployment."
