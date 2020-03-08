import * as _ from "lodash";
import * as fs from "fs";
import {IRawScanRecord, stages} from "./record";

const hashCode = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));
const partners = ['Amazon','Amazon',
    'P&G','P&G','P&G',
    'FedEx',
    'DHL'];

const _stages = _.shuffle(stages);
for (let i = 0; i < stages.length; i++) {
    _.times(i, () => _stages.push(_stages[i]));
}

export function generateRecords(nProducts: number, nRecordsPerProduct: number): IRawScanRecord[] {
    const records: IRawScanRecord[] = [];
    _.range(nProducts).forEach(() => {
        const nRecs = Math.ceil(nRecordsPerProduct/2 + Math.random()*nRecordsPerProduct);
        const timestamps = _.sortBy(_.range(nRecs).map(() => new Date(Math.floor(Date.now() - 7*24*60*60*1000 * Math.random())).getTime()));
        const pid = hashCode(Math.random().toString()).toString();
        _.range(nRecs).forEach(i => {
            const timestamp = timestamps[i];
            records.push({
                ProductID: pid,
                EventTimeUTC: new Date(timestamp).toString(),
                BusinessParty: _.sample(partners),
                EventTimeUTCMS: timestamp,
                BusinessLocationID: _.sample(_stages),
                EventTimeZoneOffsetMS: 0
            })
        })
    });
    return records;
}

const records = generateRecords(Math.ceil(1000+Math.random()*1000), 7);
fs.writeFileSync('./public/generated_records.json', JSON.stringify(records, null, 2));
