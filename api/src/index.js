const express = require('express');
const http = require('http')


const IP = '0.0.0.0';
const PORT = 5555;
const app = express();
app.use(compression());
app.use(cors({ origin: ORIGIN }));
const server = http.createServer(app);

server.listen(PORT, IP, () => {
    console.log(`Cellborg API listening at http://localhost:${PORT} in the dev environment`);
  });