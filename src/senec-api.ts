import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { SenecResponse } from './senec-response.js';
import { SenecData } from './senec-data.js';
import { Mutex, MutexInterface, Semaphore, SemaphoreInterface, withTimeout } from 'async-mutex';
import https from 'https';


export class SenecAPI {
  private ipAddress: string;
  private ResponseBuffered!: SenecResponse;
  private ResponseBufferedDateExpire!: Date;
  private mutex: Mutex;
  private ExpSeconds: number = 10;
  private sslUnsecure: boolean;
  private ssl: boolean;

  constructor(ipAddress: string, ssl: boolean = false, sslUnsecure: boolean = false) {
    this.ipAddress = ipAddress;
    this.mutex = new Mutex();
    this.ssl = ssl;
    this.sslUnsecure = sslUnsecure;
  }

  async fetchDataBuffered(): Promise<SenecResponse> {

    // Make sure we do not trigger parallel execution
    const release = await this.mutex.acquire();
    try {

      var lo_currentTime = new Date();

      if (this.ResponseBufferedDateExpire == null ||
        this.ResponseBufferedDateExpire.valueOf() <= lo_currentTime.valueOf()) //millisecond since midnight January 1, 1970 UTC.
      {
        //console.debug("%s - Cache expired have to read from battery", this.ipAddress)
        let lo_currTimein10 = new Date();
        lo_currTimein10.setSeconds(lo_currTimein10.getSeconds() + this.ExpSeconds); //add 10 seconds which will also update the minutes in case neeeded

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

    let httpsAgent = undefined;

    if (this.sslUnsecure && this.ssl) {
      //Allow Unsecure SSL
      httpsAgent = new https.Agent({
        rejectUnauthorized: false
      });
    }



    // Define the Axios request configuration
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'text',
      httpsAgent,  // Add the https agent to the request config
      timeout: 2000, // Set timeout to 2 seconds
    };

    try {
      const response: AxiosResponse<string> = await axios.post(
        `${((this.ssl) ? 'https' : 'http')}://${this.ipAddress}/lala.cgi`,
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
        config  // Pass the config object to the request
      );

      return new SenecResponse((<SenecData>JSON.parse(response.data)));
    } catch (error:any) {
     
      if ( axios.isAxiosError(error) && error.code === 'ECONNABORTED' ) 
      {
        // Handle Axios-specific errors when we run into a timeout
        console.warn(`Request to ${this.ipAddress} timed out. Returning buffered response.`);
        return this.ResponseBuffered; // Return the buffered response if available
      }
      else {
        throw new Error(`Error fetching data: ${(error as Error).message}`);
      }
    }
  }
}

