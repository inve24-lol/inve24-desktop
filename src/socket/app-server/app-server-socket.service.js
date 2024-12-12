const io = require('socket.io-client');
const axios = require('axios');

class AppServerSocketService {
  _webContents;
  _config;
  _puuid;
  _appServerSocket;
  _lolClientSocket;

  constructor(webContents, config, puuid, lolClientSocket) {
    this._webContents = webContents;
    this._config = config;
    this._puuid = puuid;
    this._appServerSocket = null;
    this._lolClientSocket = lolClientSocket;
  }

  async openAppServerSocket() {
    try {
      if (this._appServerSocket) throw new Error('⚠ 서버와 이미 연결되어 있습니다.');

      const { server } = this._config.getServerConfig();

      const appServerSocket = io(`${server.host}/${server.ws.namespace}`, {
        auth: { socketEntryCode: this._puuid },
      });

      appServerSocket.on('connect_error', () => {
        this._webContents.send('log', {
          message: '⚠ 실행중인 서버를 찾을 수 없습니다.',
          isError: true,
        });
      });

      appServerSocket.on('connect', () => {
        this._appServerSocket = appServerSocket;

        this._webContents.send('log', { message: '🟩 서버 연결 성공' });
      });

      appServerSocket.on('handle-connection-error', (error) => {
        const { message } = error.response;

        this._webContents.send('log', { message: `⚠ ${message}`, isError: true });
      });

      appServerSocket.on('session-conflict-error', (message) => {
        this._webContents.send('log', { message: `⚠ ${message}`, isError: true });
      });

      appServerSocket.on('invite-room', async (body) => {
        const { message } = body;

        this._webContents.send('log', { message: `🟩 ${message}` });

        await this.joinAppServerRoom(this._puuid);
      });

      appServerSocket.on('hello', async (body) => {
        const { message } = body;

        await this.catchGameStatus();

        this._webContents.send('log', { message: `🟩 ${message}` });
      });

      appServerSocket.on('web-not-found', (body) => {
        const { message } = body;

        const { lcuWebSocket } = this._config.getLcuWebSocketConfig();

        this._lolClientSocket.unsubscribe(lcuWebSocket.gameflowPhase);

        this._webContents.send('log', { message: `🟨 ${message}` });
      });

      appServerSocket.on('disconnect', () => {
        this._appServerSocket = null;

        if (this._webContents.isDestroyed()) return;

        this._webContents.send('log', { message: '🟥 서버 연결 종료' });
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async joinAppServerRoom(puuid) {
    if (!this._appServerSocket)
      this._webContents.send('log', { message: '⚠ 연결된 서버가 없습니다.', isError: true });

    this._appServerSocket.emit('join-room', { socketEntryCode: puuid });

    this._appServerSocket.off('join-room-reply');

    this._appServerSocket.on('join-room-reply', (body) => {
      const { message } = body;

      this._webContents.send('log', {
        message: `🟩 ${message} (스마트폰으로 접속해주세요.)`,
      });
    });
  }

  async catchGameStatus() {
    const { lcuWebSocket } = this._config.getLcuWebSocketConfig();

    this._lolClientSocket.subscribe(lcuWebSocket.gameflowPhase, async (gameStatus) => {
      if (['None', 'Lobby', 'ChampSelect', 'GameStart'].includes(gameStatus)) {
        await this.sendGameStatus(gameStatus);

        this._webContents.send('log', { message: `🟦 현재 게임 상태 - ${gameStatus}` });
      }

      if (gameStatus === 'InProgress') {
        await this.sendGameStartTime();
      }
    });
  }

  async sendGameStatus(gameStatus) {
    if (!this._appServerSocket)
      this._webContents.send('log', { message: '⚠ 연결된 서버가 없습니다.', isError: true });

    this._appServerSocket.emit('game-status', { gameStatus });
  }

  async sendGameStartTime() {
    if (!this._appServerSocket)
      this._webContents.send('log', { message: '⚠ 연결된 서버가 없습니다.', isError: true });

    let success = false;
    let counter = 0;

    while (counter < 90) {
      const { lcuLive } = this._config.getLcuLiveConfig();

      try {
        const response = await axios.get(`${lcuLive.host}/${lcuLive.activePlayerName}`);

        if (response) {
          this._webContents.send('log', {
            message: `🟪 ${response.data}님의 게임이 시작되었습니다.`,
          });
          success = true;

          break;
        }

        counter++;
      } catch (error) {
        this._appServerSocket.emit('game-status', { gameStatus: 'Loading...' });
        this._webContents.send('log', { message: '🟦 현재 게임 상태 - Loading...' });
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    if (success) this._appServerSocket.emit('game-start-time', { gameStartTime: '3' });
    else {
      appendLog('🟨 3분이 경과되어 게임 조회를 종료합니다.');
      await closeAppServerSocket();
    }
  }

  async closeAppServerSocket() {
    try {
      if (!this._appServerSocket) throw new Error('⚠ 연결된 서버가 없습니다.');

      this._appServerSocket.emit('disconnect-request', { socketEntryCode: this._puuid });

      this._appServerSocket.disconnect();

      this._appServerSocket = null;

      if (this._webContents.isDestroyed()) return;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = AppServerSocketService;
