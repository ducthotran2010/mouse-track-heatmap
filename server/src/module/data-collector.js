import { DB } from '../constants';
import { readDB, saveDB } from '../db';

export default app => {
  app.post('/click', async (req, res) => {
    try {
      const db = await readDB(DB.TABLE_CLICK);
      db.push(req.body);
      saveDB(db, DB.TABLE_CLICK);

      return res.sendStatus(200);
    } catch (error) {
      return res.status(500).json(error);
    }
  });

  app.post('/hover', async (req, res) => {
    try {
      const db = await readDB(DB.TABLE_HOVER);
      db.push(req.body);
      console.log(db.length);

      saveDB(db, DB.TABLE_HOVER);

      return res.sendStatus(200);
    } catch (error) {
      return res.status(500).json(error);
    }
  });
};
