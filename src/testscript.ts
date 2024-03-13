import SenecAPI from './senec-api';

const senecIpAddress: string = 'senec-master.linkzuhause.de';

const senec: SenecAPI = new SenecAPI(senecIpAddress);

(async () => {
  try {
    const response = await senec.fetchData();
    const energyData = response.getEnergyData();
    const statisticData = response.getStatisticData();
    const pm1obj1Data = response.getPM1OBJ1Data();
    const state = response.getEnergyState();
    const statetext = response.getEnergyStateText();

    console.log('Energy Data:', energyData);
    console.log('Statistic Data:', statisticData);
    console.log('PM1OBJ1 Data:', pm1obj1Data);
    console.log('EnergyState:', state);
    console.log('EnergyStateText:', statetext);
  } catch (error) {
    console.error('Error:', (error as Error).message);
  }
})();
