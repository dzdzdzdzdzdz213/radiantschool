import { app, BrowserWindow, ipcMain, Menu, globalShortcut } from 'electron';
import path from 'node:path';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;
const DEV_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Radiant School Manager',
    icon: path.join(__dirname, '../public/logo-256.png'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) {
    win.loadURL(DEV_URL + 'desktop.html');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/desktop.html'));
  }

  mainWindow = win;
}

function buildMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Fichier',
      submenu: [
        { role: 'reload', label: 'Actualiser' },
        { type: 'separator' },
        { role: 'quit', label: 'Quitter' },
      ],
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Rétablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'selectAll', label: 'Tout sélectionner' },
      ],
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'togglefullscreen', label: 'Plein écran' },
        { type: 'separator' },
        { role: 'toggleDevTools', label: 'Outils de développement' },
      ],
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox({
              type: 'info',
              title: 'Radiant School Manager',
              message: 'Radiant School Manager v1.0.0',
              detail: 'Application de gestion pour centre de soutien scolaire.',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.commandLine.appendSwitch('lang', 'fr');
app.commandLine.appendSwitch('disable-http-cache');

app.whenReady().then(() => {
  buildMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('is-dev', () => isDev);
