# Windows Build Configuration for Excel Splitter

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Building for Windows

### Option 1: Quick Build

```bash
npm run build-win
```

### Option 2: Build Installer Only

```bash
npm run build-win-installer
```

### Option 3: Build Portable Only

```bash
npm run build-win-portable
```

## Output Files

The built files will be in the `dist/` folder:

- `Excel Splitter-1.0.0-x64.exe` - Windows installer (NSIS)
- `Excel Splitter 1.0.0.exe` - Portable executable

## Distribution Requirements

- Windows 10 or later
- x64 architecture
- No additional runtime dependencies required

## Icon Requirements

You need to create an icon file at `assets/icon.ico`. You can:

1. Use the provided SVG file at `assets/icon.svg`
2. Convert it to ICO format using online tools or:
   ```bash
   # Using ImageMagick (install with brew install imagemagick)
   convert assets/icon.svg -resize 256x256 assets/icon.ico
   ```

## Code Signing (Optional)

For production distribution, consider code signing your executable:

1. Obtain a code signing certificate
2. Add signing configuration to package.json
3. Use electron-builder's signing features

## Antivirus Considerations

- Some antivirus software may flag unsigned executables
- Consider code signing for production releases
- See `scripts/antivirus-whitelist.md` for more information
