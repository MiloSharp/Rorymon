import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.json': 'application/json' };

createServer(async (request, response) => {
  if (request.url === '/') {
    response.writeHead(302, { Location: '/demo/battle/' }).end();
    return;
  }
  const urlPath = decodeURIComponent(request.url.split('?')[0]);
  const requestPath = urlPath === '/demo/battle/' ? '/demo/battle/index.html'
    : urlPath === '/demo/overworld/' ? '/demo/overworld/index.html' : urlPath;
  const fullPath = normalize(join(root, requestPath));
  if (!fullPath.startsWith(root)) { response.writeHead(403).end('Forbidden'); return; }
  try {
    const info = await stat(fullPath);
    if (!info.isFile()) throw new Error('Not a file');
    response.writeHead(200, { 'Content-Type': types[extname(fullPath)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(fullPath).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Rorymon battle: http://127.0.0.1:${port}/`));
