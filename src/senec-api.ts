import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { SenecResponse } from './senec-response.js';
import { SenecData } from './senec-data.js';
import { Mutex } from 'async-mutex';
import https from 'https';

// Hostname / IPv4 (optionally with port) or bracketed IPv6 (optionally with port).
// Rejects anything that could alter the request URL (paths, queries, credentials, schemes).
const HOST_PATTERN = /^(?:[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?|\[[0-9A-Fa-f:.]+\])(?::\d{1,5})?$/;

// The Senec response is a few hundred bytes; cap it to avoid memory exhaustion by a misbehaving host.
const MAX_RESPONSE_BYTES = 64 * 1024;

/**
 * Minimal logger interface. Homebridge's `Logging` (the `log` passed to plugins)
 * and `console` both satisfy it, so either can be passed to SenecAPI.
 */
export interface SenecLogger {
  warn(message: string, ...parameters: any[]): void;
}

export class SenecAPI {
  private ipAddress: string;
  private ResponseBuffered!: SenecResponse;
  private ResponseBufferedDateExpire!: Date;
  private mutex: Mutex;
  private ExpSeconds: number = 10;
  private sslUnsecure: boolean;
  private ssl: boolean;
  private httpsAgent?: https.Agent;
  private log: SenecLogger;

  /**
   * @param ipAddress IP address or hostname of the Senec battery, optionally with port
   * @param ssl Use HTTPS
   * @param sslUnsecure Accept self-signed certificates (only together with ssl)
   * @param logger Optional logger, e.g. Homebridge's `log`. Defaults to `console`.
   */
  constructor(ipAddress: string, ssl: boolean = false, sslUnsecure: boolean = false, logger: SenecLogger = console) {
    this.ipAddress = (ipAddress ?? '').trim();
    this.log = logger;
    this.mutex = new Mutex();
    this.ssl = ssl;
    this.sslUnsecure = sslUnsecure;

    if (this.ssl && this.sslUnsecure) {
      // Explicit opt-in: accept self-signed certificates of the Senec device
      this.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    }
  }

  async fetchDataBuffered(): Promise<SenecResponse> {

    // Make sure we do not trigger parallel execution
    const release = await this.mutex.acquire();
    try {

      const lo_currentTime = new Date();

      if (this.ResponseBufferedDateExpire == null ||
        this.ResponseBufferedDateExpire.valueOf() <= lo_currentTime.valueOf()) //millisecond since midnight January 1, 1970 UTC.
      {
        const lo_currTimein10 = new Date();
        lo_currTimein10.setSeconds(lo_currTimein10.getSeconds() + this.ExpSeconds); //add 10 seconds which will also update the minutes in case neeeded

        this.ResponseBuffered = await this.fetchData();
        this.ResponseBufferedDateExpire = lo_currTimein10;
      }
      return this.ResponseBuffered;

    } finally {
      release();
    }
  }

  async fetchData(): Promise<SenecResponse> {

    if (!HOST_PATTERN.test(this.ipAddress)) {
      throw new Error(`Invalid Senec host "${this.ipAddress}". Use an IP address or hostname, optionally with a port (e.g. 192.168.1.100 or 192.168.1.100:8080).`);
    }

    // Define the Axios request configuration
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'text',
      httpsAgent: this.httpsAgent,
      timeout: 2000, // Set timeout to 2 seconds
      maxRedirects: 0, // The Senec device never redirects; do not follow redirects to other hosts
      maxContentLength: MAX_RESPONSE_BYTES,
      maxBodyLength: MAX_RESPONSE_BYTES,
      proxy: false, // Local device: never route through HTTP(S)_PROXY environment settings
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
          TEMPMEASURE: {
            BATTERY_TEMP: '',
            CASE_TEMP: '',
            MCU_TEMP: '',
            TEMP_DATA_COLLECTED: '',
          }
        },
        config  // Pass the config object to the request
      );

      return new SenecResponse(this.parseResponse(response.data));
    } catch (error: unknown) {

      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED' && this.ResponseBuffered) {
        // Handle Axios-specific errors when we run into a timeout
        this.log.warn(`Request to ${this.ipAddress} timed out. Returning buffered response.`);
        return this.ResponseBuffered; // Return the buffered response if available
      }
      throw new Error(`Error fetching data: ${(error as Error).message}`);
    }
  }

  private parseResponse(raw: string): SenecData {
    const data = JSON.parse(raw);
    if (typeof data !== 'object' || data === null ||
      typeof data.ENERGY !== 'object' || data.ENERGY === null ||
      typeof data.TEMPMEASURE !== 'object' || data.TEMPMEASURE === null) {
      throw new Error('Unexpected response format from Senec device');
    }
    return <SenecData>data;
  }
}
