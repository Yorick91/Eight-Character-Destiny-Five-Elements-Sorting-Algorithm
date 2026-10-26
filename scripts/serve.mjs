import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const projectName = 'Eight-Character-Destiny-Five-Elements-Sorting-Algorithm';
const projectPrefix = `/${projectName}/`;
const assets = new Map([
  ['index.html', 'text/html; charset=utf-8'],
  ['styles.css', 'text/css; charset=utf-8'],
  ['app.js', 'text/javascript; charset=utf-8'],
  ['algorithm.js', 'text/javascript; charset=utf-8'],
  ['.nojekyll', 'text/plain; charset=utf-8'],
]);
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  } catch {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }
  if (pathname === `/${projectName}`) {
    response.writeHead(301, { Location: projectPrefix });
    response.end();
    return;
  }
  const asset = (pathname.startsWith(projectPrefix)
    ? pathname.slice(projectPrefix.length) : pathname.slice(1)) || 'index.html';
  if (!assets.has(asset)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  try {
    const bytes = await readFile(new URL(asset, root));
    response.writeHead(200, {
      'Content-Type': assets.get(asset),
      'Content-Length': bytes.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch {
    response.writeHead(500);
    response.end('Unable to read site asset');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is already in use. Set PORT to another port and retry.`
    : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Repository: ${fileURLToPath(root)}`);
  console.log(`Local preview: http://127.0.0.1:${port}/`);
  console.log(`GitHub Pages path preview: http://127.0.0.1:${port}${projectPrefix}`);
  console.log('Press Ctrl+C to stop.');
});
