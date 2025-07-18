const http = require('http');
const path = require('path');
const fs = require('fs');
const { renderPage } = require('vite-plugin-ssr/server');

const distDir = path.resolve(__dirname, '../client');

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  const staticFilePath = path.join(distDir, url);
  if (fs.existsSync(staticFilePath) && fs.statSync(staticFilePath).isFile()) {
    fs.createReadStream(staticFilePath).pipe(res);
    return;
  }

  const pageContext = await renderPage({ urlOriginal: req.url });
  const { httpResponse } = pageContext;
  if (!httpResponse) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }
  res.writeHead(httpResponse.statusCode, httpResponse.headers);
  res.end(httpResponse.body);
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`SSR server listening on ${port}`);
}); 