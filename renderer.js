const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  selectExcelFile: () => ipcRenderer.invoke('select-excel-file'),
  processExcelFile: (filePath, numberOfFiles, enforceMaxRows) => ipcRenderer.invoke('process-excel-file', filePath, numberOfFiles, enforceMaxRows)
});

// Also expose some utility functions
contextBridge.exposeInMainWorld('utils', {
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  getFileName: (filePath) => {
    if (!filePath) return '';
    return filePath.split(/[\\/]/).pop();
  }
});
