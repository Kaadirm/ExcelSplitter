# MSIX Packaging Tool - Troubleshooting Guide

## 🔧 **Common Issues and Solutions**

### Issue 1: "MSIX Packaging Tool not found in Microsoft Store"

**Solution:**

- Ensure you're using Windows 10 version 1809 or later
- Check if your Windows edition supports MSIX (Pro, Enterprise, Education)
- Try searching for "MSIX Packaging Tool" exactly as written

### Issue 2: "Package creation failed"

**Solution:**

- Run MSIX Packaging Tool as Administrator
- Ensure your EXE installer works correctly first
- Use a clean Windows environment (VM recommended)
- Disable antivirus temporarily during packaging

### Issue 3: "App doesn't work after MSIX packaging"

**Solution:**

- Test your original EXE installer first
- Ensure all dependencies are included
- Check if app requires admin privileges (MSIX apps run sandboxed)
- Verify file paths and permissions

### Issue 4: "Publisher name issues"

**Solution:**

- Use consistent publisher name: "Excel Splitter Team"
- Avoid special characters in publisher name
- Must match your Microsoft Store developer account

### Issue 5: "Version number format errors"

**Solution:**

- Use format: 1.0.0.0 (four numbers)
- Don't use letters or special characters
- Increment version for updates

## 🛠️ **Pre-Packaging Verification**

Before using MSIX Packaging Tool, verify:

1. **EXE Works**: Download and test your EXE manually
2. **Clean Install**: Install on fresh Windows to test
3. **All Features**: Ensure all Excel splitting features work
4. **No Errors**: No runtime errors or missing files
5. **Proper Uninstall**: Can uninstall cleanly

## 📋 **Alternative Options if MSIX Tool Fails**

### Option A: Try Different Windows Version

- Windows 11 (latest)
- Windows 10 21H2 or later
- Windows Server 2019/2022

### Option B: Use Different Packaging Method

- Visual Studio MSIX project
- Windows Application Packaging Project
- Manual MSIX creation with MakeAppx.exe

### Option C: Cloud-based Solutions

- Azure Virtual Machine with Windows
- AWS EC2 Windows instance
- Use GitHub Actions (we can try to fix this)

## 🔍 **Testing Your MSIX Package**

After creating MSIX:

1. **Install Locally**: Double-click MSIX to install
2. **Test Functionality**: Run Excel Splitter and test features
3. **Check Start Menu**: Verify app appears in Start Menu
4. **Test Uninstall**: Uninstall via Settings > Apps
5. **Check Clean Removal**: No leftover files/registry entries

## 🎯 **Success Indicators**

You'll know it worked when:

- ✅ MSIX installs without errors
- ✅ Excel Splitter runs correctly
- ✅ All features work as expected
- ✅ App appears in Start Menu
- ✅ Uninstall works cleanly

## 📞 **If All Else Fails**

**Fallback Options:**

1. **Purchase Code Signing Certificate**: $200-400/year
2. **Use Microsoft Trusted Signing**: Their paid signing service
3. **GitHub Actions MSIX**: We can try to fix the automated build

**Contact Support:**

- Microsoft Store Partner Center support
- MSIX Packaging Tool documentation
- Windows Developer Community forums

## 📂 **File Locations**

Keep these files organized:

- **Original EXE**: `ExcelSplitter-1.0.0-x64.exe`
- **Generated MSIX**: `ExcelSplitter_1.0.0.0_x64.msix` (or similar)
- **Packaging Logs**: Usually in `%TEMP%\MsixPackagingTool`
