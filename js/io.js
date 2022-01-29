"use strict";

const fs = require('fs');
const path = require('path');

const overlay = require('./overlay.js');
const screenshot = require('./screenshot.js');

const runButton = document.querySelector("#run");
const optButton = document.querySelector("#opt");

// RUN
runButton.addEventListener("click", function (event) {
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

    const pageWidth = parseInt(document.getElementById('pageWidth').value);
    const pageHeight = parseInt(document.getElementById('pageHeight').value);
    const fontSize = document.getElementById("fontSize").value ? parseFloat(document.getElementById("fontSize").value) : 0;
    const color = document.getElementsByClassName("color-switch")[0].checked ? 1 : 0;
    const deviceScale = parseFloat(document.getElementById('deviceScale').value);

    // Create IMAGES folder
    const imagesPath = path.join(outputPath, 'IMAGES');

    try {
        fs.mkdirSync(imagesPath, true);
    } catch (err) {
        overlay.display(err);
        return;
    }

    generateBlankOpt(outputPath);

    // Screenshot
    screenshot.convertToJpg(sourcePath, outputPath, imagesPath, pageWidth, pageHeight, fontSize, color, deviceScale);
});

// Generate OPT
optButton.addEventListener("click", function (event) {
    event.preventDefault();

    const sourcePath = document.getElementById('sourcePath').value;

    if (!fs.existsSync(sourcePath)) {
        overlay.display('Source path does not exist.');
        return;
    }

    const fileList = fs.readdirSync(sourcePath);

    if (fileList.length == 0) {
        overlay.display('Source path is empty.');
        return;
    }

    const outputPath = document.getElementById('outputPath').value;

    if (!fs.existsSync(outputPath)) {
        overlay.display('Output path does not exist.');
        return;
    }

    // Generation of OPT
    overlay.display('Generating OPT.');

    generateBlankOpt(outputPath);

    let imgCtr = 1;

    for (const file of fileList) {
        const fileName = path.basename(file, path.extname(file));
        const suffix = '_' + String(imgCtr).padStart(6, '0');

        try {
            if (fileName.substring(fileName.length - 7, fileName.length) === '_000001') {
                imgCtr = 1;
                fs.appendFileSync(path.join(outputPath, 'Images.opt'), fileName.substring(0, fileName.length - 7) + ',,' + path.join(sourcePath, file) + ',Y,,,\n');
            } else {
                fs.appendFileSync(path.join(outputPath, 'Images.opt'), fileName.substring(0, fileName.length - 7) + suffix + ',,' + path.join(sourcePath, file) + ',,,,\n');
            }
        } catch (err) {
            overlay.display(err);
            return;
        }

        imgCtr++;
    }

    overlay.clear();
    overlay.display('OPT complete.');
});

function generateBlankOpt(outputPath) {
    try {
        fs.writeFileSync(path.join(outputPath, 'Images.opt'), '', { encoding: 'utf8', flag: 'w' });
    } catch (err) {
        overlay.display(err);
        return;
    }
}
