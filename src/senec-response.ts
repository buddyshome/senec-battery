import SenecTranslator from './senec-translator';

class SenecResponse {
  private data: any;
  private SenecTranslator: SenecTranslator;

  constructor(data: any) {
    this.data = data;
    this.SenecTranslator = new SenecTranslator();
  }

  getEnergyData(): any {
    return this.data.ENERGY || {};
  }

  getStatisticData(): any {
    return this.data.STATISTIC || {};
  }

  getPM1OBJ1Data(): any {
    return this.data.PM1OBJ1 || {};
  }

  getEnergyState(): number {
    const tmp = this.data.ENERGY.STAT_STATE.split('_');
    const value = tmp[1];
    const state_int = parseInt(value, 16);
    return state_int;
  }

  getEnergyStateText(): string {
    return this.SenecTranslator.getEnergyStateText(this.getEnergyState());
  }
}

export default SenecResponse;
