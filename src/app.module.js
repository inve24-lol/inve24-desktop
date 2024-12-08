const LcuApiService = require('./api/lcu/lcu-api.service');
const RiotApiService = require('./api/riot/riot-api.service');
const ConfigService = require('./config/config.service');
const AppServerSocketService = require('./socket/app-server/app-server-socket.service');
const LolClientSocketService = require('./socket/lol-client/lol-client-socket.service');
const { ipcMain } = require('electron');

class AppModule {
  _webContents;
  _lolClientSocket;
  _appServerSocket;
  _config;

  constructor(webContents) {
    this._webContents = webContents;
    this._lolClientSocket = null;
    this._appServerSocket = null;
    this._config = null;
  }

  async initialize() {
    ipcMain.handle('open-lol-client-socket', async () => {
      try {
        this._config = new ConfigService();

        this._lolClientSocket = new LolClientSocketService(this._webContents);

        await this._lolClientSocket.openLolClientSocket();

        const lcuApiService = new LcuApiService(this._webContents, this._config);

        const { gameName, tagLine } = await lcuApiService.fetchCurrentSummoner();

        const riotApiService = new RiotApiService(this._webContents, this._config);

        const { puuid } = await riotApiService.fetchRiotAccount(gameName, tagLine);

        this._appServerSocket = new AppServerSocketService(this._webContents, this._config, puuid);

        await this._appServerSocket.openAppServerSocket();
      } catch (error) {
        this._webContents.send('log', { message: error.message, isError: true });
      }
    });

    ipcMain.handle('close-lol-client-socket', async () => {
      try {
        await this._lolClientSocket.closeLolClientSocket();

        await this._appServerSocket.closeAppServerSocket();
      } catch (error) {
        this._webContents.send('log', { message: error.message, isError: true });
      }
    });
  }

  async exit() {
    if (this._lolClientSocket) await this._lolClientSocket.closeLolClientSocket();

    if (this._appServerSocket) await this._appServerSocket.closeAppServerSocket();
  }
}

module.exports = AppModule;
