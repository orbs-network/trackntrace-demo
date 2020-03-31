import * as _ from "lodash";
import * as fs from "fs";
import {IRawScanRecord, stages} from "./record";

const hashCode = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));
const partners = ['Amazon','Amazon',
    'P&G','P&G','P&G',
    'FedEx',
    'DHL'];

const gatewayIds = [
    "3c71bf63e190",
    "3c71bf63e190",
    "3c71bf63e190",
    "3c71bf63e190",
    "3c71bf63e190",
    "3c71bf63e190",
    "GW98f4ab141D14",
    "GW98f4ab141D14",
    "GW98f4ab141D14",
    "GW98f4ab141D14",
    "GW98f4ab141D14",
    "GW984fab141D70",
    "GW984fab141D70",
    "GW984fab141D70",
    "GW98f4ab141D38",
    "GW98f4ab141D38",
    "GW98f4ab141DF4",
    "GW98f4ab141DF4",
    "GW98f4ab141D0C",
    "GW98f4ab141D0C",
    "GW98f4ab141D0C",
    "GW98f4ab141D0C",
];

export function generateRecords(nProducts: number): IRawScanRecord[] {
    let records: IRawScanRecord[] = [];
    _.range(nProducts).forEach(() => {
        const nRecs = _.sample([1,1,1,2,2,3,4,4]);
        const timestamps = _.sortBy(_.range(nRecs+20).map(() => new Date(Math.floor(Date.now() - 7*24*60*60*1000 * Math.random())).getTime()));
        const pid = hashCode(Math.random().toString()).toString();
        let pRecords = [];
        _.range(nRecs).forEach(i => {
            const timestamp = timestamps[i];
            pRecords.push({
                tagId: pid,
                timestamp: timestamp / 1000,
                latitude: "123.456",
                longitude: "123.456",
                eventType: "PRESENCE",
                gatewayId: _.sample(gatewayIds),
                eventValue: "1"
            } as IRawScanRecord)
        });
        records = records.concat(pRecords);
    });
    return records;
}

const records = generateRecords(Math.ceil(1000+Math.random()*1000));
fs.writeFileSync('./public/generated_records.json', JSON.stringify(records, null, 2));
