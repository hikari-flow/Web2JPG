"use strict";

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const overlay = require('./overlay.js');
const config = require('./config.js');

exports.convertToJpg = async (sourcePath, outputPath, imagesPath, pageWidth, pageHeight, fontSize, color, deviceScale) => {
    const fileList = fs.readdirSync(sourcePath);

    overlay.display('Imaging in Progress.');

    for (const file of fileList) {

        // launch headless browser with desired user settings
        const browser = await puppeteer.launch({
            executablePath: config.get('chromeExe'),
            headless: true,
            defaultViewport: {
                width: pageWidth,
                height: pageHeight,
                deviceScaleFactor: deviceScale
            }
        });

        const page = await browser.newPage();
        await page.goto(path.join('file://', sourcePath, file));

        // bw
        if (color == 0) {
            await page.evaluate(blackAndWhite);
        }

        // font size
        if (fontSize != 0) {
            await page.evaluate(changeFontSize, fontSize);
        }

        // fit all images within viewport
        await page.evaluate(fitImages);

        let scrollHeight = await page.evaluate(getScrollHeight);

        // adds whitespace to bottom of page so last page will get a full scroll
        if (scrollHeight > pageHeight) {
            await page.evaluate(addWhiteSpace, pageHeight);
        }

        // get the new scrollHeight since we added whitespace
        scrollHeight = await page.evaluate(getScrollHeight);

        // scrolling screenshots
        console.log('Imaging ' + file);

        let imgCtr = 1;

        for (let scrollPosition = 0; scrollPosition < scrollHeight; scrollPosition += pageHeight) {
            const suffix = '_' + String(imgCtr).padStart(6, '0');
            const fileName = path.basename(file, path.extname(file));
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

        await browser.close();

        /*** FUNCTIONS ***/
        async function blackAndWhite() {
            document.getElementsByTagName('html')[0].style.filter = "grayscale(100%)";
        }

        async function changeFontSize(fontSize) {
            let elem = document.getElementsByTagName('html');
            for (let i = 0; i < elem.length; i++) { elem[i].style.fontSize = "100%"; elem[i].style.lineHeight = "1em"; }

            elem = document.getElementsByTagName('body');
            for (let i = 0; i < elem.length; i++) { elem[i].style.fontSize = fontSize + "em"; elem[i].style.lineHeight = "1em"; }

            elem = document.getElementsByTagName('div');
            for (let i = 0; i < elem.length; i++) { elem[i].style.fontSize = fontSize + "em"; elem[i].style.lineHeight = "1em"; }

            elem = document.getElementsByTagName('span');
            for (let i = 0; i < elem.length; i++) { elem[i].style.fontSize = fontSize + "em"; elem[i].style.lineHeight = "1em"; }

            elem = document.getElementsByTagName('img');
            for (let i = 0; i < elem.length; i++) { elem[i].style.minWidth = fontSize * 6.5 + "em"; }
        }

        async function fitImages() {
            const images = document.getElementsByTagName('img');

            for (let i = 0; i < images.length; i++) {
                images[i].style.maxWidth = "100%";
                images[i].style.height = "auto";
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

    overlay.clear();
    overlay.display('Imaging Complete.');
}
