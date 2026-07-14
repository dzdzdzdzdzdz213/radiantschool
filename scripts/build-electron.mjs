import esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function build() {
  const entryPoints = [
    path.join(root, 'electron', 'main.ts'),
    path.join(root, 'electron', 'preload.ts'),
  ];

  await esbuild.build({
    entryPoints,
    outdir: path.join(root, 'dist-electron'),
    outExtension: { '.js': '.cjs' },
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    external: ['electron'],
    sourcemap: false,
    minify: true,
  });

  console.log('✓ Electron main process built to dist-electron/');
}

build().catch((err) => {
  console.error('Electron build failed:', err);
  process.exit(1);
});
