import * as _ from "lodash";
import {computed} from "mobx";
import {ScanRecord} from "./record";
import {Statistics} from "./statistics";
import {GatewayConfig} from "./gateway-config";
import {RecordStore} from "./record-store";

export class OSAStats {

    constructor(private gatewayId: string, private records: RecordStore, private statistics: Statistics, private gatewayConfig: GatewayConfig) {}

    @computed get itemCountAtGateway(): number {
        return this.statistics.itemCountByGateway(this.gatewayId);
    }

    @computed get itemCountAtBackroom(): number {
        return this.statistics.itemCountByGateway(this.gatewayConfig.getFor(this.gatewayId).BackroomGatewayId);
    }

    @computed get turnoverTimes(): {[itemId: string]: number} {
        const lastItemScan: {[itemId: string]: ScanRecord} = {};
        const turnoverTimes:  {[itemId: string]: number} = {};

        for (const rec of this.records.records) {
            const prev = lastItemScan[rec.itemId()];
            if (prev && prev.gatewayId().toLowerCase() == this.gatewayId.toLowerCase()) {
                if (rec.gatewayId().toLowerCase() != this.gatewayId.toLowerCase()) {
                    turnoverTimes[rec.itemId()] = rec.timestampInMilliseconds() - prev.timestampInMilliseconds();
                }
            } else {
                lastItemScan[rec.itemId()] = rec;
            }
        }

        return turnoverTimes;
    }

    @computed get avgTurnoverTime(): number {
        const times = this.turnoverTimes;
        return Object.keys(times).length > 0 ? _.mean(_.values(times)) : 0;
    }

    turnoverTimeHistogram(nBins: number): {bins: number[], binSize: number} {
        const times = _.values(this.turnoverTimes);
        const bins = _.range(nBins).map(() => 0);
        const binSize = (_.max(times) + 1) / nBins;

        for (const t of times) {
            bins[Math.floor(t / binSize)]++;
        }

        return {bins, binSize};
    }

    itemCountHistory(gatewayId: string): Array<{time: number, count: number}> {
        const itemLoc: {[itemId: string]: string} = {};
        const history: Array<{time: number, count: number}> = [];
        let count = 0;

        for (const rec of this.records.records) {
            const prev = itemLoc[rec.itemId()];
            const current = rec.gatewayId();
            if (prev && prev.toLowerCase() == gatewayId.toLowerCase()) {
                if (current.toLowerCase() != this.gatewayId.toLowerCase()) {
                    count--;
                    history.push({time: rec.timestampInMilliseconds(), count});
                }
            } else if (current.toLowerCase() == this.gatewayId.toLowerCase()){
                count++;
                history.push({time: rec.timestampInMilliseconds(), count});
            }
            itemLoc[rec.itemId()] = rec.gatewayId();
        }

        return history;
    }

    @computed get gatewayItemCountHistory(): Array<{time: number, count: number}> {
        return this.itemCountHistory(this.gatewayId);
    }

    @computed get backroomItemCountHistory(): Array<{time: number, count: number}> {
        const backroomId = this.gatewayConfig.getFor(this.gatewayId).BackroomGatewayId;
        if (backroomId) {
            return this.itemCountHistory(backroomId);
        } else {
            return [];
        }
    }
}


