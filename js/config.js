'use strict';

const fs = require('fs');
const path = require('path');

const appPath = path.resolve('.');
const configPath = path.join(appPath, 'config.json');
const defaults = {
    chromeExe: path.normalize("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe")
};

exports.newConfig = () => {
    if (!fs.existsSync(configPath)) {
        try {
            fs.writeFileSync('config.json', JSON.stringify(defaults, null, '\t'));
        } catch (err) {
            alert(err);
            return;
        }
    }
}

exports.get = (item) => {
    return JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8', flag: 'r' }))[item];
}
