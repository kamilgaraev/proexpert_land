const http = require('http');
const path = require('path');
const fs = require('fs');
const { renderPage } = require('vite-plugin-ssr/server');
// Регистрация pageFiles и client манифеста, сгенерированных Vite
require(path.resolve(__dirname, './importBuild.cjs'));

const distDir = path.resolve(__dirname, '../client');

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  const staticFilePath = path.join(distDir, url);
  if (fs.existsSync(staticFilePath) && fs.statSync(staticFilePath).isFile()) {
    const ext = path.extname(staticFilePath).toLowerCase();
    const mime = {
      '.js': 'application/javascript',
      '.mjs': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.ico': 'image/x-icon',
      '.woff2': 'font/woff2',
      '.woff': 'font/woff',
      '.ttf': 'font/ttf',
    }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=31536000, immutable' });
    fs.createReadStream(staticFilePath).pipe(res);
    return;
  }

  const pageContext = await renderPage({ urlOriginal: req.url });
  const { httpResponse } = pageContext;
  if (!httpResponse) {
    const htmlPath = path.join(distDir, 'index.html');
    try {
      const html = await fs.promises.readFile(htmlPath);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(html);
    } catch (e) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      const notFoundPath = path.join(distDir, '404.html');
      if (fs.existsSync(notFoundPath)) {
        const notFoundHtml = await fs.promises.readFile(notFoundPath);
        return res.end(notFoundHtml);
      }
      res.end('Not found');
      return;
    }
  }
  if (httpResponse.statusCode === 404) {
    const htmlPath = path.join(distDir, 'index.html');
    const html = await fs.promises.readFile(htmlPath);
    res.writeHead(404, { 'Content-Type': 'text/html' });
    return res.end(html);
  }
  res.writeHead(httpResponse.statusCode, httpResponse.headers);
  res.end(httpResponse.body);
});

const port = process.env.PORT || 3001;
server.listen(port);