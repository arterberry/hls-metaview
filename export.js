// export.js - export hls data and screen capture

const exportModule = {

    captureScreen: function() {
        console.log("Starting screen capture...");
        
        // video container 
        const videoContainer = document.querySelector('.video-container');
        if (!videoContainer) {
            console.error("Video container not found");
            return Promise.reject("Video container not found");
        }
        
        return html2canvas(videoContainer, {
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#000000"
        }).then(canvas => {
            console.log("Screen capture successful");
            return canvas.toDataURL('image/png'); // PNG format
        }).catch(error => {
            console.error("Screen capture failed:", error);
            return Promise.reject(error);
        });
    },

    // export both data and screen capture
    exportWithScreenCapture: function () {
        console.log("Starting export with screen capture...");

        this.captureScreen().then(screenshotData => {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            
            const screenshotFilename = `metaview_screenshot_${timestamp}.png`;
            this.saveScreenshot(screenshotData, screenshotFilename);

            setTimeout(() => {
                const jsonData = JSON.stringify(data, null, 2);
                this.downloadJSON(jsonData, `hls-metaview-export-${timestamp}.json`);
            }, 1000); // 1000ms delay

            const data = this.collectExportData();

            data.screenshot = {
                filename: screenshotFilename,
                captureTime: timestamp,
                imageData: screenshotData // the base64 data (image)
            };
            console.log("Screenshot added to export data and saved as file:", screenshotFilename);

            const jsonData = JSON.stringify(data, null, 2);

            this.downloadJSON(jsonData, `hls-metaview-export-${timestamp}.json`);
        }).catch(error => {
            console.error("Screen capture failed, exporting without screenshot:", error);
            this.exportToJSON();
        });
    },

    // export session data to JSON file
    exportToJSON: function () {
        console.log("Starting export to JSON...");
    
        console.log("metadataBuffer available:", !!window.metadataBuffer);
        if (window.metadataBuffer) {
            console.log("Current metadata entries:", window.metadataBuffer.entries.length);
        }
    
        this.captureScreen().then(screenshotData => {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            
            const screenshotFilename = `metaview_screenshot_${timestamp}.png`;
            this.saveScreenshot(screenshotData, screenshotFilename);
            
            const data = this.collectExportData();
            
            data.screenshot = {
                filename: screenshotFilename,
                captureTime: timestamp,
                imageData: screenshotData //  base64 data (image)
            };
            
            const jsonData = JSON.stringify(data, null, 2);
            this.downloadJSON(jsonData, `hls-metaview-export-${timestamp}.json`);
            
        }).catch(error => {
            console.error("Screen capture failed, exporting without screenshot:", error);
            
            const data = this.collectExportData();
            
            const jsonData = JSON.stringify(data, null, 2);
            
            this.downloadJSON(jsonData, `hls-metaview-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`);
        });
    
        return true;
    },

    // function to save screenshot data
    saveScreenshot: function (screenshotData, filename) {
        const link = document.createElement('a');
        link.href = screenshotData;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log(`Screenshot saved as ${filename}`);
    },    
    
    // collectExportData function to gather data for export
    collectExportData: function () {
        const exportData = {
            timestamp: new Date().toISOString(),
            url: document.getElementById("hlsUrl")?.value || "unknown",
            metadata: [],
            cacheMetrics: {},
            cacheTTL: window.latestTTLInfo || { hasDirectives: false },
            resolutions: this.captureResolutions(),
            streamInfo: this.captureStreamInfo()
        };

        // metadata from buffer 
        if (window.metadataBuffer && Array.isArray(window.metadataBuffer.entries)) {
            exportData.metadata = [...window.metadataBuffer.entries];
            console.log("Collected metadata entries:", exportData.metadata.length);
        } else {
            console.warn("Metadata buffer not found or invalid in window object");
        }

        // cache metrics if available
        if (window.cacheData) {
            exportData.cacheMetrics = {
                hits: window.cacheData.hits || 0,
                misses: window.cacheData.misses || 0,
                total: window.cacheData.total || 0,
                hitRatio: window.cacheData.total > 0 ?
                    ((window.cacheData.hits / window.cacheData.total) * 100).toFixed(2) : 0,
                history: [...(window.cacheData.history || [])] // << copy
            };
        }

        return exportData;
    },
    
    // resolutions information
    captureResolutions: function() {
        const resolutions = [];
        const resolutionItems = document.querySelectorAll('.resolution-item');
        
        resolutionItems.forEach(item => {
            const text = item.textContent;
            const match = text.match(/Resolution: (\d+x\d+), Bandwidth: (\d+) kbps/);
            
            if (match) {
                resolutions.push({
                    resolution: match[1],
                    bandwidth: parseInt(match[2], 10),
                    text: text
                });
            } else {
                resolutions.push({ text: text });
            }
        });
        
        return resolutions;
    },
    
    // additional stream information
    captureStreamInfo: function() {
        return {
            videoElement: {
                currentTime: document.getElementById("videoPlayer")?.currentTime || 0,
                duration: document.getElementById("videoPlayer")?.duration || 0,
                readyState: document.getElementById("videoPlayer")?.readyState || 0
            },
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    },
    
    // download for JSON data
    downloadJSON: function(jsonData, filename) {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// export button when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    const exportArea = document.querySelector('.export-area');
    if (exportArea) {
        // In export.js - Update the export button styling
        const exportButton = document.createElement('button');
        exportButton.id = 'exportDataButton';
        exportButton.textContent = 'Export Data + Screen Capture';
        exportButton.style.padding = '8px 12px';
        exportButton.style.background = '#4CAF50'; // green color (keep it pretty)
        exportButton.style.color = 'white';
        exportButton.style.border = 'none';
        exportButton.style.borderRadius = '4px';
        exportButton.style.cursor = 'pointer';
        exportButton.style.marginLeft = '5px';
        
        exportButton.addEventListener('click', function() {
            const originalText = exportButton.textContent;
            exportButton.textContent = 'Capturing...';
            exportButton.disabled = true;
            exportModule.exportWithScreenCapture();
            
            // reset button after delay
            setTimeout(() => {
                exportButton.textContent = originalText;
                exportButton.disabled = false;
            }, 2000);
        });
        
        exportArea.appendChild(exportButton);
    }
});

// export module to global scope
window.exportModule = exportModule;