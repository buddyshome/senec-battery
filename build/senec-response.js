"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const senec_translator_1 = __importDefault(require("./senec-translator"));
class SenecResponse {
    constructor(data) {
        this.data = data;
        this.SenecTranslator = new senec_translator_1.default();
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
    getEnergyState() {
        const tmp = this.data.ENERGY.STAT_STATE.split('_');
        const value = tmp[1];
        const state_int = parseInt(value, 16);
        return state_int;
    }
    getEnergyStateText() {
        return this.SenecTranslator.getEnergyStateText(this.getEnergyState());
    }
}
exports.default = SenecResponse;
//# sourceMappingURL=senec-response.js.map