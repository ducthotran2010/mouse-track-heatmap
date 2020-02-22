/* eslint-disable no-shadow */
import fs from 'fs';
import cors from 'cors';
import express from 'express';
import puppeteer from 'puppeteer';
import bodyParser from 'body-parser';
import captureWebsite from 'capture-website';

import constants from './constants';
import { readDB, saveDB } from './db';

const app = express();
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.text({ defaultCharset: 'UTF-8', type: 'text/html' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Public SDK for client to use
app.get('/sdk.js', (_, res) =>
  fs.readFile(constants.SDK_PATH, (error, data) => {
    if (error) res.status(500).json(error);
    res.status(200).send(data);
  }),
);

// Post (x, y) data
app.post('/', async (req, res) => {
  try {
    const db = await readDB(res);
    db.push(req.body);
    saveDB(JSON.stringify(db));

    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// save dom
app.post('/dom', async (req, res) => {
  try {
    const document = req.body;
    const hostname = 'localhost';
    const savePath = `${constants.DOM_DIR}/${hostname}.html`;
    console.log('save dom');

    // save dom
    await new Promise((resolve, reject) =>
      fs.writeFile(savePath, document, error => {
        if (error) {
          console.log({ error: JSON.stringify(error) });
          return reject(error);
        }
        return resolve();
      }),
    );

    console.log('capture');
    // capture image
    await captureWebsite.file(document, `./client-image/${hostname}.png`, {
      inputType: 'html',
      overwrite: true,
      timeout: 5 * 60,
      width: 1280,
      fullPage: true,
      scaleFactor: 1,
    });

    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// get dom
app.get('/dom', async (req, res) => {
  const hostname = 'localhost';
  const savePath = `${constants.DOM_DIR}/${hostname}.html`;
  try {
    const html = await new Promise((resolve, reject) =>
      fs.readFile(savePath, (error, data) => {
        if (error) {
          return reject(error);
        }
        return resolve(data);
      }),
    );
    return res.send(html.toString());
  } catch (error) {
    return res.status(500).json(error);
  }
});

// get image
app.get('/dom-img', async (req, res) => {
  res.writeHead(200, { 'content-type': 'image/jpg' });
  const hostname = 'localhost';
  const savePath = `${constants.IMG_DIR}/${hostname}.png`;

  try {
    fs.createReadStream(savePath).pipe(res);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Statistic
app.get('/statistic', async (req, res) => {
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

    let db = await readDB();
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

const PORT = process.env.PORT || 7777;
app.listen(PORT, () =>
  console.log(`
    Service is up on port ${PORT} 🐳
    ---`),
);

process.on('SIGINT', () => {
  console.log('Bye bye!');
  process.exit();
});
