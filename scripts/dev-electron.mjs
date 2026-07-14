import { spawn } from 'node:child_process';
import { createServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function startDev() {
  const server = await createServer({
    configFile: path.join(root, 'vite.config.ts'),
    envDir: root,
  });
  await server.listen();
  const address = server.resolvedUrls?.local?.[0] || 'http://localhost:3000';
  console.log(`✓ Vite dev server: ${address}`);

  process.env.VITE_DEV_SERVER_URL = address + 'desktop.html';

  const electronPath = path.join(root, 'node_modules', '.bin', 'electron');
  const electron = spawn(
    electronPath,
    [path.join(root, 'dist-electron', 'main.cjs')],
    {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, VITE_DEV_SERVER_URL: address },
    },
  );

  electron.on('close', () => {
    server.close();
    process.exit();
  });
}

const buildElectron = async () => {
  const esbuild = await import('esbuild');
  await esbuild.build({
    entryPoints: [
      path.join(root, 'electron', 'main.ts'),
      path.join(root, 'electron', 'preload.ts'),
    ],
    outdir: path.join(root, 'dist-electron'),
    outExtension: { '.js': '.cjs' },
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    external: ['electron'],
    sourcemap: false,
    minify: false,
  });
  console.log('✓ Electron built to dist-electron/');
};

buildElectron().then(startDev).catch((err) => {
  console.error('Dev start failed:', err);
  process.exit(1);
});
