const express = require('express');
const http = require('http')
const cors = require('cors');
const compression = require('compression');

const IP = '0.0.0.0';
const PORT = 5555;
const app = express();
app.use(compression());
app.use(cors({ origin: '*' }));
const server = http.createServer(app);

server.listen(PORT, IP, () => {
    console.log(`Cellborg API listening at http://localhost:${PORT} in the dev environment`);
  });