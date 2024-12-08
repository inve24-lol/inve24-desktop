const { app, BrowserWindow } = require('electron');
const path = require('path');
const AppModule = require('./app.module');

let appModule;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    autoHideMenuBar: true,
  });
  // mainWindow.webContents.openDevTools();

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('did-finish-load', async () => {
    appModule = new AppModule(mainWindow.webContents);
    appModule.initialize();
  });
};

app.whenReady().then(createWindow);

app.on('will-quit', async () => {
  if (appModule) await appModule.exit();
});
