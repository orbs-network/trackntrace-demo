import {Statistics} from "./statistics";
import {computed} from "mobx";
import {AlertType, IAlert} from "./alerts";
import {GatewayConfig} from "./gateway-config";

export class OSAAlerts {

    constructor(private statistics: Statistics, private gatewayConfig: GatewayConfig) {}

    @computed get inventoryNotOnShelfAlerts(): IAlert[] {
        return this.gatewayConfig.customerRetailShelves.map(shelf => {
            if (!shelf.BackroomGatewayId) return;

            const backroom = this.gatewayConfig.getFor(shelf.BackroomGatewayId);
            const onShelf = this.statistics.itemCountByGateway(shelf.ID);
            if (backroom && onShelf < 3) {
                const inBackroom = this.statistics.itemCountByGateway(backroom.ID);
                if (inBackroom >= 1) {
                    return {
                        timestamp: new Date(),
                        category: 'OSA',
                        alertType: "Inventory Not On Shelf",
                        gatewayId: shelf.ID
                    } as IAlert;
                }
            }
            return null;
        }).filter(x => x != null);
    }

    @computed get backroomInventoryLowAlerts(): IAlert[] {
        return this.gatewayConfig.customerBackrooms.map(backroom => {
            const inBackroom = this.statistics.itemCountByGateway(backroom.ID);
            if (inBackroom == 0) {
                return {
                    timestamp: new Date(),
                    category: "OSA",
                    alertType: "Backroom Inventory Low",
                    gatewayId: backroom.ID,
                } as IAlert;
            }
            return null;
        }).filter(x => x);
    }

    @computed get alerts(): IAlert[] {
        return this.inventoryNotOnShelfAlerts.concat(this.backroomInventoryLowAlerts);
    }

}
