import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve("out");
const portIndex = process.argv.indexOf("--port");
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : 4173);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

if (!existsSync(root)) throw new Error("Le dossier out/ est absent. Lancez d’abord npm run build.");

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  let filePath = resolve(root, `.${pathname}`);
  if (!filePath.startsWith(`${root}${sep}`) && filePath !== root) return send404(response);
  if (pathname.endsWith("/") || (existsSync(filePath) && statSync(filePath).isDirectory())) filePath = resolve(filePath, "index.html");
  if (!existsSync(filePath) && !extname(pathname)) filePath = resolve(root, `.${pathname}`, "index.html");
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return send404(response);
  response.writeHead(200, {
    "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
    "Cache-Control": pathname === "/sw.js" || pathname === "/precache-manifest.js" ? "no-cache" : "public, max-age=0",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Prévisualisation statique : http://127.0.0.1:${port}`);
});

function send404(response) {
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Page introuvable");
}
