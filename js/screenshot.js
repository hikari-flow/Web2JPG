"use strict";

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const overlay = require('./overlay');
const config = require('./config');

exports.convertToJpg = async (sourcePath, outputPath, imagesPath, progressBar) => {
    const outputText = document.getElementById("output-text");
    outputText.textContent = 'Initializing... Please wait.';

    const fileList = fs.readdirSync(sourcePath);

    const pageWidth = parseInt(document.getElementById('pageWidth').value);
    const pageHeight = parseInt(document.getElementById('pageHeight').value);
    const fontSize = document.getElementById("fontSize").value ? parseFloat(document.getElementById("fontSize").value) : 0;
    const color = document.getElementsByClassName("color-switch")[0].checked ? 1 : 0;
    let deviceScale = 1;

    // Set device scale so that longest side will at least be 3300px
    if (pageWidth < 3300 && pageHeight < 3300) {
        if (pageWidth > pageHeight) {
            deviceScale = 3300 / pageWidth;
        } else {
            deviceScale = 3300 / pageHeight;
        }
    }

    // Launch headless browser with desired user settings
    const browser = await puppeteer.launch({
        executablePath: config.get('chromeExe'),
        headless: true,
        defaultViewport: {
            width: pageWidth,
            height: pageHeight,
            deviceScaleFactor: deviceScale
        }
    });

    progressBar.classList.add('progress-bar-animated');

    for (let i = 0; i < fileList.length; i++) {
        const page = await browser.newPage();
        await page.goto(path.join('file://', sourcePath, fileList[i]));

        // bw
        if (color == 0) {
            await page.evaluate(blackAndWhite);
        }

        // font size
        if (fontSize != 0) {
            await page.evaluate(changeFontSize, fontSize);
        }

        // fit all images and tables within viewport
        await page.evaluate(fitImages);
        // await page.evaluate(fitTables);

        let scrollHeight = await page.evaluate(getScrollHeight);

        // if more than 1 page, add whitespace to bottom of page so that last page will get a full scroll
        if (scrollHeight > pageHeight) {
            await page.evaluate(addWhiteSpace, pageHeight);

            // get the new scrollHeight since we added whitespace
            scrollHeight = await page.evaluate(getScrollHeight);
        }

        outputText.innerHTML += `<br>(${i + 1}/${fileList.length}) ${fileList[i]}`;

        // scrolling screenshots
        let imgCtr = 1;

        for (let scrollPosition = 0; scrollPosition < scrollHeight; scrollPosition += pageHeight) {
            const suffix = '_' + String(imgCtr).padStart(6, '0');
            const fileName = path.basename(fileList[i], path.extname(fileList[i]));
            const image = path.join(imagesPath, fileName + suffix + '.jpg');

            await page.screenshot({
                path: image,
                quality: 80,
                captureBeyondViewport: false
            });

            await page.evaluate(scrollPage, pageHeight);

            try {
                if (imgCtr == 1) {
                    fs.appendFileSync(path.join(outputPath, 'Images.opt'), fileName + ',,' + image + ',Y,,,' + (Math.floor(scrollHeight / pageHeight)) + '\n');
                } else {
                    fs.appendFileSync(path.join(outputPath, 'Images.opt'), fileName + suffix + ',,' + image + ',,,,\n');
                }
            } catch (err) {
                overlay.display(err);
                return;
            }

            imgCtr++;
        }

        await page.close();

        const percentFinished = `${Math.round((i + 1) / fileList.length * 100)}%`;
        progressBar.textContent = percentFinished;
        progressBar.style.width = percentFinished;
    }

    await browser.close();

    // Done
    progressBar.classList.remove('progress-bar-animated');
    progressBar.classList.add('progress-bar-complete');
    progressBar.textContent = 'Done';

    async function blackAndWhite() {
        document.getElementsByTagName('html')[0].style.filter = "grayscale(100%)";
    }

    async function changeFontSize(fontSize) {
        const tagNames = ['body', 'div', 'span'];

        // html
        let elem = document.getElementsByTagName('html');
        for (let i = 0; i < html.length; i++) {
            elem[i].style.fontSize = "100%";
            elem[i].style.lineHeight = "1em";
        }

        // img
        elem = document.getElementsByTagName('img');
        for (let i = 0; i < elem.length; i++) {
            elem[i].style.minWidth = fontSize * 6.5 + "em";
        }

        for (tagName in tagNames) {
            let elem = document.getElementsByTagName(tagName);

            for (let i = 0; i < elem.length; i++) {
                elem[i].style.fontSize = fontSize + "em";
                elem[i].style.lineHeight = "1em";
            }
        }
    }

    async function fitImages() {
        const images = document.getElementsByTagName('img');

        for (let i = 0; i < images.length; i++) {
            images[i].style.maxWidth = "100%";
            images[i].style.height = "auto";
        }
    }

    async function fitTables() {
        const tables = document.getElementsByTagName('td');

        for (let i = 0; i < tables.length; i++) {

        }
    }

    async function getScrollHeight() {
        return document.body.scrollHeight;
    }

    async function addWhiteSpace(pageHeight) {
        document.getElementsByTagName('html')[0].style.height = ((Math.floor(document.body.scrollHeight / pageHeight) + 1) * pageHeight).toString() + "px";
    }

    async function scrollPage(pageHeight) {
        window.scrollBy(0, pageHeight);

        return Promise.resolve();
    }
}
