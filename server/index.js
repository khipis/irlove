/**
 * IRLove – minimal Gun.js relay server.
 * Deploy to Railway, Render, Fly.io or run locally (with ngrok for HTTPS).
 */
const Gun = require('gun');
const http = require('http');

const port = process.env.PORT || 8765;
const server = http.createServer();

const gun = Gun({
  web: server,
  file: 'data',
  peers: []
});

server.listen(port, function () {
  console.log('IRLove Gun relay listening on port', port);
});
