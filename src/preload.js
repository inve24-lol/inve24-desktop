const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  invokeOpenLolClientSocket: () => ipcRenderer.invoke('open-lol-client-socket'),
  invokeCloseLolClientSocket: () => ipcRenderer.invoke('close-lol-client-socket'),
  invokeCloseAppServerSocket: () => ipcRenderer.invoke('close-app-server-socket'),
  onLog: (callback) => ipcRenderer.on('log', callback),
  onEnd: (callback) => ipcRenderer.on('end', callback),
});
