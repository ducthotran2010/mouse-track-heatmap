import fs from 'fs';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';

import constants from './constants';
import { readDB, saveDB } from './db';

const app = express();
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Public SDK for client to use
app.get('/sdk.js', (_, res) =>
  fs.readFile(constants.SDK_PATH, (error, data) => {
    if (error) res.status(500).json(error);
    res.status(200).send(data);
  })
);

// Post data
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

// Statistic
app.get('/statistic', async (req, res) => {
  const hostname = req.query.hostname;

  try {
    const db = await readDB(res);

    return res.status(200).json(db.filter(row => row.hostname === hostname));
  } catch (error) {
    return res.status(500).json(error);
  }
});

const PORT = process.env.PORT || 7777;
app.listen(PORT, () =>
  console.log(`
    Service is up on port ${PORT} 🐳
    ---`)
);

process.on('SIGINT', () => {
  console.log('Bye bye!');
  process.exit();
});
