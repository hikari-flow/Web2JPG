"use strict";

const fs = require("fs");
const path = require("path");
const ui = require("./ui");
const screenshot = require("./screenshot");

// RUN
document.querySelector("#run").addEventListener("click", async function (event) {
    event.preventDefault(); // stop the form from submitting

    let input = {};

    input.sourcePath = document.getElementById("sourcePath").value;

    if (!fs.existsSync(input.sourcePath)) {
        ui.overlay("Source path does not exist.");
        return;
    }

    if (fs.readdirSync(input.sourcePath).length == 0) {
        ui.overlay("There are no natives in Source Path.");
        return;
    }

    input.outputPath = document.getElementById("outputPath").value;

    if (!fs.existsSync(input.outputPath)) {
        ui.overlay("Output path does not exist.");
        return;
    }

    input.imagesPath = path.join(input.outputPath, "IMAGES");

    // Create IMAGES folder if doesn't exist
    if (!fs.existsSync(input.imagesPath)) {
        try {
            fs.mkdirSync(input.imagesPath, true);
        } catch (err) {
            ui.overlay(err);
            return;
        }
    }

    // Create OPT
    try {
        fs.writeFileSync(path.join(input.outputPath, "Images.opt"), "", { encoding: "utf8", flag: "w" });
    } catch (err) {
        ui.overlay(err);
        return;
    }

    // Initialize UI
    ui.progressBar.init();
    ui.outputText.init();

    // Retrieve the rest of user input
    const fileList = fs.readdirSync(input.sourcePath);
    input.pageWidth = parseInt(document.getElementById("pageWidth").value);
    input.pageHeight = parseInt(document.getElementById("pageHeight").value);
    input.fontSize = document.getElementById("fontSize").value ? parseFloat(document.getElementById("fontSize").value) : 0;
    input.color = document.getElementsByClassName("color-switch")[0].checked ? 1 : 0;

    let cutOffs = {};
    let deviceScale = calcDevScale(input.pageWidth, input.pageHeight);
    let progressTrckr = { complete: 0, total: fileList.length };

    // Screenshot
    await screenshot.convertToJpg(cutOffs, deviceScale, fileList, input, progressTrckr);

    // Cut-offs
    if (Object.keys(cutOffs).length) {
        try {
            fs.writeFileSync(path.join(input.outputPath, "cutOffs.txt"), "", { encoding: "utf8", flag: "w" });
        } catch (err) {
            ui.overlay(err);
            return;
        }

        for (const file in cutOffs) {
            // cutOffs.txt
            try {
                fs.appendFileSync(path.join(input.outputPath, "cutOffs.txt"), file + "\n");
            } catch (err) {
                ui.overlay(err);
                return;
            }

            deviceScale = calcDevScale(cutOffs[file].width, input.pageHeight);
            input.pageWidth = cutOffs[file].width;

            await screenshot.convertToJpg(false, deviceScale, [file], input, progressTrckr);
        }
    }

    // Done
    if (progressTrckr.complete != progressTrckr.total) {
        ui.overlay("ERROR: Unable to finish.\n" + progressTrckr);
        return;
    }

    ui.progressBar.complete();
});

function calcDevScale(w, h) {
    let deviceScale = 1;

    // Set device scale so that longest side will at least be 3300px
    if (w < 3300 && h < 3300) {
        if (w > h) {
            deviceScale = 3300 / w;
        } else {
            deviceScale = 3300 / h;
        }
    }

    return deviceScale;
}
