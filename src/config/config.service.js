require('dotenv').config();

class ConfigService {
  constructor() {
    this.envConfig = process.env;
  }

  _get(key, DEFAULT = null) {
    return this.envConfig[key] || DEFAULT;
  }

  getServerConfig() {
    return {
      server: {
        host: this._get('SERVER_HOST'),
        ws: { namespace: this._get('SERVER_WS_NAMESPACE') },
      },
    };
  }

  getLcuApiConfig() {
    return {
      lcuApi: {
        currentSummoner: this._get('LCU_API_CURRENT_SUMMONER'),
      },
    };
  }

  getLcuWebSocketConfig() {
    return {
      lcuWebSocket: {
        gameflowPhase: this._get('LCU_WS_GAMEFLOW_PHASE'),
      },
    };
  }

  getLcuLiveConfig() {
    return {
      lcuLive: {
        host: this._get('LCU_LIVE_HOST'),
        activePlayerName: this._get('LCU_API_LIVE_ACTIVE_PLAYER_NAME'),
      },
    };
  }

  getRiotApiConfig() {
    return {
      riotApi: {
        asia: {
          host: this._get('RIOT_API_ASIA_HOST'),
          account: {
            v1: {
              riotId: this._get('RIOT_API_ASIA_ACCOUNT_V1_RIOT_ID'),
            },
          },
        },
        appKey: this._get('RIOT_API_APP_KEY'),
      },
    };
  }
}

module.exports = ConfigService;
