const { authenticate, createHttp1Request } = require('league-connect');

class LcuApiService {
  _webContents;
  _config;

  constructor(webContents, config) {
    this._webContents = webContents;
    this._config = config;
  }

  async fetchCurrentSummoner() {
    try {
      const credentials = await authenticate();

      const { lcuApi } = this._config.getLcuApiConfig();

      const response = await createHttp1Request(
        {
          method: 'GET',
          url: lcuApi.currentSummoner,
        },
        credentials,
      );

      return response.json();
    } catch (error) {
      throw new Error('⚠ 소환사 정보 조회 LCU API 요청에 실패하였습니다.');
    }
  }
}

module.exports = LcuApiService;
