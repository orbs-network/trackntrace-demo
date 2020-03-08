import {names} from "./names";

export type Stage = 'Factory' | 'Mixing' | 'Distribution' | 'Retail';
export const stages: Stage[] = ['Factory', 'Mixing', 'Distribution', 'Retail'];
export const stagesDisplay: {[stage in Stage]: string} = {
    Factory: 'Factory',
    Mixing: 'Mixing Center',
    Distribution: 'Distribution Center',
    Retail: 'Retail'
}

export interface IRawScanRecord {
    ProductID: string,
    EventTimeUTC: string,
    BusinessParty: string,
    EventTimeUTCMS: number,
    BusinessLocationID: string,
    EventTimeZoneOffsetMS: number
}

const hashCode = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));

export class ScanRecord {
    constructor(public raw: IRawScanRecord) {}

    itemId(): string {
        return this.raw.ProductID;
    }

    timestampInSeconds(): number {
        return this.timestampInMilliseconds() / 1000;
    }

    timestampInMilliseconds(): number {
        return this.raw.EventTimeUTCMS;
    }

    timestampAsDate(): Date {
        return new Date(this.timestampInMilliseconds());
    }

    partner(): string {
        return this.raw.BusinessParty
    }

    stage(): Stage|string {
        return stages.find(stage => this.raw.BusinessLocationID.toLowerCase().replace(/\s/g, "")
            .includes(stage.toLowerCase().replace(/\s/g, ""))) || this.raw.BusinessLocationID;
    }

    recordId(): string {
        // TODO - get from server
        return hashCode(JSON.stringify(this.raw)).toString();
    }

    location(): string {
        return this.raw.BusinessLocationID;
    }

    isOperatorAvailable(): boolean {
        return this.partner().toLowerCase() == 'p&g';
    }

    operatorFullName(): string {
        const h = hashCode(this.recordId());
        const firstName = names[h % names.length];
        const lastName = names[(h+1) % names.length];
        return `${firstName} ${lastName}`;
    }
}
