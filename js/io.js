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
    const outputPath = document.getElementById('outputPath').value;

    if (!fs.existsSync(sourcePath)) {
        overlay.display('Source path does not exist.');
        return;
    }

    if (fs.readdirSync(sourcePath).length == 0) {
        overlay.display('Source path is empty.');
        return;
    }

    if (!fs.existsSync(outputPath)) {
        overlay.display('Output path does not exist.');
        return;
    }

    const pageWidth = parseInt(document.getElementById('pageWidth').value);
    const pageHeight = parseInt(document.getElementById('pageHeight').value);
    const color = document.getElementsByClassName("color-switch")[0].checked ? 1 : 0;
    const deviceScale = parseFloat(document.getElementById('deviceScale').value);

    generateBlankOpt(outputPath);

    // Creating IMAGES folder
    fs.mkdir(
        path.join(outputPath, 'IMAGES'),
        { recursive: true }, (err) => {
            if (err) {
                overlay.display(err);
                return console.error(err);
            }

            // Screenshot
            screenshot.convertToJpg(sourcePath, outputPath, pageWidth, pageHeight, color, deviceScale);
        });
});

// Generate OPT
optButton.addEventListener("click", function (event) {
    event.preventDefault();

    const sourcePath = document.getElementById('sourcePath').value;

    if (fs.existsSync(sourcePath)) { }
    if (fileList.length != 0) { }

    if (fs.existsSync(sourcePath)) {

        const fileList = fs.readdirSync(sourcePath);

        if (fileList.length != 0) {

            const outputPath = document.getElementById('outputPath').value;

            if (fs.existsSync(outputPath)) {

                // Generation of OPT
                overlay.display('Generating OPT.');
                generateBlankOpt(outputPath);

                for (const file of fileList) {
                    const fileName = path.basename(file, path.extname(file));

                    try {
                        if (fileName.substring(fileName.length - 7, fileName.length) === '_000001') {
                            fs.appendFileSync(path.join(outputPath, 'Images.opt'), fileName.substring(0, fileName.length - 7) + ',,' + path.join(sourcePath, file) + ',Y,,,\n');
                        } else {
                            fs.appendFileSync(path.join(outputPath, 'Images.opt'), fileName + ',,' + path.join(sourcePath, file) + ',,,,\n');
                        }
                    } catch (err) {
                        overlay.display(err);
                    }
                }

                overlay.clear();
                overlay.display('OPT complete.');


            } else {
                overlay.display('Output path does not exist.');
            }
        } else {
            overlay.display('Source path is empty.');
        }
    } else {
        overlay.display('Source path does not exist.');
    }
});

function generateBlankOpt(outputPath) {
    try {
        fs.writeFileSync(path.join(outputPath, 'Images.opt'), '', { encoding: 'utf8', flag: 'w' });
    } catch (err) {
        overlay.display(err);
    }
}
