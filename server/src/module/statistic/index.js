/* eslint-disable no-shadow */
import fs from 'fs';
import puppeteer from 'puppeteer';

import { DB } from '../../constants';
import { readDB } from '../../db';

export default app => {
  app.get('/statistic-calc-click', async (req, res) => {
    const hostname = req.query.hostname;

    try {
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

      let db = await readDB(DB.TABLE_CLICK);
      db = db.filter(row => row.hostname === hostname);
      db = await Promise.all(
        db.map(async ({ selector, offsetX, offsetY, width, height }) => {
          const {
            positionX,
            positionY,
            newWidth,
            newHeight,
          } = await page.evaluate(_selector => {
            function getDocumentOffsetPosition(el) {
              const position = {
                top: el.offsetTop,
                left: el.offsetLeft,
              };
              if (el.offsetParent) {
                const parentPosition = getDocumentOffsetPosition(
                  el.offsetParent,
                );
                position.top += parentPosition.top;
                position.left += parentPosition.left;
              }
              return position;
            }
            const node = document.querySelector(_selector);
            const { offsetWidth: newWidth, offsetHeight: newHeight } = node;
            const {
              left: positionX,
              top: positionY,
            } = getDocumentOffsetPosition(node);
            return { positionX, positionY, newWidth, newHeight };
          }, selector);
          console.log({
            positionX,
            positionY,
            newWidth,
            newHeight,
          });

          const newOffsetX = (offsetX / width) * newWidth;
          const newOffsetY = (offsetY / height) * newHeight;

          return {
            x: positionX + newOffsetX,
            y: positionY + newOffsetY,
          };
        }),
      );

      await page.close();
      await browser.close();

      const result = {
        width: 1280,
        height: 2397,
        coordinates: db,
      };

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });

  app.get('/statistic-calc-hover', async (req, res) => {
    const hostname = req.query.hostname;

    try {
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

      let db = await readDB(DB.TABLE_HOVER);
      db = db.filter(row => row.hostname === hostname);
      db = await Promise.all(
        db.map(async ({ selector, offsetX, offsetY, width, height }) => {
          const {
            positionX,
            positionY,
            newWidth,
            newHeight,
          } = await page.evaluate(_selector => {
            function getDocumentOffsetPosition(el) {
              const position = {
                top: el.offsetTop,
                left: el.offsetLeft,
              };
              if (el.offsetParent) {
                const parentPosition = getDocumentOffsetPosition(
                  el.offsetParent,
                );
                position.top += parentPosition.top;
                position.left += parentPosition.left;
              }
              return position;
            }
            const node = document.querySelector(_selector);
            const { offsetWidth: newWidth, offsetHeight: newHeight } = node;
            const {
              left: positionX,
              top: positionY,
            } = getDocumentOffsetPosition(node);
            return { positionX, positionY, newWidth, newHeight };
          }, selector);
          console.log({
            positionX,
            positionY,
            newWidth,
            newHeight,
          });

          const newOffsetX = (offsetX / width) * newWidth;
          const newOffsetY = (offsetY / height) * newHeight;

          return {
            x: positionX + newOffsetX,
            y: positionY + newOffsetY,
          };
        }),
      );

      await page.close();
      await browser.close();

      const result = {
        width: 1280,
        height: 2397,
        coordinates: db,
      };

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });

  app.get('/statistic-click', async (req, res) => {
    try {
      const db = await readDB(DB.TABLE_CLICK_STAT);
      return res.status(200).json({
        width: 1280,
        height: 2397,
        coordinates: db,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });
  app.get('/statistic-hover', async (req, res) => {
    try {
      const db = await readDB(DB.TABLE_HOVER_STAT);
      return res.status(200).json({
        width: 1280,
        height: 2397,
        coordinates: db,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });
};
