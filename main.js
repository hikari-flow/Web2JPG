"use strict";

const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");
const config = require("./js/config");

function openWindow() {
    const win = new BrowserWindow({
        width: 810,
        height: 475,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile(path.resolve(__dirname, "index.html"));
    win.webContents.openDevTools({ mode: "detach" });

    return win;
}

// when app is ready, open new window and check for config file
app.on("ready", function () {
    const configPath = path.join(path.resolve("."), "config.json");
    const win = openWindow();

    if (!fs.existsSync(configPath)) {
        config.initConfig();
    }
});

// when all windows are closed, quit the app
app.on("window-all-closed", function () {
    app.quit();
});
