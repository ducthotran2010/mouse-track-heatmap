/* eslint-disable no-shadow */
const fs = require('fs');
const puppeteer = require('puppeteer');
const { readDB } = require('./db');

(async () => {
  try {
    const htmlFile = await new Promise((resolve, reject) =>
      fs.readFile('./client-dom/localhost.html', (error, data) => {
        if (error) {
          return reject(error);
        }
        return resolve(data);
      }),
    );

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(true);
    await page.setViewport({
      width: 1280,
      height: 800,
      scaleFactor: 1,
    });

    await page.setContent(htmlFile.toString(), {
      timeout: 60 * 1000,
      waitUntil: 'networkidle2',
    });

    const db = await readDB();

    await Promise.all(
      db.map(async ({ selector, layerX, layerY, width, height }) => {
        const {
          positionX,
          positionY,
          newWidth,
          newHeight,
        } = await page.evaluate(_selector => {
          const node = document.querySelector(_selector);
          const { offsetWidth: newWidth, offsetHeight: newHeight } = node;
          const { x: positionX, y: positionY } = node.getBoundingClientRect();
          return { positionX, positionY, newWidth, newHeight };
        }, 'html > body > header > div > div > ul > li > a');

        const newLayerX = (layerX / width) * newWidth;
        const newLayerY = (layerY / height) * newHeight;

        return {
          x: positionX + newLayerX,
          y: positionY + newLayerY,
        };
      }),
    );

    await page.close();
    await browser.close();
  } catch (error) {
    console.log(error);
  }
})();
