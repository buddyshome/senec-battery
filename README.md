# senec-battery

API to read charging level and state from senec battery using lala.cgi

You can try the curl statement to determine if it in gernal works with your senec battery

curl -k -X POST "https://<IP_ADDRESS>/lala.cgi" -H "Content-Type: application/json" -d "{ \"ENERGY\": { \"GUI_HOUSE_POW\": \"\", \"GUI_GRID_POW\": \"\", \"GUI_INVERTER_POWER\": \"\", \"GUI_BAT_DATA_POWER\": \"\", \"GUI_BAT_DATA_FUEL_CHARGE\": \"\", \"STAT_STATE\": \"\", \"STAT_STATE_TEXT\": \"\" }, \"STATISTIC\": { \"LIVE_GRID_IMPORT\": \"\" }, \"PM1OBJ1\": { \"P_AC\": \"\" } }"

Replace the <IP_ADDRESS> with the ip of the senec battery.

## Requirements

Node.js 22, 24 or 26.

## Usage

```ts
import { SenecAPI } from 'senec-battery';

// host, ssl (use HTTPS), sslUnsecure (accept self-signed certificates)
const senec = new SenecAPI('192.168.1.100', true, true);
const response = await senec.fetchDataBuffered();
console.log(response.getBatteryLevel());
```

`fetchDataBuffered()` caches the response for 10 seconds, so polling it often does not overload the battery.

### Logging

Warnings (for example a timed-out request) go to `console` by default. Pass a logger as the fourth argument to send them somewhere else. Any object with a `warn(message)` method works, including Homebridge's `log`:

```ts
const senec = new SenecAPI(host, ssl, sslUnsecure, this.log);
```

## Host

The host must be an IP address or hostname, optionally with a port, for example `192.168.1.100`, `senec.local`, `192.168.1.100:8080` or `[fe80::1]`. Values containing a scheme (`http://`), a path, credentials or other URL parts are rejected with an error when data is fetched.

## Security

- **`sslUnsecure`** turns off certificate validation. Only use it together with `ssl` for the battery's self-signed certificate on your local network.
- Requests go directly to the battery: environment proxy settings (`HTTP_PROXY`/`HTTPS_PROXY`) are ignored and redirects are not followed.
- Responses larger than 64 KB are rejected.

## License

This library is licensed under the **MIT License**. For details, see the [LICENSE](./LICENSE) file.
