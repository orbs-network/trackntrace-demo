import {RecordStore} from "./record-store";
import {Statistics} from "./statistics";
import {GatewayConfig} from "./gateway-config";

export interface IStores {
    records: RecordStore;
    statistics: Statistics;
    gatewayConfig: GatewayConfig;
}

export function createStores(): IStores {
    const gatewayConfig = new GatewayConfig();
    const records = new RecordStore(gatewayConfig);
    return {
        records,
        gatewayConfig,
        statistics: new Statistics(records),
    }
}
