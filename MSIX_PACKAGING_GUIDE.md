# MSIX Packaging Guide for Microsoft Store

## Overview

Microsoft strongly recommends converting your EXE installer to MSIX format for Microsoft Store submission. MSIX provides several benefits including free code signing.

## Benefits of MSIX Format:

1. **Free Code Signing**: Microsoft handles signing automatically
2. **Free Hosting**: No need for external hosting like Vercel
3. **Better Integration**: Native Windows Store integration
4. **Automatic Updates**: Built-in update mechanism
5. **Sandboxed Installation**: Enhanced security

## How to Convert EXE to MSIX:

### Method 1: MSIX Packaging Tool (Recommended) - SELECTED APPROACH

**Step-by-Step Instructions:**

#### Prerequisites:

- Windows 10/11 machine (or Windows VM)
- Your working EXE installer: `ExcelSplitter-1.0.0-x64.exe`
- Download URL: https://excel-splitter-omega.vercel.app/ExcelSplitter-1.0.0-x64.exe

#### Step 1: Install MSIX Packaging Tool

1. Open Microsoft Store on Windows
2. Search for "MSIX Packaging Tool"
3. Install the official Microsoft MSIX Packaging Tool
4. Launch the tool

#### Step 2: Prepare Clean Environment

1. Use a clean Windows VM or fresh Windows installation
2. Ensure Windows is updated
3. Close all unnecessary applications
4. Download your EXE installer to the machine

#### Step 3: Create MSIX Package

1. Open MSIX Packaging Tool
2. Click "Application package"
3. Select "Create package on this computer"
4. Choose "Create new package"
5. Browse and select your `ExcelSplitter-1.0.0-x64.exe`
6. Follow the installation wizard:
   - Let the tool monitor the installation
   - Install your app normally (run the EXE)
   - Test the installed app to ensure it works
   - Complete the packaging process

#### Step 4: Configure Package Details

Fill in the package information:

- **Package Name**: ExcelSplitter
- **Package Display Name**: Excel Splitter
- **Publisher Display Name**: Excel Splitter Team
- **Version**: 1.0.0.0
- **Description**: Professional Excel file splitter desktop application

#### Step 5: Generate MSIX

1. The tool will create the MSIX package
2. Test the generated MSIX locally
3. Save the MSIX file for submission

### Method 2: electron-builder MSIX Target

We can try building MSIX directly using electron-builder:

```json
{
  "win": {
    "target": [
      {
        "target": "appx",
        "arch": ["x64"]
      }
    ]
  }
}
```

### Method 3: Manual MSIX Creation

1. Create AppxManifest.xml
2. Package using MakeAppx.exe
3. Sign using SignTool.exe

## Current Status Options:

### Option A: Try MSIX Build Again

- Fix the electron-builder MSIX build that was failing
- This would create a native MSIX package

### Option B: Use Microsoft's MSIX Packaging Tool

- Install the tool on Windows
- Convert your working EXE to MSIX
- Submit the MSIX instead of EXE

### Option C: Use Microsoft Trusted Signing

- Sign your existing EXE using Microsoft's signing service
- Keep current EXE format but with valid signature

## Next Steps - MSIX Packaging Tool Process:

### 🎯 **Current Action Plan:**

1. **Get Windows Access**: Use Windows 10/11 machine or VM
2. **Download MSIX Packaging Tool**: From Microsoft Store
3. **Download Your Installer**: https://excel-splitter-omega.vercel.app/ExcelSplitter-1.0.0-x64.exe
4. **Create MSIX Package**: Follow the step-by-step process above
5. **Submit to Microsoft Store**: Use the generated MSIX file

### 📋 **What You'll Get:**

- ✅ **Automatically Code Signed**: Microsoft handles signing
- ✅ **No Certificate Cost**: Free signing through Microsoft Store
- ✅ **Native Store Integration**: Better user experience
- ✅ **Automatic Updates**: Built-in update mechanism
- ✅ **Passes All Validations**: No more code sign check failures

### 🔧 **If You Don't Have Windows Access:**

1. **Use a Windows VM**:

   - VirtualBox + Windows 11 (free)
   - VMware Fusion (paid)
   - Parallels Desktop (paid)

2. **Cloud Windows**:

   - Azure Virtual Machine
   - AWS EC2 Windows instance
   - Google Cloud Windows VM

3. **Ask Someone**: Friend/colleague with Windows machine

### 📱 **After Creating MSIX:**

1. **Delete Current Win32 Submission**: In Microsoft Store Partner Center
2. **Create New MSIX Submission**: Upload your MSIX file
3. **No External Hosting Needed**: Microsoft Store hosts the MSIX
4. **Automatic Code Signing**: Microsoft signs it for you

## Important Notes:

- If you switch to MSIX, you need to delete your current Win32 app submission
- MSIX apps have different capabilities and limitations
- MSIX is the future direction for Windows apps

Would you like to try the MSIX approach first since Microsoft is strongly recommending it?
