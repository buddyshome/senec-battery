"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const senec_response_1 = __importDefault(require("./senec-response"));
class SenecAPI {
    constructor(ipAddress) {
        this.ipAddress = ipAddress;
    }
    fetchData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post(`http://${this.ipAddress}/lala.cgi`, {
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
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    responseType: 'text',
                });
                return new senec_response_1.default(JSON.parse(response.data));
            }
            catch (error) {
                throw new Error(`Error fetching data: ${error.message}`);
            }
        });
    }
}
exports.default = SenecAPI;
//# sourceMappingURL=senec-api.js.map