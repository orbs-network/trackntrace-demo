import {RecordStore} from "./record-store";
import * as _ from "lodash";
import {computed} from "mobx";
import {ScanRecord} from "./record";

export type AlertType = 'Repeated Scan' | 'Too Many Scans' | 'Adjacent Scans';
export interface IAlert {
    timestamp: Date,
    alertType: AlertType,
    itemId: string,
    // description: string
}

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

    public itemRecords(itemId: string): ScanRecord[] {
        return this.recordsStore.records.filter(r => r.itemId() == itemId);
    }

    public itemRecordsSortedByTime(itemId: string): ScanRecord[] {
        return _.sortBy(this.itemRecords(itemId), r => r.timestampInMilliseconds());
    }

    @computed get itemCountByGateway(): {[partnerName: string]: number} {
        return _.chain(this.latestRecordsPerItem)
            .groupBy(r => r.gatewayId())
            .mapValues(recs => recs.length)
            .value()
    }

    @computed get itemCountByGatewayAlias(): {[gatewayAlias: string]: number} {
        const counts = _.chain(this.latestRecordsPerItem)
            .groupBy(r => r.gatewayAlias())
            .mapValues(recs => recs.length)
            .value();
        const gateways = ["Original",
            "P&G Manufacturing",
            "P&G Truck",
            "Customer DC or P&G DC",
            "Customer DC or P&G DC Shelf",
            "P&G Customer Store"];
        for (const g of gateways) {
            counts[g] = counts[g] || 0;
        }
        return counts;
    }

    @computed get alerts(): IAlert[] {
        return this.tooManyScansAlerts;
    }

    @computed get alertedItems(): string[] {
        return _.uniq(this.alerts.map(a => a.itemId));
    }

    @computed get tooManyScansAlerts(): ITooManyScansAlert[] {
        return this.itemUIDs
            .map(uid => this.itemRecordsSortedByTime(uid))
            .filter(records => records.length > TooManyScansAlertThreshold)
            .map(records => ({
                timestamp: records[TooManyScansAlertThreshold].timestampAsDate(),
                alertType: 'Too Many Scans',
                itemId: records[0].itemId(),
                count: records.length
            }));
    }
}
