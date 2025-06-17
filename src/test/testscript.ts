import { SenecAPI } from '../senec-api.js';

const senecIpAddress: string = '192.168.3.18';

const senec: SenecAPI = new SenecAPI(senecIpAddress);

(async () => {
  try {
    const response = await senec.fetchDataBuffered();


    console.log('EnergyState:', response.getEnergyState());
    console.log('EnergyStateText:', response.getEnergyStateText());
    console.log('GridPower (KW):',  response.getGridPower() );
    console.log('BatteryLevel %:',  response.getBatteryLevel() );
    console.log('HousePower (KW):',  response.getHousePower() );
    console.log('PV Power (KW):',  response.getPVPower() );



  } catch (error) {
    console.error('Error:', (error as Error).message);
  }
})();
