import SenecAPI from '../senec-api';

const senecIpAddress: string = '192.168.3.18';

const senec: SenecAPI = new SenecAPI(senecIpAddress);

(async () => {
  try {
    const response = await senec.fetchData();


    console.log('EnergyState:', response.getEnergyState());
    console.log('EnergyStateText:', response.getEnergyStateText());
    console.log('GridPower (W):',  response.getGridPower() );
    console.log('BatteryLevel %:',  response.getBatteryLevel() );
    console.log('HousePower (W):',  response.getHousePower() );
    console.log('PV Power (W):',  response.getPVPower() );



  } catch (error) {
    console.error('Error:', (error as Error).message);
  }
})();
