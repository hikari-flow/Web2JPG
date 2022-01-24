"use strict";

const { app, BrowserWindow } = require('electron');
const path = require('path');

function openWindow() {
    const win = new BrowserWindow({
        width: 480,
        height: 680,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile(path.resolve(__dirname, 'index.html'));

    return win;
}

// when app is ready, open a window
app.on('ready', () => {
    const win = openWindow();
});

// when all windows are closed, quit the app
app.on('window-all-closed', () => {
    app.quit();
});
