import {RecordStore} from "./record-store";
import * as _ from "lodash";
import {computed} from "mobx";
import {ScanRecord} from "./record";
import {IAlert} from "./alerts";

export interface IRepeatedScanAlert extends IAlert {
    location: string,
    prevTime: Date
}

export interface ITooManyScansAlert extends IAlert {
    count: number
}
export const TooManyScansAlertThreshold = 10;

export interface IAdjacentScansAlert extends IAlert {
    deltaInMs: number
}
export const AdjacentScansAlertThresholdMs = 15 * 60 * 1000;

export class Statistics {

    constructor(public recordsStore: RecordStore) {}

    @computed get avgRecordsPerItem(): number {
        return _.chain(this.recordsStore.records)
            .groupBy(r => r.itemId())
            .values()
            .map((pRecs: ScanRecord[]) => pRecs.length)
            .mean()
            .value() || 0
    }

    @computed get avgPiplineTimePerItemInDays(): number {
        return this.avgPiplineTimePerItemInSeconds / 60 / 60 / 24;
    }

    @computed get avgPiplineTimePerItemInSeconds(): number {
        const now = Date.now() / 1000;
        return _.chain(this.recordsStore.records)
            .groupBy(r => r.itemId())
            .mapValues((recs: ScanRecord[]) => now - _.min(recs.map(r => r.timestampInSeconds())))
            .map(n => Math.max(n, 0))
            .mean()
            .value() || 0;
    }

    itemPipelineTimeInSeconds(item: string): number {
        const now = Date.now() / 1000;
        return now - _.min(this.itemRecords(item).map(r => r.timestampInSeconds()));
    }

    @computed get itemUIDs(): string[] {
        return _.chain(this.recordsStore.records)
            .map(r => r.itemId())
            .uniq()
            .value();
    }

    @computed get latestRecordsPerItem(): ScanRecord[] {
        return _.chain(this.recordsStore.records)
            .groupBy(r => r.itemId())
            .mapValues((recs: ScanRecord[]) => _.maxBy(recs, (r: ScanRecord) => r.timestampInSeconds()))
            .values()
            .value()
    }

    @computed get _itemRecords(): {[itemId: string]: ScanRecord[]} {
        const itemRecords: {[itemId: string]: ScanRecord[]} = {};
        for (const rec of this.recordsStore.records) {
            itemRecords[rec.itemId()] = itemRecords[rec.itemId()] || [];
            itemRecords[rec.itemId()].push(rec);
        }
        return itemRecords;
    }

    public itemRecords(itemId: string): ScanRecord[] {
        return this._itemRecords[itemId] || [];
    }

    public itemRecordsSortedByTime(itemId: string): ScanRecord[] {
        return _.sortBy(this.itemRecords(itemId), r => r.timestampInMilliseconds());
    }

    @computed get _itemCountByGateway(): {[gatewayId: string]: number} {
        return _.chain(this.latestRecordsPerItem)
            .groupBy(r => r.gatewayId().toLowerCase())
            .mapValues(recs => recs.length)
            .value();
    }

    itemCountByGateway(gatewayId: string): number {
        return this._itemCountByGateway[gatewayId.toLowerCase()] || 0;
    }

    @computed get alerts(): IAlert[] {
        return [];
    }

    @computed get alertedItems(): string[] {
        return _.uniq(this.alerts.map(a => a.itemId));
    }

}
