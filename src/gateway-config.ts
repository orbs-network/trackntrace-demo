import * as Papa from "papaparse";
import * as _ from "lodash";
import {observable} from "mobx";

declare const AWS: any;

export interface IGatewayConfigRecord {
    ID: string;
    Alias?: string;
    LocationCategory?: string;
    SiteCategory?: string;
    BackgroomGatewayId?: string;
}

export async function loadGatewayConfigRecords(csvS3Key: string): Promise<IGatewayConfigRecord[]> {
    const stripKey = (x): string => x.replace(/\s/g, "").toLowerCase();
    const strip = (x) : string => x == null ? null : x.trim() != "" ? x.trim() : null;

    const r = await (new AWS.S3({accessKeyId: 'AKIA2SZDVCH3YP6KEYUN', secretAccessKey: '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', region:'us-west-2', endpoint:'s3-us-west-2.amazonaws.com'}).getObject({Bucket:'trackntrace-config', Key:csvS3Key})).promise()
    const csvText = r.Body.toString();

    return new Promise<IGatewayConfigRecord[]>((resolve, reject) => {
        Papa.parse(csvText, {
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
                        BackgroomGatewayId: strip(r.backgroomgatewayid)
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
            this.records = await loadGatewayConfigRecords(process.env.REACT_APP_CSV_S3_KEY || "gw-conf.csv");
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
            if (rec.BackgroomGatewayId && this.getFor(rec.BackgroomGatewayId) == null) { throw new Error(`Invalid backgroomGatewayId for gateway ${rec.ID}`); }
        }
    }

    getFor(gatewayId: string): IGatewayConfigRecord {
        return this.configById[gatewayId.toLowerCase()] || defaultConfig(gatewayId);
    }

    all(): IGatewayConfigRecord[] {
        return _.cloneDeep(this.records);
    }

}
