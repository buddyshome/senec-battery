import axios, { AxiosResponse } from 'axios';
import { SenecResponse } from './senec-response';
import { SenecData } from './senec-data';
import { Mutex, MutexInterface, Semaphore, SemaphoreInterface, withTimeout } from 'async-mutex';


export class SenecAPI {
  private ipAddress: string;
  private ResponseBuffered!: SenecResponse;
  private ResponseBufferedDateExpire!: Date;
  private mutex: Mutex;
  private ExpMinutes: number = 10;

  constructor(ipAddress: string) {
    this.ipAddress = ipAddress;
    this.mutex = new Mutex();

  }

  async fetchDataBuffered(): Promise<SenecResponse> {

    // Make sure we do not trigger parallel execution
    const release = await this.mutex.acquire();
    try {

      var lo_currentTime = new Date();

      if (this.ResponseBufferedDateExpire == null ||
        this.ResponseBufferedDateExpire.valueOf() <= lo_currentTime.valueOf()) //millisecond since midnight January 1, 1970 UTC.
      {
        console.debug("%s - Cache expired have to read from battery", this.ipAddress)
        let lo_currTimein10 = new Date();
        lo_currTimein10.setMinutes(lo_currTimein10.getMinutes() + this.ExpMinutes); //add 10 minutes

        this.ResponseBuffered = await this.fetchData();
        this.ResponseBufferedDateExpire = lo_currTimein10;
      }
      release();
      return this.ResponseBuffered;

    } catch (e) {
      release();
      throw e;
    }
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

      return new SenecResponse((<SenecData>JSON.parse(response.data)));
    } catch (error) {
      throw new Error(`Error fetching data: ${(error as Error).message}`);
    }
  }
}

