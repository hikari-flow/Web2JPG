"use strict";

const { app, BrowserWindow } = require('electron');
const path = require('path');

const config = require('./js/config.js');

function openWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 635,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile(path.resolve(__dirname, 'index.html'));
    win.webContents.openDevTools({ mode: 'detach' });

    config.newConfig();

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
