"use strict";

const fs = require("fs");
const path = require("path");
const ui = require("./ui");

// global vars
const configPath = path.join(path.resolve("."), "config.json");

exports.initConfig = function () {
    const defaults = {
        chromeExe: path.normalize("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe")
    };

    try {
        fs.writeFileSync("config.json", JSON.stringify(defaults, null, "\t"));
    } catch (err) {
        ui.overlay(`Error in writing config.json file. Please quit the application:\n\n` + err);
    }
}

exports.get = function (item) {
    return JSON.parse(fs.readFileSync(configPath, { encoding: "utf8", flag: "r" }))[item];
}
