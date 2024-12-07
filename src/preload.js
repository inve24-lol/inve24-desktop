const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  invokeOpenLolClientSocket: () => ipcRenderer.invoke('open-lol-client-socket'),
  invokeCloseLolClientSocket: () => ipcRenderer.invoke('close-lol-client-socket'),
  onLog: (callback) => ipcRenderer.on('log', callback),
});
