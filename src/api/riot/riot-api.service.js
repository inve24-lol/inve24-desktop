const axios = require('axios');

class RiotApiService {
  _webContents;
  _config;

  constructor(webContents, config) {
    this._webContents = webContents;
    this._config = config;
  }

  async fetchRiotAccount(gameName, tagLine) {
    try {
      const { riotApi } = this._config.getRiotApiConfig();

      const { data } = await axios.get(
        `${riotApi.asia.host}/${riotApi.asia.account.v1.riotId}/${gameName}/${tagLine}?api_key=${riotApi.appKey}`,
      );

      return data;
    } catch (error) {
      throw new Error('⚠ 소환사 정보 조회 RIOT API 요청에 실패하였습니다.');
    }
  }
}

module.exports = RiotApiService;
