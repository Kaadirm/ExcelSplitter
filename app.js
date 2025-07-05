// Desktop Application JavaScript
let selectedFilePath = null;
let isProcessing = false;
let fileRowCount = 0;

// DOM Elements
const selectFileBtn = document.getElementById('selectFileBtn');
const changeFileBtn = document.getElementById('changeFileBtn');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const filePath = document.getElementById('filePath');
const fileSize = document.getElementById('fileSize');
const fileRows = document.getElementById('fileRows');
const numberOfFilesInput = document.getElementById('numberOfFiles');
const enforceLimit = document.getElementById('enforceLimit');
const noLimit = document.getElementById('noLimit');
const limitInfo = document.getElementById('limitInfo');
const processBtn = document.getElementById('processBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const statusMessages = document.getElementById('statusMessages');
const footerStats = document.getElementById('footerStats');
const btnSpinner = document.getElementById('btnSpinner');

// Event Listeners
selectFileBtn.addEventListener('click', selectFile);
changeFileBtn.addEventListener('click', selectFile);
processBtn.addEventListener('click', processFile);
numberOfFilesInput.addEventListener('input', updateProcessButton);
enforceLimit.addEventListener('change', updateLimitInfo);
noLimit.addEventListener('change', updateLimitInfo);

// File Selection
async function selectFile() {
    try {
        const filePath = await window.electronAPI.selectExcelFile();
        if (filePath) {
            selectedFilePath = filePath;
            await displayFileInfo(filePath);
            updateProcessButton();
        }
    } catch (error) {
        showStatus('Error selecting file: ' + error.message, 'error');
    }
}

// Display File Information
async function displayFileInfo(filePath) {
    const fileName_value = window.utils.getFileName(filePath);
    
    fileName.textContent = fileName_value;
    const filePath_element = document.getElementById('filePath');
    filePath_element.textContent = filePath;
    
    // Try to get file stats including row count
    try {
        const stats = await getFileStats(filePath);
        if (stats) {
            fileSize.textContent = `Size: ${window.utils.formatFileSize(stats.size)}`;
            fileRows.textContent = `Estimated rows: ${stats.rows || 'Unknown'}`;
            fileRowCount = stats.rows || 0;
        } else {
            fileSize.textContent = 'Size: Unknown';
            fileRows.textContent = 'Rows: Unknown';
        }
    } catch (error) {
        console.error('Error getting file stats:', error);
        fileSize.textContent = 'Size: Unknown';
        fileRows.textContent = 'Rows: Unknown';
    }
    
    // Show file info and hide select button
    fileInfo.style.display = 'block';
    fileInfo.classList.add('fade-in');
    
    // Update footer
    footerStats.textContent = `File selected: ${fileName_value}`;
    
    showStatus(`✅💖 File selected: ${fileName_value}`, 'success');
}

// Get file statistics (basic implementation)
async function getFileStats(filePath) {
    try {
        // This is a simplified version - in real implementation you might want to
        // read the file to get actual row count, but for now we'll estimate based on file size
        const response = await fetch('file://' + filePath);
        if (response.ok) {
            const size = parseInt(response.headers.get('content-length')) || 0;
            const estimatedRows = Math.floor(size / 100); // Rough estimate
            return { size, rows: estimatedRows };
        }
    } catch (error) {
        console.log('Could not get file stats, continuing anyway');
    }
    return null;
}

// Update Process Button State
function updateProcessButton() {
    const numberOfFiles = parseInt(numberOfFilesInput.value);
    if (selectedFilePath && !isProcessing && numberOfFiles >= 1) {
        processBtn.disabled = false;
        processBtn.classList.remove('processing');
    } else {
        processBtn.disabled = true;
    }
}

// Update Limit Info Display
function updateLimitInfo() {
    if (enforceLimit.checked) {
        limitInfo.innerHTML = '<strong>🎯 Auto-calculates optimal files keeping PT groups together (~7,000 rows each, may split large PT groups if needed).</strong>';
        limitInfo.style.display = 'block';
        // Disable the number input when 7000 limit is checked
        numberOfFilesInput.disabled = true;
        numberOfFilesInput.style.opacity = '0.5';
        numberOfFilesInput.title = 'Disabled - optimal number will be calculated automatically';
    } else {
        limitInfo.innerHTML = '<strong>Files will be split freely without row limits.</strong>';
        limitInfo.style.display = 'block';
        // Enable the number input when no limit is checked
        numberOfFilesInput.disabled = false;
        numberOfFilesInput.style.opacity = '1';
        numberOfFilesInput.title = 'Enter the number of files to split into';
    }
}

// Process File
async function processFile() {
    if (!selectedFilePath || isProcessing) return;
    
    const numberOfFiles = parseInt(numberOfFilesInput.value);
    if (!numberOfFiles || numberOfFiles < 1) {
        showStatus('❌ Please enter a valid number of files (minimum 1)', 'error');
        return;
    }
    
    isProcessing = true;
    updateProcessButton();
    
    // Update UI for processing state
    processBtn.classList.add('processing');
    processBtn.querySelector('.btn-text').textContent = 'Splitting...';
    
    // Show progress
    progressContainer.style.display = 'block';
    progressContainer.classList.add('slide-up');
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressFill.style.width = progress + '%';
        
        const enforceMaxRows = enforceLimit.checked;
        const progressMessage = enforceMaxRows 
            ? `Auto-calculating optimal files... ${Math.round(progress)}%`
            : `Splitting into ${numberOfFiles} files... ${Math.round(progress)}%`;
        progressText.textContent = progressMessage;
    }, 200);
    
    try {
        const enforceMaxRows = enforceLimit.checked;
        const statusMessage = enforceMaxRows 
            ? '🔄 Sorting data by Model Kodu (A-Z) and auto-calculating optimal files for 7,000 row limit...'
            : `🔄 Sorting data by Model Kodu (A-Z) and splitting into ${numberOfFiles} files without row limits...`;
        showStatus(statusMessage, 'info');
        
        const result = await window.electronAPI.processExcelFile(selectedFilePath, numberOfFiles, enforceMaxRows);
        
        // Complete progress
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        progressText.textContent = 'Splitting complete!';
        
        if (result.success) {
            const filesList = result.savedFiles.map(file => 
                `• ${file.fileName} (${file.rows} rows)`
            ).join('\n');
            
            const actualFiles = result.actualFilesCreated || numberOfFiles;
            const optimalMessage = actualFiles > numberOfFiles ? 
                `\n🎯 Auto-optimized to ${actualFiles} files for 7000 row limit` : '';
            
            showStatus(
                `✅🎉 ${result.message}${optimalMessage}\n📁💝 Saved to: ${result.outputDir}\n📊✨ Total rows processed: ${result.totalRowsProcessed}\n\nFiles created:\n${filesList}`, 
                'success'
            );
            
            // Update footer stats
            footerStats.textContent = `Last split: ${result.totalRowsProcessed} rows into ${actualFiles} files • Saved to: ${window.utils.getFileName(result.outputDir)}`;
            
            // Reset for next file
            setTimeout(() => {
                resetUI();
            }, 5000);
            
        } else {
            showStatus(`❌ ${result.message}`, 'error');
        }
        
    } catch (error) {
        clearInterval(progressInterval);
        showStatus(`❌ Error splitting file: ${error.message}`, 'error');
    }
    
    // Hide progress after delay
    setTimeout(() => {
        progressContainer.style.display = 'none';
        progressFill.style.width = '0%';
    }, 2000);
    
    isProcessing = false;
    processBtn.classList.remove('processing');
    processBtn.querySelector('.btn-text').textContent = 'Split Excel File';
    updateProcessButton();
}

// Show Status Message
function showStatus(message, type) {
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message status-${type} fade-in`;
    
    // Handle multi-line messages
    const lines = message.split('\n');
    if (lines.length > 1) {
        lines.forEach((line, index) => {
            const lineDiv = document.createElement('div');
            lineDiv.textContent = line;
            if (index > 0) lineDiv.style.marginTop = '0.25rem';
            statusDiv.appendChild(lineDiv);
        });
    } else {
        statusDiv.textContent = message;
    }
    
    // Clear previous messages
    statusMessages.innerHTML = '';
    statusMessages.appendChild(statusDiv);
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.style.opacity = '0';
                setTimeout(() => {
                    if (statusDiv.parentNode) {
                        statusDiv.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Reset UI
function resetUI() {
    selectedFilePath = null;
    fileRowCount = 0;
    fileInfo.style.display = 'none';
    statusMessages.innerHTML = '';
    footerStats.textContent = 'Ready to split Excel files';
    numberOfFilesInput.value = 2;
    updateProcessButton();
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    showStatus('👋💕 Welcome to Excel Splitter! Select an Excel file to get started. ✨', 'info');
    updateProcessButton();
    updateLimitInfo(); // Set initial state for input field
    
    // Add some initial animation
    document.querySelector('.app-container').classList.add('fade-in');
});

// Handle drag and drop (bonus feature)
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', async (e) => {
    e.preventDefault();
    
    if (isProcessing) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        const filePath = file.path;
        
        // Validate file type
        if (filePath.toLowerCase().endsWith('.xlsx') || filePath.toLowerCase().endsWith('.xls')) {
            selectedFilePath = filePath;
            await displayFileInfo(filePath);
            updateProcessButton();
        } else {
            showStatus('❌ Please drop an Excel file (.xlsx or .xls)', 'error');
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
            case 'o':
                e.preventDefault();
                if (!isProcessing) selectFile();
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedFilePath && !isProcessing && parseInt(numberOfFilesInput.value) >= 1) processFile();
                break;
        }
    }
});
