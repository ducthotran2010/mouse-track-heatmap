import fs from 'fs';

export const readDB = async TABLE =>
  new Promise((resolve, reject) =>
    fs.readFile(TABLE, (error, data) => {
      if (error) {
        return reject(error);
      }

      try {
        const db = JSON.parse(data);
        return resolve(db);
      } catch (_) {
        return resolve([]);
      }
    }),
  );

export const saveDB = async (data, TABLE) =>
  new Promise((resolve, reject) =>
    fs.writeFile(TABLE, JSON.stringify(data), error => {
      if (error) {
        console.log({ error: JSON.stringify(error) });
        return reject(error);
      }
      return resolve();
    }),
  );
