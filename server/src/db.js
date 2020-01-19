import fs from 'fs';
import constants from './constants';

export const readDB = async () => 
  new Promise((resolve, reject) => fs.readFile(constants.DB_PATH, (error, data) => {
    if (error) {
      return reject(error);
    }

    try {
      const db = JSON.parse(data);
      return resolve(db);
    } catch (_) {
      return resolve([]);
    }
  }));


export const saveDB = async (db) => 
  new Promise((resolve, reject) => fs.writeFile(constants.DB_PATH, db, error => {
    if (error) {
      console.log({ error: JSON.stringify(error) });
      return reject(error);
    }
    return resolve();
  }));

