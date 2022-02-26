"use strict";

const fs = require('fs');
const path = require('path');
const overlay = require('./overlay');
const screenshot = require('./screenshot');

// RUN
document.querySelector("#run").addEventListener("click", function (event) {
    event.preventDefault(); // stop the form from submitting

    const sourcePath = document.getElementById('sourcePath').value;

    if (!fs.existsSync(sourcePath)) {
        overlay.display('Source path does not exist.');
        return;
    }

    if (fs.readdirSync(sourcePath).length == 0) {
        overlay.display('Source path is empty.');
        return;
    }

    const outputPath = document.getElementById('outputPath').value;

    if (!fs.existsSync(outputPath)) {
        overlay.display('Output path does not exist.');
        return;
    }

    // Create IMAGES folder
    const imagesPath = path.join(outputPath, 'IMAGES');

    if (!fs.existsSync(imagesPath)) {
        try {
            fs.mkdirSync(imagesPath, true);
        } catch (err) {
            overlay.display(err);
            return;
        }
    }

    // Create OPT
    try {
        fs.writeFileSync(path.join(outputPath, 'Images.opt'), '', { encoding: 'utf8', flag: 'w' });
    } catch (err) {
        overlay.display(err);
        return;
    }

    // Initialize progress bar
    const progressBar = document.getElementById("progress-bar");
    progressBar.classList.remove('progress-bar-complete');
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    document.getElementById("progress").style.width = '100%';

    // Screenshot
    screenshot.convertToJpg(sourcePath, outputPath, imagesPath, progressBar);
});
