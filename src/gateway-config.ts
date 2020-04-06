import * as Papa from "papaparse";
import * as _ from "lodash";
import {observable} from "mobx";

export interface IGatewayConfigRecord {
    ID: string;
    Alias?: string;
    LocationCategory?: string;
    SiteCategory?: string;
    BackroomGatewayId?: string;
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
                        LocationCategory: strip(r.locationcategory),
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
            this.records = await loadGatewayConfigRecords(process.env.REACT_APP_CSV_URL || "https://trackntrace-config.s3.amazonaws.com/gw-conf.csv?AWSAccessKeyId=AKIA2SZDVCH33R4YMMVC&Signature=4uE4VaePWxQg3nOR%2Ff%2B5NJzhAUs%3D&Expires=1901521907");
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
        }
    }

    private postvalidateConfig() {
        for (const rec of this.records) {
            if (this.getFor(rec.ID) != rec) { throw new Error(`Multiple gateways with same ID: ${rec.ID}`); }
            if (rec.BackroomGatewayId && this.getFor(rec.BackroomGatewayId) == null) { throw new Error(`Invalid backroomGatewayId for gateway ${rec.ID}`); }
        }
    }

    getFor(gatewayId: string): IGatewayConfigRecord {
        return this.configById[gatewayId.toLowerCase()] || defaultConfig(gatewayId);
    }

    all(): IGatewayConfigRecord[] {
        return _.cloneDeep(this.records);
    }

}
