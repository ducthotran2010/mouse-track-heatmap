import fs from 'fs';

import constants from '../constants';

export default app => {
  // Public SDK for client to use
  app.get('/lib.js', (_, res) =>
    fs.readFile(constants.SDK_PATH, (error, data) => {
      if (error) res.status(500).json(error);
      res.status(200).send(data);
    }),
  );
};
