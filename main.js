const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const os = require('os');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'renderer.js')
    },
    title: 'Excel Splitter',
    titleBarStyle: 'default',
    show: false, // Don't show until ready
    center: true // Center the window on screen
  });

  // Load the HTML file
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on window
    if (process.platform === 'darwin') {
      app.dock.show();
    }
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for file operations
ipcMain.handle('select-excel-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('process-excel-file', async (event, filePath, numberOfFiles, enforceMaxRows = true) => {
  try {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    // Validate file size (50MB limit)
    const stats = fs.statSync(filePath);
    if (stats.size > 50 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 50MB.');
    }

    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON for processing
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
    
    if (data.length === 0) {
      throw new Error('No data found in the Excel file');
    }

    // Sort data by Model Kodu column (A to Z) before processing 🎯✨
    console.log('Sorting data by Model Kodu column A to Z...');
    
    // Find the Model Kodu column name
    const firstRow = data[0];
    const modelKoduVariants = ['Model Kodu', 'ModelKodu', 'model_kodu', 'Varyasyon', 'varyasyon', 'VARYASYON', 'MODEL_KODU'];
    let sortColumn = null;
    
    for (const variant of modelKoduVariants) {
      if (firstRow.hasOwnProperty(variant)) {
        sortColumn = variant;
        console.log(`Found sorting column: "${sortColumn}"`);
        break;
      }
    }
    
    if (sortColumn) {
      data.sort((a, b) => {
        const valueA = (a[sortColumn] || '').toString().toLowerCase();
        const valueB = (b[sortColumn] || '').toString().toLowerCase();
        
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      });
      console.log('Data sorted successfully! 📊✨');
    } else {
      console.log('⚠️ Model Kodu column not found for sorting. Available columns:', Object.keys(firstRow).join(', '));
      console.log('Data will be processed without sorting.');
    }

    // Auto-calculate optimal number of files if enforcing 7000 row limit
    let optimalNumberOfFiles = numberOfFiles;
    if (enforceMaxRows) {
      const minFilesNeeded = Math.ceil(data.length / 7000);
      if (numberOfFiles < minFilesNeeded) {
        optimalNumberOfFiles = minFilesNeeded;
        console.log(`📊 Auto-calculating optimal split: ${data.length} rows require at least ${minFilesNeeded} files for 7000 row limit`);
      }
    }

    // Split the data
    const splitData = splitExcelData(data, optimalNumberOfFiles, enforceMaxRows);
    
    // Ask user where to save the files
    const saveResult = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select folder to save split files'
    });

    if (saveResult.canceled) {
      return { success: false, message: 'Save cancelled by user' };
    }

    const outputDir = saveResult.filePaths[0];
    const originalName = path.basename(filePath, path.extname(filePath));
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const savedFiles = [];
    
    // Save each split file
    for (let i = 0; i < splitData.length; i++) {
      const newWorkbook = xlsx.utils.book_new();
      const newWorksheet = xlsx.utils.json_to_sheet(splitData[i]);
      xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'Data');
      
      const outputFileName = `${originalName}_part${i + 1}_${timestamp}.xlsx`;
      const outputPath = path.join(outputDir, outputFileName);
      
      xlsx.writeFile(newWorkbook, outputPath);
      savedFiles.push({
        fileName: outputFileName,
        path: outputPath,
        rows: splitData[i].length
      });
    }
    
    return {
      success: true,
      message: `File split successfully into ${splitData.length} files`,
      outputDir: outputDir,
      savedFiles: savedFiles,
      totalRowsProcessed: data.length,
      actualFilesCreated: splitData.length
    };
    
  } catch (error) {
    console.error('Processing error:', error);
    return {
      success: false,
      message: `Error processing file: ${error.message}`
    };
  }
});

// Excel splitting function with proper PT grouping
function splitExcelData(data, numberOfFiles, enforceMaxRows = true) {
  console.log(`Splitting ${data.length} rows with PT-first grouping... (Max rows enforcement: ${enforceMaxRows ? 'ON' : 'OFF'})`);
  
  if (numberOfFiles === 1) {
    if (enforceMaxRows && data.length > 8000) {
      throw new Error(`Single file would have ${data.length} rows, which is too large for optimal processing. Consider using auto-optimization.`);
    }
    return [data];
  }

  // Find PT column
  const firstRow = data[0];
  const ptVariants = ['PT', 'pt', 'PTD', 'ptd', 'P.T.', 'P.T.D.', 'PT Kodu', 'pt_kodu', 'PT_KODU', 'Poli Türü', 'poli_turu', 'POLI_TURU'];
  let ptColumn = null;
  
  for (const variant of ptVariants) {
    if (firstRow.hasOwnProperty(variant)) {
      ptColumn = variant;
      break;
    }
  }

  if (!ptColumn) {
    console.log('⚠️ PT column not found, using traditional splitting method');
    return traditionalSplit(data, numberOfFiles, enforceMaxRows);
  }

  console.log(`📊 Grouping by PT column: "${ptColumn}"`);
  
  // Group data by PT values
  const ptGroups = new Map();
  data.forEach(row => {
    const ptValue = row[ptColumn] || 'EMPTY_PT';
    if (!ptGroups.has(ptValue)) {
      ptGroups.set(ptValue, []);
    }
    ptGroups.get(ptValue).push(row);
  });

  console.log(`Found ${ptGroups.size} different PT groups:`);
  ptGroups.forEach((rows, ptValue) => {
    console.log(`  PT "${ptValue}": ${rows.length} rows`);
  });

  // Now distribute PT groups into files
  const splitData = [];
  const maxRowsPerFile = enforceMaxRows ? 7000 : Math.ceil(data.length / numberOfFiles);
  
  let currentFile = [];
  let currentFileRows = 0;
  
  for (const [ptValue, ptRows] of ptGroups) {
    // For "split freely" mode, we still want to keep PT groups together but distribute them more evenly
    const shouldStartNewFile = enforceMaxRows 
      ? (currentFile.length > 0 && (currentFileRows + ptRows.length > maxRowsPerFile))
      : (currentFile.length > 0 && splitData.length < numberOfFiles - 1 && currentFileRows + ptRows.length > maxRowsPerFile);
    
    // Check if this PT group fits in current file or if we should start a new one
    if (shouldStartNewFile) {
      // Current file would be too large or we're distributing for split freely mode, start a new file
      splitData.push([...currentFile]);
      console.log(`📁 File ${splitData.length}: ${currentFile.length} rows (completed due to PT group size)`);
      currentFile = [];
      currentFileRows = 0;
    }

    // Check if PT group itself is too large for a single file (applies to both modes)
    const splitThreshold = enforceMaxRows ? 8000 : Math.ceil(data.length / numberOfFiles) * 2; // More flexible for split freely
    if (ptRows.length > splitThreshold) {
      // Split this large PT group across multiple files
      console.log(`⚠️ PT group "${ptValue}" is very large (${ptRows.length} rows), splitting across multiple files`);
      
      // First, add any pending rows to current file if there's space
      if (currentFile.length > 0) {
        splitData.push([...currentFile]);
        console.log(`📁 File ${splitData.length}: ${currentFile.length} rows (before large PT group)`);
        currentFile = [];
        currentFileRows = 0;
      }

      // Split the large PT group with Model Kodu respect for both modes
      const ptSplits = splitLargePTGroup(ptRows, maxRowsPerFile, enforceMaxRows);
      ptSplits.forEach((split, index) => {
        splitData.push(split);
        console.log(`📁 File ${splitData.length}: ${split.length} rows (PT "${ptValue}" part ${index + 1})`);
      });
    } else {
      // PT group fits, add it to current file
      currentFile.push(...ptRows);
      currentFileRows += ptRows.length;
      console.log(`➕ Added PT "${ptValue}" (${ptRows.length} rows) to current file. Total: ${currentFileRows} rows`);
    }
  }

  // Add the last file if it has content
  if (currentFile.length > 0) {
    splitData.push(currentFile);
    console.log(`📁 File ${splitData.length}: ${currentFile.length} rows (final file)`);
  }

  console.log(`✅ PT-based splitting completed: ${splitData.length} files created`);
  
  // Log file sizes
  splitData.forEach((fileData, index) => {
    const ptCounts = new Map();
    fileData.forEach(row => {
      const ptValue = row[ptColumn] || 'EMPTY_PT';
      ptCounts.set(ptValue, (ptCounts.get(ptValue) || 0) + 1);
    });
    const ptSummary = Array.from(ptCounts.entries()).map(([pt, count]) => `${pt}(${count})`).join(', ');
    console.log(`File ${index + 1}: ${fileData.length} rows - PT groups: ${ptSummary}`);
  });
  
  return splitData;
}

// Helper function to split large PT groups while respecting Model Kodu boundaries
function splitLargePTGroup(ptRows, maxRowsPerFile, enforceMaxRows = true) {
  const splits = [];
  let currentSplit = [];
  
  // Find Model Kodu column
  const firstRow = ptRows[0];
  const modelKoduVariants = ['Model Kodu', 'ModelKodu', 'model_kodu', 'Varyasyon', 'varyasyon', 'VARYASYON', 'MODEL_KODU'];
  let modelKoduColumn = null;
  
  for (const variant of modelKoduVariants) {
    if (firstRow.hasOwnProperty(variant)) {
      modelKoduColumn = variant;
      break;
    }
  }

  if (!modelKoduColumn) {
    console.log('⚠️ Model Kodu column not found in PT group, using simple splitting');
    // Fallback to simple splitting
    for (const row of ptRows) {
      currentSplit.push(row);
      if (currentSplit.length >= maxRowsPerFile) {
        splits.push([...currentSplit]);
        currentSplit = [];
      }
    }
    if (currentSplit.length > 0) {
      splits.push(currentSplit);
    }
    return splits;
  }

  const modeText = enforceMaxRows ? '7000-row limit' : 'split freely';
  console.log(`📊 Splitting large PT group with Model Kodu column: "${modelKoduColumn}" (${modeText} mode)`);
  
  for (let i = 0; i < ptRows.length; i++) {
    const row = ptRows[i];
    currentSplit.push(row);
    
    // Check if we've reached the target size
    if (currentSplit.length >= maxRowsPerFile) {
      // Look ahead to see if we're in the middle of a Model Kodu group
      const currentModelKodu = row[modelKoduColumn];
      
      // Look at the next few rows to see if they have the same Model Kodu
      for (let j = i + 1; j < ptRows.length && j < i + 500; j++) { // Look ahead max 500 rows
        const nextRow = ptRows[j];
        const nextModelKodu = nextRow[modelKoduColumn];
        
        if (nextModelKodu !== currentModelKodu) {
          // Model Kodu changes, we can split here
          break;
        } else {
          // Same Model Kodu continues, add it to current split
          i++; // Move the main loop forward
          currentSplit.push(nextRow);
          
          // Safety check - don't let files get too large
          // More flexible limits for "split freely" mode
          const safetyLimit = enforceMaxRows ? (maxRowsPerFile + 1000) : (maxRowsPerFile * 1.5);
          if (currentSplit.length >= safetyLimit) {
            const limitType = enforceMaxRows ? 'row limit' : 'reasonable size';
            console.log(`⚠️ Model Kodu group is very large (${currentSplit.length} rows), forcing split to maintain ${limitType}`);
            break;
          }
        }
      }
      
      // Now we can split
      const modelKoduCount = currentSplit.filter(r => r[modelKoduColumn] === currentModelKodu).length;
      const modeInfo = enforceMaxRows ? ` (7000-row mode)` : ` (split freely mode)`;
      console.log(`📁 Completing file with ${currentSplit.length} rows (kept ${modelKoduCount} rows of Model Kodu "${currentModelKodu}" together)${modeInfo}`);
      splits.push([...currentSplit]);
      currentSplit = [];
    }
  }
  
  if (currentSplit.length > 0) {
    splits.push(currentSplit);
  }
  
  return splits;
}

// Traditional splitting method (fallback when no PT column)
function traditionalSplit(data, numberOfFiles, enforceMaxRows) {
  const targetRowsPerFile = Math.floor(data.length / numberOfFiles);
  const splitData = [];
  let currentIndex = 0;
  
  for (let fileIndex = 0; fileIndex < numberOfFiles; fileIndex++) {
    const isLastFile = fileIndex === numberOfFiles - 1;
    let endIndex;
    
    if (isLastFile) {
      endIndex = data.length;
    } else {
      endIndex = currentIndex + targetRowsPerFile;
      endIndex = findOptimalSplitPoint(data, currentIndex, endIndex, enforceMaxRows);
    }
    
    const fileData = data.slice(currentIndex, endIndex);
    
    if (enforceMaxRows && fileData.length > 7000) {
      console.log(`📊 File ${fileIndex + 1} will have ${fileData.length} rows (${fileData.length - 7000} over 7000 to preserve groups)`);
    }
    
    splitData.push(fileData);
    console.log(`File ${fileIndex + 1}: rows ${currentIndex + 1} to ${endIndex} (${fileData.length} rows)`);
    currentIndex = endIndex;
  }
  
  return splitData;
}

// Find optimal split point based on PT (primary) and Model Kodu (secondary) columns
function findOptimalSplitPoint(data, startIndex, targetEndIndex, enforceMaxRows = true) {
  // If target end is beyond data length, return data length
  if (targetEndIndex >= data.length) {
    return data.length;
  }
  
  // Calculate maximum allowed end index (7000 rows from start) only if enforcing max rows
  let maxAllowedEndIndex = data.length; // Default: no limit
  if (enforceMaxRows) {
    maxAllowedEndIndex = startIndex + 7000;
    
    // If target already exceeds 7000 rows, force split at 7000
    if (targetEndIndex > maxAllowedEndIndex) {
      console.log(`Target end index ${targetEndIndex} would exceed 7000 row limit, forcing split at ${maxAllowedEndIndex}`);
      return maxAllowedEndIndex;
    }
  }
   // Check if Model Kodu and PT columns exist (try different possible column names)
  const firstRow = data[0];
  const columnNames = Object.keys(firstRow);
  
  // Find Model Kodu column (try various names)
  let modelKoduColumn = null;
  const modelKoduVariants = ['Model Kodu', 'ModelKodu', 'model_kodu', 'Varyasyon', 'varyasyon', 'VARYASYON', 'MODEL_KODU'];
  for (const variant of modelKoduVariants) {
    if (firstRow.hasOwnProperty(variant)) {
      modelKoduColumn = variant;
      break;
    }
  }
  
  // Find PT column (try various names)
  let ptColumn = null;
  const ptVariants = ['PT', 'pt', 'PTD', 'ptd', 'P.T.', 'P.T.D.', 'PT Kodu', 'pt_kodu', 'PT_KODU', 'Poli Türü', 'poli_turu', 'POLI_TURU'];
  for (const variant of ptVariants) {
    if (firstRow.hasOwnProperty(variant)) {
      ptColumn = variant;
      break;
    }
  }
  
  if (!modelKoduColumn && !ptColumn) {
    console.log('⚠️ Model Kodu and PT columns not found with any known variant names');
    console.log('Available columns:', columnNames.join(', '));
    return targetEndIndex;
  }
  
  if (!modelKoduColumn) {
    console.log('⚠️ Model Kodu column not found, but PT column found');
    console.log('Available columns:', columnNames.join(', '));
  }
  
  if (!ptColumn) {
    console.log('⚠️ PT column not found, but Model Kodu column found');
    console.log('Available columns:', columnNames.join(', '));
  }

  // Get the Model Kodu and PT values at target split point
  const targetRow = data[targetEndIndex - 1]; // -1 because targetEndIndex is exclusive
  const targetModelKodu = modelKoduColumn ? targetRow[modelKoduColumn] : null;
  const targetPT = ptColumn ? targetRow[ptColumn] : null;
  
  console.log(`Looking for optimal split point around row ${targetEndIndex}`);
  console.log(`Using PT column: "${ptColumn || 'NOT FOUND'}" (PRIMARY)`);
  console.log(`Using Model Kodu column: "${modelKoduColumn || 'NOT FOUND'}" (SECONDARY)`);
  console.log(`Target row has PT: "${targetPT}", Model Kodu: "${targetModelKodu}"`);
  
  // Look forward to find where PT or Model Kodu changes
  let optimalEndIndex = targetEndIndex;
  
    // Strategy: Keep PT groups together, but allow splitting if PT group is too large
    // First, check if the current PT group is too large for 7000 row limit
    let ptGroupSize = 0;
    if (ptColumn && enforceMaxRows) {
      // Count how many rows have the same PT value from current position
      for (let j = startIndex; j < data.length; j++) {
        const checkRow = data[j];
        const checkPT = ptColumn ? checkRow[ptColumn] : null;
        if (checkPT === targetPT) {
          ptGroupSize++;
        } else {
          break;
        }
      }
      console.log(`PT group "${targetPT}" has ${ptGroupSize} rows total`);
    }
    
    const absoluteMaxRows = enforceMaxRows ? (startIndex + 7500) : data.length; // Allow up to 500 extra rows for grouping
  
  for (let i = targetEndIndex; i < data.length; i++) {
    const currentRow = data[i];
    const currentModelKodu = modelKoduColumn ? currentRow[modelKoduColumn] : null;
    const currentPT = ptColumn ? currentRow[ptColumn] : null;
    
    const ptChanged = ptColumn && (currentPT !== targetPT);
    const modelKoduChanged = modelKoduColumn && (currentModelKodu !== targetModelKodu);
    
    if (ptChanged) {
      // PT change - check if we should split here or allow PT group to continue
      const actualRows = i - startIndex;
      
      if (!enforceMaxRows || actualRows <= 7500 || ptGroupSize <= 7500) {
        // Safe to keep PT group together
        optimalEndIndex = i;
        if (actualRows > 7000) {
          console.log(`📊 Found PT group boundary at row ${i} with ${actualRows} rows (exceeding 7000 to keep PT "${targetPT}" together)`);
        } else {
          console.log(`Found PT group boundary at row ${i} (PT: "${targetPT}" → "${currentPT}")`);
        }
        break;
      } else {
        // PT group is too large, we already found a reasonable split point
        console.log(`⚠️ PT group "${targetPT}" is very large (${ptGroupSize} rows), allowing split within PT group for 7000 row limit`);
        break;
      }
    } else if (modelKoduChanged) {
      // Model Kodu change within same PT - consider this as split point
      const actualRows = i - startIndex;
      if (actualRows <= 7200 || !enforceMaxRows) {
        optimalEndIndex = i;
        if (actualRows > 7000) {
          console.log(`📊 Found Model Kodu boundary at row ${i} with ${actualRows} rows (within PT "${targetPT}")`);
        } else {
          console.log(`Found Model Kodu boundary at row ${i} within PT "${targetPT}"`);
        }
        break;
      }
    }
    
    // Hard safety limit - only stop if we're really going too far
    if (i >= absoluteMaxRows) {
      optimalEndIndex = i;
      console.log(`⚠️ Reached absolute maximum limit at row ${i} (${i - startIndex} rows) - forcing split here`);
      break;
    }
    
    // Don't go too far beyond target if no row limit is enforced
    if (!enforceMaxRows && i >= targetEndIndex + 1000) {
      optimalEndIndex = i;
      console.log(`Reached maximum look-ahead distance at row ${i} (no row limit mode)`);
      break;
    }
  }
  
  // If we reached the end of data while looking
  if (optimalEndIndex === targetEndIndex && targetEndIndex < data.length) {
    // Check if all remaining rows have the same PT (prioritize PT grouping)
    let allSamePT = true;
    let allSameModelKodu = true;
    const absoluteMaxRows = enforceMaxRows ? (startIndex + 7500) : data.length;
    const checkLimit = Math.min(data.length, absoluteMaxRows);
    
    for (let i = targetEndIndex; i < checkLimit; i++) {
      const currentRow = data[i];
      const currentModelKodu = modelKoduColumn ? currentRow[modelKoduColumn] : null;
      const currentPT = ptColumn ? currentRow[ptColumn] : null;
      
      const ptChanged = ptColumn && (currentPT !== targetPT);
      const modelKoduChanged = modelKoduColumn && (currentModelKodu !== targetModelKodu);
      
      if (ptChanged) {
        allSamePT = false;
        break;
      }
      if (modelKoduChanged) {
        allSameModelKodu = false;
      }
    }
    
    if (allSamePT) {
      const actualRows = checkLimit - startIndex;
      // Check if keeping this PT group together would create a file that's too large
      if (enforceMaxRows && actualRows > 8000) {
        // PT group is very large, allow splitting within the PT group
        console.log(`⚠️ PT group "${targetPT}" is very large (${actualRows} rows), will need to split within PT group for 7000 row limit`);
        optimalEndIndex = Math.min(targetEndIndex + 7000, checkLimit);
      } else if (actualRows > 7000 && enforceMaxRows) {
        console.log(`📊 All remaining rows have same PT "${targetPT}" - including ${actualRows} total rows (exceeding 7000 for PT grouping)`);
        optimalEndIndex = checkLimit;
      } else {
        const limitText = enforceMaxRows ? ' (within reasonable limit)' : '';
        console.log(`All remaining rows${limitText} have same PT "${targetPT}", including them in current file`);
        optimalEndIndex = checkLimit;
      }
    } else if (allSameModelKodu && modelKoduColumn) {
      // If PT changes but Model Kodu stays the same, we already found the optimal split point above
      console.log(`PT changes in remaining rows, but Model Kodu "${targetModelKodu}" stays the same - using previously found split point`);
    }
  }
  
  // Final safety check: ensure we don't exceed reasonable limit if enforcing max rows
  if (optimalEndIndex > absoluteMaxRows) {
    optimalEndIndex = absoluteMaxRows;
    console.log(`⚠️ Capping split at absolute maximum: ${absoluteMaxRows} (allowing up to 500 extra rows for grouping)`);
  }
  
  const actualRows = optimalEndIndex - startIndex;
  if (actualRows > 7000 && enforceMaxRows) {
    console.log(`📊 Split will have ${actualRows} rows (${actualRows - 7000} over 7000 limit to preserve groups)`);
  }
  
  console.log(`Optimal split point: ${optimalEndIndex} (adjusted from ${targetEndIndex})`);
  return optimalEndIndex;
}

// Handle app updates and security
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    // Prevent new window creation
    event.preventDefault();
  });

  contents.on('will-navigate', (event, navigationUrl) => {
    // Prevent navigation to external URLs
    event.preventDefault();
  });
});
