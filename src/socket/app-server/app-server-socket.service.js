const io = require('socket.io-client');

class AppServerSocketService {
  _webContents;
  _config;
  _puuid;
  _appServerSocket;

  constructor(webContents, config, puuid) {
    this._webContents = webContents;
    this._config = config;
    this._puuid = puuid;
    this._appServerSocket = null;
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

      appServerSocket.on('error-message', (error) => {
        const { message } = error.response;

        this._webContents.send('log', { message: `⚠ ${message}`, isError: true });
      });

      appServerSocket.on('invite-room', async (body) => {
        const { message } = body;

        this._webContents.send('log', { message: `🟩 ${message}` });

        await this.joinAppServerRoom(this._puuid);
      });

      appServerSocket.on('disconnect', () => {
        this._appServerSocket = null;

        this._webContents.send('log', { message: '🟥 서버 연결 종료' });
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async joinAppServerRoom() {
    if (!this._appServerSocket)
      this._webContents.send('log', { message: '⚠ 연결된 서버가 없습니다.', isError: true });

    this._appServerSocket.emit('join-room', { roomId: this._puuid });

    this._appServerSocket.off('join-room-reply-app');

    this._appServerSocket.on('join-room-reply-app', (body) => {
      const { message } = body;

      this._webContents.send('log', {
        message: `🟩 ${message} (화면에 발급된 QR코드를 찍어주세요.)`,
      });
    });
  }

  async closeAppServerSocket() {
    try {
      if (!this._appServerSocket) throw new Error('⚠ 연결된 서버가 없습니다.');

      this._appServerSocket.disconnect();

      this._appServerSocket = null;

      this._webContents.send('log', { message: '🟥 서버 연결 종료' });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = AppServerSocketService;
