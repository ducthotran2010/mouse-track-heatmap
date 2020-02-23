/* eslint-disable no-shadow */
import fs from 'fs';
import puppeteer from 'puppeteer';

import { DB } from '../../constants';
import { readDB, saveDB } from '../../db';

const minuteToMs = minute => minute * 60 * 1000;

const clickStatistic = async page => {
  let db = await readDB(DB.TABLE_CLICK);
  db = db.filter(row => row.hostname === 'localhost');
  db = await Promise.all(
    db.map(async ({ selector, offsetX, offsetY, width, height }) => {
      const { positionX, positionY, newWidth, newHeight } = await page.evaluate(
        _selector => {
          function getDocumentOffsetPosition(el) {
            const position = {
              top: el.offsetTop,
              left: el.offsetLeft,
            };
            if (el.offsetParent) {
              const parentPosition = getDocumentOffsetPosition(el.offsetParent);
              position.top += parentPosition.top;
              position.left += parentPosition.left;
            }
            return position;
          }
          const node = document.querySelector(_selector);
          const { offsetWidth: newWidth, offsetHeight: newHeight } = node;
          const { left: positionX, top: positionY } = getDocumentOffsetPosition(
            node,
          );
          return { positionX, positionY, newWidth, newHeight };
        },
        selector,
      );

      const newOffsetX = (offsetX / width) * newWidth;
      const newOffsetY = (offsetY / height) * newHeight;

      return {
        x: positionX + newOffsetX,
        y: positionY + newOffsetY,
      };
    }),
  );
  await saveDB(db, DB.TABLE_CLICK_STAT);
};

export const statisticUpdater = () => {
  setInterval(async () => {
    console.log('updating statistic...');

    const htmlFile = await new Promise((resolve, reject) =>
      fs.readFile('./client-dom/localhost.html', (error, data) => {
        if (error) {
          return reject(error);
        }
        return resolve(data);
      }),
    );

    const browser = await puppeteer.launch();
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

    await clickStatistic(page);

    await page.close();
    await browser.close();
  }, minuteToMs(1));
};
