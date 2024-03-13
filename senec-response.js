const SenecTranslator = require('./senec-translator');
class SenecResponse {
    constructor(data) {
      this.data = data;
      this.SenecTranslator = new SenecTranslator();
    }
  
    getEnergyData() {
      return this.data.ENERGY || {};
    }
  
    getStatisticData() {
      return this.data.STATISTIC || {};
    }
  
    getPM1OBJ1Data() {
      return this.data.PM1OBJ1 || {};
    }

    getEnergyState()
    {
        let tmp = this.data.ENERGY.STAT_STATE.split('_');
        let value = tmp[1];
        let state_int = parseInt(value, 16);
        return state_int;
    }

    getEnergyStateText(){
        
        return this.SenecTranslator.getEnergyStateText( this.getEnergyState() );
    }

  }
  
  module.exports = SenecResponse;
  