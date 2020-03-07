import {observable} from "mobx";
import {IRawScanRecord, ScanRecord} from "./record";

export class RecordStore {

    @observable ready = false;
    @observable err: Error = null;

    @observable records: ScanRecord[] = [];

    constructor(pollingIntervalMs = 500) {
        const f = async () => {
            await this.fetch();
            setTimeout(f, pollingIntervalMs)
        };
        setTimeout(() => f(), 1500);
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
