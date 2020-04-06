import {RecordStore} from "./record-store";
import {Statistics} from "./statistics";
import {GatewayConfig} from "./gateway-config";
import {OSAAlerts} from "./osa-alerts";
import {ShrinkageAlerts} from "./shrinkage-alerts";

export interface IStores {
    records: RecordStore;
    statistics: Statistics;
    gatewayConfig: GatewayConfig;
    osaAlerts: OSAAlerts;
    shrinkageAlerts: ShrinkageAlerts;
}

export function createStores(): IStores {
    const gatewayConfig = new GatewayConfig();
    const records = new RecordStore(gatewayConfig);
    const statistics = new Statistics(records);
    const osaAlerts = new OSAAlerts(statistics, gatewayConfig);
    const shrinkageAlerts = new ShrinkageAlerts(statistics, gatewayConfig);
    return {
        records,
        gatewayConfig,
        statistics,
        osaAlerts,
        shrinkageAlerts
    }
}
