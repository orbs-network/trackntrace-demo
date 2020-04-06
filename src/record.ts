import {names} from "./names";
import {GatewayConfig, LocationCategory} from "./gateway-config";

export type Stage = 'Factory' | 'Mixing' | 'Distribution' | 'Retail';
export const stages: Stage[] = ['Factory', 'Mixing', 'Distribution', 'Retail'];
export const stagesDisplay: {[stage in Stage]: string} = {
    Factory: 'Factory',
    Mixing: 'Mixing Center',
    Distribution: 'Distribution Center',
    Retail: 'Retail'
};

export interface IRawScanRecord {
    tagId: string,
    latitude: string,
    longitude: string,
    eventType: "PRESENCE",
    gatewayId: string,
    timestamp: number,
    eventValue: string
}

export interface IRawScanRecordLowecaseKeys {
    tagid: string,
    latitude: string,
    longitude: string,
    eventtype: "PRESENCE",
    gatewayid: string,
    timestamp: number,
    eventvalue: string
}

const hashCode = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));

export class ScanRecord {
    private rawLowecase: IRawScanRecordLowecaseKeys;
    constructor(public raw: IRawScanRecord, private gatewayConfig: GatewayConfig) {
        this.rawLowecase = {} as IRawScanRecordLowecaseKeys;
        Object.keys(raw).forEach(k => this.rawLowecase[k.toLowerCase()] = raw[k]);
    }

    itemId(): string {
        return this.rawLowecase.tagid;
    }

    timestampInSeconds(): number {
        return this.timestampInMilliseconds() / 1000;
    }

    timestampInMilliseconds(): number {
        return this.rawLowecase.timestamp * 1000;
    }

    timestampAsDate(): Date {
        return new Date(this.timestampInMilliseconds());
    }

    gatewayId(): string {
        return this.rawLowecase.gatewayid;
    }

    eventType(): string {
        return this.rawLowecase.eventtype;
    }

    eventValue(): string {
        return this.rawLowecase.eventvalue;
    }

    gatewayAlias(): string {
        const cfg = this.gatewayConfig.getFor(this.rawLowecase.gatewayid);
        return cfg ? cfg.Alias : this.rawLowecase.gatewayid;
    }

    gatewayLocationCategory(): LocationCategory {
        const cfg = this.gatewayConfig.getFor(this.rawLowecase.gatewayid);
        return cfg ? cfg.LocationCategory : null;
    }

    recordId(): string {
        // TODO - get from server
        return hashCode(JSON.stringify(this.raw)).toString();
    }

    isOperatorAvailable(): boolean {
        // return this.partner().toLowerCase() == 'p&g';
        return false
    }

    operatorFullName(): string {
        const h = hashCode(this.recordId());
        const firstName = names[h % names.length];
        const lastName = names[(h+1) % names.length];
        return `${firstName} ${lastName}`;
    }
}
