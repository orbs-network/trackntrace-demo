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

    @computed get itemCountByPartner(): {[partnerName: string]: number} {
        return _.chain(this.latestRecordsPerItem)
            .groupBy(r => r.partner())
            .mapValues(recs => recs.length)
            .value()
    }

    @computed get itemCountByStage(): {[partnerName: string]: number} {
        return _.chain(this.latestRecordsPerItem)
            .groupBy(r => r.stage())
            .mapValues(recs => recs.length)
            .value()
    }

    @computed get alerts(): IAlert[] {
        return (this.repeatedScanAlerts as IAlert[])
            .concat(this.tooManyScansAlerts)
            .concat(this.adjacentScansAlert);
    }

    @computed get alertedItems(): string[] {
        return _.uniq(this.alerts.map(a => a.itemId));
    }

    @computed get repeatedScanAlerts(): IRepeatedScanAlert[] {
        const alerts: IRepeatedScanAlert[] = [];
        for (const uid of this.itemUIDs) {
            const seenAt = {};
            const records = this.itemRecordsSortedByTime(uid);
            for (let i = 0; i < records.length; i++) {
                const rec = records[i];
                const loc = rec.location();
                if (seenAt[loc] != null && seenAt[loc] < i - 1) {
                    const prev = records[seenAt[loc]];
                    alerts.push({
                        timestamp: rec.timestampAsDate(),
                        alertType: 'Repeated Scan',
                        itemId: rec.itemId(),
                        location: rec.location(),
                        prevTime: prev.timestampAsDate()
                    });
                    break;
                }
                seenAt[rec.location()] = i;
            }
        }
        return alerts;
    }

    @computed get adjacentScansAlert(): IAdjacentScansAlert[] {
        const alerts: IAdjacentScansAlert[] = [];
        for (const uid of this.itemUIDs) {
            const records = this.itemRecordsSortedByTime(uid);
            for (let i = 1; i < records.length; i++) {
                const rec = records[i];
                const delta = (records[i].timestampInMilliseconds() - records[i - 1].timestampInMilliseconds());
                if (records[i].location() != records[i - 1].location() && delta < AdjacentScansAlertThresholdMs) {
                    alerts.push({
                        timestamp: rec.timestampAsDate(),
                        alertType: 'Adjacent Scans',
                        itemId: rec.itemId(),
                        deltaInMs: delta
                    });
                    break;
                }
            }
        }
        return alerts;
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
