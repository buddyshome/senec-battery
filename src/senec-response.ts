import { SenecTranslator } from './senec-translator';
import { SenecData } from './senec-data';

export class SenecResponse {
    private data: SenecData;
    private SenecTranslator: SenecTranslator;

    constructor(data: SenecData) {
        this.data = data;
        this.SenecTranslator = new SenecTranslator();
    }

    private HexToInt(sHex: string): number {
        sHex = sHex.replace('fl_', '');
        var int = parseInt(sHex, 16);
        if (int > 0 || int < 0) {
            var sign = (int >>> 31) ? -1 : 1;
            var exp = (int >>> 23 & 0xff) - 127;
            var mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
            var float32 = 0
            for (let i = 0; i < mantissa.length; i += 1) 
            { float32 += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0; exp-- }
            
            var fullfloat = float32 * sign;
            return Math.round(fullfloat);
        } else return 0
    }

    private Round(n : number, dp : number ) : number
    {   
        const h = +('1'.padEnd(dp + 1, '0')) // 10 or 100 or 1000 or etc
        return Math.round(n * h) / h;
    }

    private ConvertWatt2KW ( iv_power : number ) : number 
    {
        let lv_kw = iv_power / 1000;
        return this.Round( lv_kw, 3 );
    }

    getGridPower(): number {
        return this.ConvertWatt2KW( this.HexToInt( this.data.ENERGY.GUI_GRID_POW ) );
    }
    getHousePower() : number{
        return  this.ConvertWatt2KW( this.HexToInt( this.data.ENERGY.GUI_HOUSE_POW ) );
    }
    getPVPower() : number {
        return  this.ConvertWatt2KW( this.HexToInt( this.data.ENERGY.GUI_INVERTER_POWER )); 
    }
    /**
     * Determines the Battery Level in Percentage
     * @returns Percentage
     */
    getBatteryLevel() : number{
        return this.HexToInt( this.data.ENERGY.GUI_BAT_DATA_FUEL_CHARGE ); 
    }
    getBatteryChargingPower() : number{
        return this.ConvertWatt2KW( this.HexToInt( this.data.ENERGY.GUI_BAT_DATA_POWER ) ); 
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

