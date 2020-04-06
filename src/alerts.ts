import * as _ from "lodash";

export type AlertType = 'Repeated Scan' | 'Too Many Scans' | 'Adjacent Scans' | 'Inventory Not On Shelf' | 'Backroom Inventory Low' | 'Item Skipped POS' | 'Item Went Dark' | 'Large Quantity Went Dark';
export type AlertCategory = 'OSA' | 'Shrinkage' | 'General';

export interface IAlert {
    timestamp: Date,
    category: AlertCategory,
    alertType: AlertType,
    itemId?: string,
    gatewayId?: string
}

export function alertsByTime(alerts: IAlert[], nBins: number, minBinSize: number): {bins: number[], binSize: number, startTime: number} {
    if (alerts.length == 0) return {bins: [], binSize: 0, startTime: 0};

    const times = alerts.map(a => a.timestamp.getTime());
    const startTime = _.min(times);
    let binSize = (_.max(times) + 1 - startTime) / nBins;
    if (minBinSize > binSize) {
        binSize = minBinSize;
        nBins = Math.floor((_.max(times) + 1 - startTime) / binSize) + 1
    }
    const bins = _.range(nBins).map(() => 0);

    for (const a of alerts) {
        bins[Math.floor((a.timestamp.getTime() - startTime) / binSize)]++;
    }

    return {bins, binSize, startTime};
}

export function alertsInLast(alerts: IAlert[], duration: number): IAlert[] {
    return alerts.filter(a => a.timestamp.getTime() > Date.now() - duration);
}
