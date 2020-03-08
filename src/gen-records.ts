import * as _ from "lodash";
import * as fs from "fs";
import {IRawScanRecord, stages} from "./record";

const hashCode = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));
const partners = ['Amazon','Amazon',
    'P&G','P&G','P&G',
    'FedEx',
    'DHL'];

export function generateRecords(nProducts: number): IRawScanRecord[] {
    let records: IRawScanRecord[] = [];
    _.range(nProducts).forEach(() => {
        const nRecs = _.sample([1,1,1,2,2,3,4,4]);
        const timestamps = _.sortBy(_.range(nRecs+20).map(() => new Date(Math.floor(Date.now() - 365*24*60*60*1000 * Math.random())).getTime()));
        const pid = hashCode(Math.random().toString()).toString();
        let pRecords = [];
        _.range(nRecs).forEach(i => {
            const timestamp = timestamps[i];
            pRecords.push({
                ProductID: pid,
                EventTimeUTC: new Date(timestamp).toString(),
                BusinessParty: _.sample(partners),
                EventTimeUTCMS: timestamp,
                BusinessLocationID: stages[i],
                EventTimeZoneOffsetMS: 0
            })
        });
        if (Math.random() < 0.1) {
            const r = Math.random();
            if (r < 0.33) {
                // repeated
                const timestamp = timestamps[pRecords.length];
                const newRec = {
                    ..._.sample(pRecords),
                    EventTimeUTC: new Date(timestamp).toString(),
                    EventTimeUTCMS: timestamp,
                };
                pRecords.push(newRec);
            } else if (r < 0.66) {
                // too many
                _.range(10 + Math.ceil(Math.random() * 3)).forEach(() => {
                    pRecords.push({
                        ...pRecords[pRecords.length - 1]
                    });
                });
            } else {
                // adjacent
                const timestamp = timestamps[pRecords.length - 1] + (5 + Math.floor(10*Math.random()))*60*1000;
                const newRec = {
                    ..._.sample(pRecords),
                    EventTimeUTC: new Date(timestamp).toString(),
                    EventTimeUTCMS: timestamp,
                    BusinessLocationID: stages[pRecords.length % stages.length] + '_A'
                };
                pRecords.push(newRec);
            }

        }
        records = records.concat(pRecords);
    });
    return records;
}

const records = generateRecords(Math.ceil(1000+Math.random()*1000));
fs.writeFileSync('./public/generated_records.json', JSON.stringify(records, null, 2));
