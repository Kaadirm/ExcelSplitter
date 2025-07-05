# Excel Splitter ✂️

A modern Electron desktop application for intelligently splitting large Excel files while preserving data groupings.

## 🎯 Features

- **Smart Grouping**: Keeps rows with the same "Model Kodu" and "PT" values together
- **Flexible Row Limits**: Targets ~7,000 rows per file but can exceed to preserve groupings
- **Intelligent Sorting**: Automatically sorts data by Model Kodu (A-Z) before splitting
- **Multiple Column Support**: Works with various column name formats
- **User-Friendly Interface**: Modern, responsive UI with progress tracking
- **Windows Compatible**: Full Windows build support

## 🚀 How It Works

1. **Select Excel File**: Choose any .xlsx or .xls file
2. **Configure Split**: Set number of output files and row limit preferences
3. **Smart Processing**: App sorts data and finds optimal split points
4. **Preserve Groups**: Same Model Kodu + PT combinations stay in the same file
5. **Save Results**: Organized split files ready for use

## 📊 Row Limit Behavior

- **Target**: ~7,000 rows per file
- **Flexible**: Can exceed to 7,300-7,500 rows to keep groups together
- **Priority**: Group integrity > strict row limits
- **Option**: Can disable row limits entirely for pure count-based splitting

## 🔧 Supported Column Names

**Model Kodu**: `Model Kodu`, `ModelKodu`, `model_kodu`, `Varyasyon`, `varyasyon`
**PT**: `PT`, `pt`, `PTD`, `ptd`, `P.T.`, `P.T.D.`

## 💻 Installation

### From Source
```bash
npm install
npm start
```

### Windows Executable
Download and run the pre-built .exe file (no installation required)

## 📁 Project Structure

```
├── main.js          # Electron main process & splitting logic
├── app.js           # Frontend application logic
├── index.html       # User interface
├── styles.css       # Styling and responsive design
├── renderer.js      # IPC communication bridge
└── package.json     # Dependencies and build scripts
```

## 🛠️ Build Commands

- `npm start` - Run in development
- `npm run build` - Build for current platform
- `npm run build:win` - Build Windows executable
- `npm run build:all` - Build for all platforms

## 🎉 Perfect For

- Large product catalogs with variant groupings
- Inventory data with model/style codes
- Any Excel data requiring intelligent grouping
- Teams needing consistent data organization

---

**Built with Electron • Optimized for Windows • Smart Grouping Technology**
