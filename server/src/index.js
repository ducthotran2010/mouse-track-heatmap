import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';

import configRoutes from './module';
import { statisticUpdater } from './module/statistic/updater';

const app = express();
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.text({ defaultCharset: 'UTF-8', type: 'text/html' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

configRoutes(app);
statisticUpdater();

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
