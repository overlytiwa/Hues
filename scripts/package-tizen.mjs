import { readFile, writeFile } from 'node:fs/promises';

// The Vite bundle is an IIFE. Load it as a classic script in a packaged
// file:// Tizen application, avoiding module-origin restrictions.
const path = new URL('../dist/index.html', import.meta.url);
const html = await readFile(path, 'utf8');
await writeFile(path, html.replace(/<script type="module" crossorigin/g, '<script defer').replace(/<link rel="stylesheet" crossorigin/g, '<link rel="stylesheet"'));
console.log('Tizen-ready dist/ created. Sign and deploy with the Tizen Extension for VS Code.');
