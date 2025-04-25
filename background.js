// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("VIDINFRA MetaView Extension Installed");
});

chrome.action.onClicked.addListener((tab) => {
    createNewWindow();
});

function createNewWindow() {
    chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 1405,
        height: 1080,
    });
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'new-instance',
        title: 'Open new VIDINFRA MetaView instance',
        contexts: ['action']
    });
});

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'new-instance') {
        createNewWindow();
    }
});