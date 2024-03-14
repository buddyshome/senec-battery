import axios, { AxiosResponse } from 'axios';
import { SenecResponse } from './senec-response';

interface SenecData {
  ENERGY: {
    GUI_HOUSE_POW: string;
    GUI_GRID_POW: string;
    GUI_INVERTER_POWER: string;
    GUI_BAT_DATA_POWER: string;
    GUI_BAT_DATA_FUEL_CHARGE: string;
    STAT_STATE: string;
    STAT_STATE_TEXT: string;
  };
  STATISTIC: {
    LIVE_GRID_IMPORT: string;
  };
  PM1OBJ1: {
    P_AC: string;
  };
}

export class SenecAPI {
  private ipAddress: string;

  constructor(ipAddress: string) {
    this.ipAddress = ipAddress;
  }

  async fetchData(): Promise<SenecResponse> {
    try {
      const response: AxiosResponse<string> = await axios.post(
        `http://${this.ipAddress}/lala.cgi`,
        {
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
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'text',
        }
      );

      return new SenecResponse(JSON.parse(response.data));
    } catch (error) {
      throw new Error(`Error fetching data: ${(error as Error).message}`);
    }
  }
}

