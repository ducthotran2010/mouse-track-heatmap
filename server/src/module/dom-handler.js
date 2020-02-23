import fs from 'fs';
import captureWebsite from 'capture-website';

import constants from '../constants';

export default app => {
  app.post('/dom', async (req, res) => {
    try {
      const document = req.body;
      const hostname = 'localhost';
      const savePath = `${constants.DOM_DIR}/${hostname}.html`;

      console.log('save dom');
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
      await captureWebsite.file(document, `./client-image/${hostname}.png`, {
        inputType: 'html',
        overwrite: true,
        timeout: 5 * 60,
        width: 1280,
        height: 2397,
        // fullPage: true,
        scaleFactor: 1,
      });

      return res.sendStatus(200);
    } catch (error) {
      return res.status(500).json(error);
    }
  });

  app.get('/dom', async (_, res) => {
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
};
