import {observable} from "mobx";

interface IRawScanRecord {
    "ProductID": string,
    "EventTimeUTC": string,
    "BusinessParty": string,
    "EventTimeUTCMS": number,
    "BusinessLocationID": string,
    "EventTimeZoneOffsetMS": number
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

    stage(): string {
        return 'TODO_' + this.raw.BusinessLocationID + '_TODO'
    }

    recordId(): string {
        // TODO - get from server
        const hashCode = s => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
        return hashCode(JSON.stringify(this.raw));
    }

}

export class RecordStore {

    @observable ready = false;
    @observable err: Error = null;

    @observable records: ScanRecord[] = [];

    constructor(pollingIntervalMs = 500) {
        const f = async () => {
            await this.fetch();
            setTimeout(f, pollingIntervalMs)
        };
        f();
    }

    public async fetch() {
        try {
            const res = await fetch(process.env.REACT_APP_RECORDS_URL || "https://orbs.pg.demo/records");
            const records: IRawScanRecord[] = await res.json();

            if (this.records == null || records.length != this.records.length) {
                this.records = records
                    .filter(r => (r as any).msg != "[object Object]")
                    .filter(r => r.EventTimeUTC != null)
                    .map(raw => new ScanRecord(raw));
                if (!this.ready) {
                    this.ready = true; // don't set anyway because we don't want mobx to react
                }
            }
        } catch (e) {
            this.err = e;
        }
    }
}
