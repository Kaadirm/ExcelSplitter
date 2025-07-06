# Microsoft Store Compliance Statement

## Excel Splitter - Bundleware Compliance Declaration

**Application**: Excel Splitter  
**Version**: 1.0.0  
**Publisher**: Excel Splitter Team  
**Submission Date**: July 6, 2025

### Bundleware Compliance Statement

**Excel Splitter explicitly declares compliance with Microsoft Store Policy 10.2.2 regarding bundleware:**

1. **No Third-Party Software**: Excel Splitter does not install, download, or bundle any third-party software, toolbars, browser extensions, or additional applications.

2. **Standalone Application**: Excel Splitter is a completely standalone desktop application that only installs:

   - The main Excel Splitter executable
   - Required application files (HTML, CSS, JavaScript)
   - Application shortcuts (Desktop and Start Menu)
   - Uninstaller

3. **No Network Dependencies**: The application does not download additional software during or after installation.

4. **No Registry Modifications**: Beyond standard application registration for Add/Remove Programs, no unauthorized registry modifications are made.

5. **Clean Uninstall**: The uninstaller removes all application files and registry entries, leaving no residual software.

### Technical Implementation

- **Installer Type**: NSIS (Nullsoft Scriptable Install System)
- **Installation Scope**: User-level only (no administrator privileges required)
- **Installation Location**: User's AppData folder
- **Components**: Only Excel Splitter application files

### Files Installed

```
%LOCALAPPDATA%/Programs/Excel Splitter/
├── Excel Splitter.exe          (Main application)
├── index.html                  (UI)
├── renderer.js                 (Application logic)
├── styles.css                  (Styling)
├── app.js                      (Core functionality)
├── main.js                     (Electron main process)
├── node_modules/               (Required dependencies)
└── uninstall.exe              (Uninstaller)
```

### Registry Entries (Add/Remove Programs Only)

- `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\Excel Splitter`
- `HKCU\SOFTWARE\ExcelSplitter` (Application settings only)

### Compliance Verification

The installer has been configured with:

- `oneClick: true` - No user interaction required
- `allowElevation: false` - No administrator privileges
- `perMachine: false` - User-level installation only
- Custom NSIS script with explicit bundleware prevention

### Contact Information

For any compliance questions or verification:

- **Repository**: https://github.com/Kaadirm/ExcelSplitter
- **Support**: Via GitHub Issues
- **License**: MIT

---

**This statement confirms that Excel Splitter complies with all Microsoft Store policies regarding bundleware and third-party software installation.**
