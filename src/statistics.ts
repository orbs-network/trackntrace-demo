import {RecordStore} from "./record-store";
import * as _ from "lodash";
import {computed} from "mobx";
import {ScanRecord} from "./record";

export interface IAlert {
    timestamp: Date,
    itemId: string,
    description: string
}

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
        return [{
          timestamp: new Date(),
          description: 'TODO description',
          itemId: 'TODO item id'
        }]
    }
}
