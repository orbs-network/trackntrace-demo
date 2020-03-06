import {RecordStore} from "./record-store";
import {Statistics} from "./statistics";

export interface IStores {
    records: RecordStore;
    statistics: Statistics;
}

export function createStores(): IStores {
    const records = new RecordStore();
    return {
        records,
        statistics: new Statistics(records)
    }
}
