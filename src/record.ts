export type Stage = 'Factory' | 'Mixing Center' | 'Distribution Center' | 'Retail Storage';
export const stages: Stage[] = ['Factory', 'Mixing Center', 'Distribution Center', 'Retail Storage'];

export interface IRawScanRecord {
    ProductID: string,
    EventTimeUTC: string,
    BusinessParty: string,
    EventTimeUTCMS: number,
    BusinessLocationID: string,
    EventTimeZoneOffsetMS: number
}

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
        const hashCode = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));
        return hashCode(JSON.stringify(this.raw)).toString();
    }

    location(): string {
        return this.raw.BusinessLocationID;
    }
}
