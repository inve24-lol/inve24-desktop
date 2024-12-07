const { createWebSocketConnection } = require('league-connect');

class LolClientSocketService {
  _webContents;
  _lolClientSocket;

  constructor(webContents) {
    this._webContents = webContents;
    this._lolClientSocket = null;
  }

  async openLolClientSocket() {
    try {
      if (this._lolClientSocket) throw new Error('Conflict');

      this._webContents.send('log', { message: '🟨 롤 클라이언트 찾는중...' });

      this._lolClientSocket = await createWebSocketConnection();

      this._webContents.send('log', { message: '🟩 롤 클라이언트 연결 성공' });

      this._lolClientSocket.on('close', (code) => {
        if (code === 1006) {
          this._lolClientSocket = null;

          this._webContents.send('log', { message: '🟥 롤 클라이언트를 찾을 수 없습니다.' });
        }
      });
    } catch (error) {
      if (error.message === 'Conflict')
        throw new Error('⚠ 롤 클라이언트와 이미 연결되어 있습니다.');
      else {
        throw new Error('⚠ 실행중인 롤 클라이언트를 찾을 수 없습니다.');
      }
    }
  }

  async closeLolClientSocket() {
    try {
      if (!this._lolClientSocket) throw new Error('⚠ 연결된 롤 클라이언트가 없습니다.');

      this._lolClientSocket.close(1000);

      this._lolClientSocket.on('close', (code) => {
        if (code === 1000) {
          this._lolClientSocket = null;

          this._webContents.send('log', { message: '🟥 롤 클라이언트 연결 종료' });
        }
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LolClientSocketService;
