'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  const server = new http.Server();

  server.on('request', (req, res) => {
    if (req.method !== 'POST' && req.path !== '/add-expense') {
      res.statusCode = 404;
      res.end('Invalid url');

      return;
    }

    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));

    req.on('end', () => {
      const data = Buffer.concat(chunks);
      const dataParams = ['date', 'title', 'amount'];
      let jsonData;

      try {
        jsonData = JSON.parse(data);
      } catch {
        res.statusCode = 400;
        res.end('Invalid JSON');

        return;
      }

      if (dataParams.some((param) => !jsonData[param])) {
        res.statusCode = 400;
        res.end('Data missing');

        return;
      }

      const filePath = path.resolve(__dirname, '../db/expense.json');
      const fileStream = fs.createWriteStream(filePath);

      fileStream.end(data);

      fileStream.on('finish', () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
      });
    });
  });

  server.on('error', (e) => {
    process.stdout.write('Error: ', e);
  });

  return server;
}

module.exports = {
  createServer,
};
