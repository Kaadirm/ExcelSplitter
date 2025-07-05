# Excel Splitter - User Guide 📋

## 🎯 What This App Does

Excel Splitter intelligently splits large Excel files while keeping related data together. Perfect for product catalogs, inventory data, and any Excel files with grouped information.

## 🚀 Quick Start

1. **Launch**: Double-click the app or run `npm start`
2. **Select File**: Click "Select Excel File" and choose your .xlsx/.xls file
3. **Configure**: Set number of output files and row limit preference
4. **Split**: Click "Split Excel File" and choose save location
5. **Done**: Your organized split files are ready!

## 📊 Smart Features

### Intelligent Grouping

- **Primary**: Groups files by PT values - never splits PT groups across files
- **Secondary**: Groups by Model Kodu within each PT group
- Maintains data relationships and integrity
- Prioritizes PT boundaries over row count limits

### Flexible Row Management

- **Default**: ~7,000 rows per file (recommended)
- **Flexible**: Can exceed to 7,300+ rows to preserve groups
- **Priority**: Data integrity over strict limits
- **Option**: Disable limits for pure count-based splitting

### Automatic Organization

- Sorts data by PT first, then by Model Kodu (A-Z) before processing
- Finds optimal split points prioritizing PT group boundaries
- Real-time progress tracking

## 🔧 Column Support

The app automatically detects these column names:

**Model Kodu**: `Model Kodu`, `ModelKodu`, `Varyasyon`, `varyasyon`
**PT**: `PT`, `pt`, `PTD`, `ptd`

## 💡 Perfect For

- Large product catalogs (100k+ rows)
- Inventory management systems
- E-commerce product data
- Manufacturing part lists
- Any data requiring smart grouping

## 🎉 Results

Your split files will be:

- ✅ Properly grouped (no broken relationships)
- ✅ Optimally sized (~7,000 rows each)
- ✅ Alphabetically organized
- ✅ Ready for immediate use

---

**Excel Splitter - Smart. Fast. Reliable.** 🏆
