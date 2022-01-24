"use strict";

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const overlay = require('./overlay.js');

exports.convertToJpg = async (sourcePath, outputPath, pageWidth, pageHeight, color, deviceScale) => {
    const fileList = fs.readdirSync(sourcePath);

    overlay.display('Imaging in Progress.');

    for (const file of fileList) {
        // launch headless browser with desired user settings
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: {
                width: pageWidth,
                height: pageHeight,
                deviceScaleFactor: deviceScale
            }
        });

        // open file in new page on browser and retrieve total height of page
        const page = await browser.newPage();
        await page.goto(path.join('file://', sourcePath, file));

        const pageData = await page.evaluate(getPageData);

        // fit all images within viewport
        await page.evaluate(fitImages);

        // adds whitespace to bottom of page so last page will get a full scroll
        if (pageData.scrollHeight > pageHeight) {
            await page.evaluate(addWhiteSpace);
        }

        // bw
        if (color == 0) {
            await page.evaluate(blackAndWhite);
        }

        // scrolling screenshots
        console.log('Imaging ' + file);

        let imgCtr = 1;

        for (let scrollPosition = 0; scrollPosition < pageData.scrollHeight; scrollPosition += pageHeight) {
            const suffix = '_' + String(imgCtr).padStart(6, '0');
            const fileName = path.basename(file, path.extname(file));
            const image = path.join(outputPath, 'IMAGES', fileName + suffix + '.jpg');

            await page.screenshot({
                path: image,
                quality: 80,
                captureBeyondViewport: true
            });

            await page.evaluate(scrollPage);

            try {
                if (imgCtr == 1) {
                    fs.appendFileSync(path.join(outputPath, 'Images.opt'), fileName + ',,' + image + ',Y,,,' + (Math.floor(pageData.scrollHeight / pageHeight) + 1) + '\n');
                } else {
                    fs.appendFileSync(path.join(outputPath, 'Images.opt'), fileName + suffix + ',,' + image + ',,,,\n');
                }
            } catch (err) {
                overlay.display(err);
            }

            imgCtr++;
        }

        await browser.close();

        /*** FUNCTIONS ***/
        async function getPageData() {
            return {
                scrollHeight: document.body.scrollHeight
            };
        }

        async function fitImages() {
            var images = document.getElementsByTagName('img');

            for (var i = 0; i < images.length; i++) {
                images[i].style.maxWidth = "100%";
                images[i].style.height = "auto";
            }
        }

        async function addWhiteSpace() {
            document.getElementsByTagName('html')[0].style.height = ((Math.floor(document.body.scrollHeight / window.innerHeight) + 1) * window.innerHeight).toString() + "px";
        }

        async function blackAndWhite() {
            document.getElementsByTagName('html')[0].style.filter = "grayscale(100%)";
        }

        async function scrollPage() {
            window.scrollBy(0, window.innerHeight);

            return Promise.resolve();
        }
    }

    overlay.clear();
    overlay.display('Imaging Complete.');
}
