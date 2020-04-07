import * as Papa from "papaparse";
import * as _ from "lodash";
import {computed, observable} from "mobx";

export type LocationCategory = "Truck" | "Customer DC Shelf" | "Customer Backroom" | "Customer Retail Shelf" | "POS" | "Front Door" | string;
export const LocationCategories: LocationCategory[]  = ["Truck", "Customer DC Shelf", "Customer Backroom", "Customer Retail Shelf", "POS", "Front Door"];

export interface IGatewayConfigRecord {
    ID: string;
    Alias?: string;
    LocationCategory?: LocationCategory;
    SiteCategory?: string;
    BackroomGatewayId?: string;
}

function findLocationCategory(cat: string): LocationCategory {
    if (!cat) {
        return cat;
    }
    return LocationCategories.find(x => x.replace(/\s/g, "").toLowerCase() == cat.replace(/\s/g, "").toLowerCase()) || cat;
}

export async function loadGatewayConfigRecords(url: string): Promise<IGatewayConfigRecord[]> {
    const stripKey = (x): string => x.replace(/\s/g, "").toLowerCase();
    const strip = (x) : string => x == null ? null : x.trim() != "" ? x.trim() : null;

    return new Promise<IGatewayConfigRecord[]>((resolve, reject) => {
        Papa.parse(url, {
            download: true,
            header: true,
            error: (err) => reject(err),
            complete: (results) => {
                resolve(results.data
                    .filter(r => Object.keys(r).filter(x => strip(r[x]) != null).length > 0)
                    .map(r => {
                        Object.keys(r).forEach(k => {
                            const newK = stripKey(k);
                            if (newK == "") {
                                delete r[k];
                            } else {
                                r[newK] = r[k];
                            }
                        });
                        return r
                    })
                    .map(r => ({
                        ID: strip(r.id),
                        Alias: strip(r.alias),
                        LocationCategory: findLocationCategory(strip(r.locationcategory)),
                        SiteCategory: strip(r.sitecategory),
                        BackroomGatewayId: strip(r.backroomgatewayid)
                    }))
                );
            }
        })
    });
}

function defaultConfig(gatewayId: string): IGatewayConfigRecord {
    return {ID: gatewayId}
}

export class GatewayConfig {

    @observable ready: boolean;
    @observable err: Error;

    private records: IGatewayConfigRecord[];
    private configById: {[id: string]: IGatewayConfigRecord} = {};

    constructor() {
        this.init();
    }

    private async init() {
        try {
            this.records = await loadGatewayConfigRecords(process.env.REACT_APP_GATEWAY_CONFIG_URL || "https://trackntrace-config.s3.amazonaws.com/gw-conf.csv?AWSAccessKeyId=AKIA2SZDVCH33R4YMMVC&Signature=4uE4VaePWxQg3nOR%2Ff%2B5NJzhAUs%3D&Expires=1901521907");
            this.prevalidateConfig();
            for (const rec of this.records) {
                this.configById[rec.ID.toLowerCase()] = rec;
            }
            this.postvalidateConfig();
            this.ready = true;
        } catch (e) {
            this.err = e;
        }
    }

    private prevalidateConfig() {
        for (const rec of this.records) {
            if (rec.ID == null) { throw new Error(`Invalid gateway config: missing gateway ID`); }
            // if (rec.LocationCategory && LocationCategories.indexOf(rec.LocationCategory) == -1) { throw new Error(`Invalid gateway location category for ${rec.ID}: provided is ${rec.LocationCategory}, allowed values are ${LocationCategories.join(',')}`); }
        }
    }

    private postvalidateConfig() {
        for (const rec of this.records) {
            if (this.configById[rec.ID.toLowerCase()] != rec) { throw new Error(`Multiple gateways with same ID: ${rec.ID}`); }
            if (rec.BackroomGatewayId && this.getFor(rec.BackroomGatewayId) == null) { throw new Error(`Invalid backroomGatewayId for gateway ${rec.ID}`); }
        }
    }

    getFor(gatewayId: string): IGatewayConfigRecord {
        return _.cloneDeep(this.configById[gatewayId.toLowerCase()]);
    }

    all(): IGatewayConfigRecord[] {
        return _.cloneDeep(this.records);
    }

    gatewayImage(gatewayId: string): string {
        const cfg = this.getFor(gatewayId);
        const key: string = ((cfg && cfg.LocationCategory) || gatewayId).toLowerCase();

        return process.env.REACT_APP_BASE_URL + ({
            ["3c71bf63e190".toLowerCase()]: '/mixingcenter.svg',
            ["GW98f4ab141D14".toLowerCase()]: '/factory.svg',
            ["GW984fab141D70".toLowerCase()]: '/truck.svg', //"P&G Truck",
            ["GW98f4ab141D70".toLowerCase()]: '/truck.svg', //"P&G Truck",
            ["GW98f4ab141D38".toLowerCase()]: '/distributioncenter.svg',
            ["GW98f4ab141DF4".toLowerCase()]: '/inventory.svg', //"Customer DC or P&G DC Shelf",
            ["GW98f4ab141D0C".toLowerCase()]: '/retailstorage.svg',
            ["Truck".toLowerCase()]: '/truck.svg',
            ["Customer DC Shelf".toLowerCase()]: '/inventory.svg',
            ["Customer Backroom".toLowerCase()]: '/retailstorage.svg',
            ["Customer Retail Shelf".toLowerCase()]: "/inventory.svg",
            ["POS".toLowerCase()]: "/distributioncenter.svg",
            ["Front Door".toLowerCase()]: "/mixingcenter.svg",
            ["Original".toLowerCase()]:  '/mixingcenter.svg',
            ["P&G Manufacturing".toLowerCase()]:  '/factory.svg',
            ["P&G Truck".toLowerCase()]:  '/truck.svg', //"P&G Truck",
            ["Customer DC or P&G DC".toLowerCase()]:  '/distributioncenter.svg',
            ["Customer DC or P&G DC Shelf".toLowerCase()]:  '/inventory.svg', //"Customer DC or P&G DC Shelf",
            ["P&G Customer Store".toLowerCase()]:  '/retailstorage.svg',
        }[key] || '/mixingcenter.svg');
    }

    @computed get customerBackrooms(): IGatewayConfigRecord[] {
        return this.all().filter(c => c.LocationCategory == "Customer Backroom");
    }

    @computed get customerRetailShelves(): IGatewayConfigRecord[] {
        return this.all().filter(c => c.LocationCategory == "Customer Retail Shelf");
    }

    @computed get POSes(): IGatewayConfigRecord[] {
        return this.all().filter(c => c.LocationCategory == "POS");
    }

    @computed get FrontDoors(): IGatewayConfigRecord[] {
        return this.all().filter(c => c.LocationCategory == "Front Door");
    }
}
