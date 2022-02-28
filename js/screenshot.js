"use strict";

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const ui = require("./ui");
const config = require("./config");

exports.convertToJpg = async function (cutOffs, deviceScale, fileList, input, progressTrckr) {

    // Launch headless browser with desired user settings
    const browser = await puppeteer.launch({
        executablePath: config.get("chromeExe"),
        headless: true,
        defaultViewport: {
            width: input.pageWidth,
            height: input.pageHeight,
            deviceScaleFactor: deviceScale
        }
    });

    // Go through fileList and screenshot, while taking note of cutOffs
    for (const file of fileList) {
        const page = await browser.newPage();
        await page.goto(path.join("file://", input.sourcePath, file));
        await page.evaluate(formatContent, input.fontSize, input.color);

        let largestTable = false;

        // If there are tables, detect for cutoffs
        if (cutOffs && await page.evaluate(() => document.getElementsByTagName("table").length)) {
            largestTable = await page.evaluate(getLargestTable);
        }

        // If there's a cutoff table, add to cutOffs list and do later
        if (largestTable) {
            cutOffs[file] = { width: largestTable.width };
        } else {
            ui.outputText.add(`<br>(${progressTrckr.complete + 1}/${progressTrckr.total}) ${file}`);

            const pageAttr = await page.evaluate(getPageAttr);

            let imgCtr = 1;

            // Screenshots
            for (let scrollPosition = 0; scrollPosition < pageAttr.scrollHeight; scrollPosition += pageAttr.winHeight) {
                const suffix = "_" + String(imgCtr).padStart(6, "0");
                const fileName = path.basename(file, path.extname(file));
                const imagePath = path.join(input.imagesPath, fileName + suffix + ".jpg");

                await page.screenshot({
                    path: imagePath,
                    quality: 80,
                    captureBeyondViewport: false
                });

                await page.evaluate(scrollPage);

                // OPT
                try {
                    if (imgCtr == 1) {
                        fs.appendFileSync(path.join(input.outputPath, "Images.opt"), fileName + ",," + imagePath + ",Y,,," + pageAttr.pageCount + "\n");
                    } else {
                        fs.appendFileSync(path.join(input.outputPath, "Images.opt"), fileName + suffix + ",," + imagePath + ",,,,\n");
                    }
                } catch (err) {
                    ui.overlay(err);
                    return;
                }

                imgCtr++;
            }

            progressTrckr.complete++;
            ui.progressBar.update(progressTrckr.complete, progressTrckr.total);
        }

        await page.close();
    }

    await browser.close();

    function formatContent(fontSize, color) {
        // Set max-width of images to viewport width
        const imgs = document.getElementsByTagName("img");
        for (const img of imgs) {
            img.style.maxWidth = "100%";
            img.style.height = "auto";
        }

        // bw
        if (color == 0) {
            document.getElementsByTagName("html")[0].style.filter = "grayscale(100%)";
        }

        // font size
        if (fontSize != 0) {
            const tagNames = ["body", "div", "span"];

            for (html of document.getElementsByTagName("html")) {
                html.style.fontSize = "100%";
                html.style.lineHeight = "1em";
            }

            for (img of document.getElementsByTagName("img")) {
                img.style.minWidth = fontSize * 6.5 + "em";
            }

            for (const tagName of tagNames) {
                const elems = document.getElementsByTagName(tagName);

                for (const elem of elems) {
                    elem.style.fontSize = fontSize + "em";
                    elem.style.lineHeight = "1em";
                }
            }
        }
    }

    function getLargestTable() {
        let width = 0;

        for (const table of document.getElementsByTagName("table")) {
            width = (table.getBoundingClientRect().width > width) ? Math.ceil(table.getBoundingClientRect().width) : width;
        }

        if (width <= window.innerWidth) {
            return false;
        }

        width += 20; // add some whitespace

        return { width: width };
    }

    function getPageAttr() {
        let scrollHeight = Math.ceil(document.documentElement.scrollHeight / window.innerHeight) * window.innerHeight;

        // If more than 1 page, add whitespace to bottom of page so that last page will get a full scroll
        if (scrollHeight > window.innerHeight) {
            document.getElementsByTagName("html")[0].style.height = scrollHeight.toString() + "px";
            document.body.style.height = scrollHeight.toString() + "px";
        }

        return {
            winWidth: window.innerWidth,
            winHeight: window.innerHeight,
            scrollHeight: scrollHeight,
            pageCount: Math.trunc(scrollHeight / window.innerHeight),
        };
    }

    function scrollPage() {
        window.scrollBy(0, window.innerHeight);
    }
}
