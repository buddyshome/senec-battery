const axios = require('axios');
const SenecResponse = require('./senec-response');

class SenecAPI {
  constructor(ipAddress) {
    this.ipAddress = ipAddress;
  }

  async fetchData() {
    try {
      const response = await axios.post(`http://${this.ipAddress}/lala.cgi`, {
        ENERGY: {
          GUI_HOUSE_POW: '',
          GUI_GRID_POW: '',
          GUI_INVERTER_POWER: '',
          GUI_BAT_DATA_POWER: '',
          GUI_BAT_DATA_FUEL_CHARGE: '',
          STAT_STATE: '',
          STAT_STATE_TEXT: '',
        },
        STATISTIC: {
          LIVE_GRID_IMPORT: '',
        },
        PM1OBJ1: {
          P_AC: '',
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'text',
      });

      return new SenecResponse(JSON.parse(response.data));
    } catch (error) {
      throw new Error(`Error fetching data: ${error.message}`);
    }
  }
}

module.exports = SenecAPI;
