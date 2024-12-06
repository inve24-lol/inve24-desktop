const { app, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
    nodeIntegration: false,
    contextIsolation: true,
  });
  mainWindow.loadFile('index.html');

  mainWindow.webContents.openDevTools();
};
app.whenReady().then(createWindow);
