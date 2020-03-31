import {names} from "./names";

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

const hashCode = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));

export class ScanRecord {
    constructor(public raw: IRawScanRecord) {}

    itemId(): string {
        return this.raw.tagId;
    }

    timestampInSeconds(): number {
        return this.timestampInMilliseconds() / 1000;
    }

    timestampInMilliseconds(): number {
        return this.raw.timestamp * 1000;
    }

    timestampAsDate(): Date {
        return new Date(this.timestampInMilliseconds());
    }

    gatewayId(): string {
        return this.raw.gatewayId;
    }

    eventType(): string {
        return this.raw.eventType;
    }

    eventValue(): string {
        return this.raw.eventValue;
    }

    gatewayAlias(): string {
        return {
            "3c71bf63e190": "Original",
            "GW98f4ab141D14": "P&G Manufacturing",
            "GW984fab141D70": "P&G Truck",
            "GW98f4ab141D38": "Customer DC or P&G DC",
            "GW98f4ab141DF4": "Customer DC or P&G DC Shelf",
            "GW98f4ab141D0C": "P&G Customer Store",
        }[this.raw.gatewayId] || this.raw.gatewayId;
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
