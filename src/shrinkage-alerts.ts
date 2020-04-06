import * as _ from "lodash";

import {GatewayConfig} from "./gateway-config";
import {Statistics} from "./statistics";
import {computed} from "mobx";
import {ScanRecord} from "./record";
import {AlertCategory, alertsByTime, alertsInLast, AlertType, IAlert} from "./alerts";

export const GOING_DARK_TIMEOUT = 2*60*60*1000;
export const LARGE_QTY_WENT_DARK_THRESHOLD = 3;

export interface ILargeQuantityWentDarkAlert extends IAlert {
    category: "Shrinkage",
    alertType: "Large Quantity Went Dark",
    quantity: number
}

export class ShrinkageAlerts {

    constructor(private statistics: Statistics, private gatewayConfig: GatewayConfig) {}

    @computed get itemSkippedPOSAlerts(): IAlert[] {
        return this.gatewayConfig.FrontDoors.map(frontDoor => {
            if (!frontDoor.BackroomGatewayId) return null;

            const pos = this.gatewayConfig.getFor(frontDoor.BackroomGatewayId);
            if (!pos) return null;
            if (pos.LocationCategory != "POS") return null;
            if (!pos.BackroomGatewayId) return null;

            const shelf = this.gatewayConfig.getFor(pos.BackroomGatewayId);
            if (!shelf) return null;
            if (shelf.LocationCategory != "Customer Retail Shelf") return null;

            return this.statistics.itemUIDs.map(itemID => {
                const recs = this.statistics.itemRecords(itemID);
                const posRec = recs.find(r => r.gatewayId().toLowerCase() == pos.ID.toLowerCase());
                const frontDoorRec = recs.find(r => r.gatewayId().toLowerCase() == frontDoor.ID.toLowerCase());
                const shelfRec = recs.find(r => r.gatewayId().toLowerCase() == shelf.ID.toLowerCase());

                if (frontDoorRec && shelfRec && !posRec) {
                    return {
                        timestamp: frontDoorRec.timestampAsDate(),
                        category: "Shrinkage",
                        alertType: "Item Skipped POS",
                        itemId: itemID,
                        gatewayId: frontDoor.ID
                    } as IAlert
                }

                return null;
            });
        }).reduce((x, y) => x.concat(y), []).filter(x => x);
    }

    @computed get itemWentDarkAlerts(): IAlert[] {
        return this.gatewayConfig.customerRetailShelves.map(shelf => {
            return this.statistics.itemUIDs.map(itemID => {
                const recs = this.statistics.itemRecords(itemID);
                const shelfRecs = recs.filter(r => r.gatewayId().toLowerCase() == shelf.ID.toLowerCase());
                if (shelfRecs.length > 0) {
                    const posRec = recs.find(r => r.gatewayLocationCategory() == "POS");
                    if (!posRec) {
                        const lastShelfRec = shelfRecs[shelfRecs.length - 1];
                        if (Date.now() - lastShelfRec.timestampInMilliseconds() > GOING_DARK_TIMEOUT) {
                            return {
                                timestamp: new Date(lastShelfRec.timestampInMilliseconds() + GOING_DARK_TIMEOUT),
                                category: "Shrinkage",
                                alertType: "Item Went Dark",
                                itemId: itemID,
                                gatewayId: shelf.ID,
                            } as IAlert
                        }
                    }
                }
                return null;
            });
        }).reduce((x, y) => x.concat(y), []).filter(x => x);
    }

    @computed get largeQuantityWentDarkAlerts(): ILargeQuantityWentDarkAlert[] {
        if (this.itemWentDarkAlerts.length > LARGE_QTY_WENT_DARK_THRESHOLD) {
            const sortedByTime = _.sortBy(this.itemWentDarkAlerts, alert => alert.timestamp.getTime());
            return [
                {
                    timestamp: sortedByTime[LARGE_QTY_WENT_DARK_THRESHOLD - 1].timestamp,
                    category: "Shrinkage",
                    alertType: "Large Quantity Went Dark",
                    quantity: this.itemWentDarkAlerts.length
                }
            ]
        }
        return [];
    }

    @computed get alertedItemsCountLast24Hours(): number {
        const DURATION = 24*60*60*1000;
        return _.uniq(
            alertsInLast(this.itemSkippedPOSAlerts, DURATION)
            .concat(alertsInLast(this.itemWentDarkAlerts, DURATION))
            .map(alert => alert.itemId)
        ).length;
    }

    @computed get alertedItemsCountLast30Days(): number {
        const DURATION = 30*24*60*60*1000;
        return _.uniq(
            alertsInLast(this.itemSkippedPOSAlerts, DURATION)
            .concat(alertsInLast(this.itemWentDarkAlerts, DURATION))
            .map(alert => alert.itemId)
        ).length;
    }

    @computed get alerts(): IAlert[] {
        return this.itemSkippedPOSAlerts.concat(this.itemWentDarkAlerts).concat(this.largeQuantityWentDarkAlerts);
    }

}
