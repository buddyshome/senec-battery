const SenecAPI = require('./senec-api');

const senecIpAddress = 'senec-master.linkzuhause.de';

const senec = new SenecAPI(senecIpAddress);

(async () => {
  try {
    
    const data = await senec.fetchData();
    console.log('Battery Data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await senec.logout();
  }
})();