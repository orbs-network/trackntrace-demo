import * as _ from "lodash";
import * as fs from "fs";
import {IRawScanRecord, stages} from "./record";

const hashCode = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));

const BACKROOM = "GW98F4AB141DF4";
const SHELF = "GW98F4AB141D0C";
const POS = "GW3C71BF63E190";
const FRONT_DOOR = "GW98F4AB141D14";

const startTime = Date.now() - 2*24*60*60*1000;

const rec = (tagId: string, t: number, gwid: string) => ({
    tagId,
    timestamp: t/1000,
    latitude: "123.456",
    longitude: "123.456",
    eventType: "PRESENCE",
    gatewayId: gwid,
    eventValue: "1"
} as IRawScanRecord);

const _nextTime = (t, maxGap=60*60*1000) => {
    const next = Math.floor(t + (Date.now() - t) * Math.random());
    if (next - t >= maxGap) {
        return Math.floor(t + maxGap * Math.random() / 2)
    }
    return next;
};

function anItemSkippedPOS(): IRawScanRecord[] {
    let t = startTime;
    const nextTime = () => {t = _nextTime(t); return t;};

    const tagId = `stolen_skipped_pos_${Math.random()}`;
    return [
        rec(tagId, nextTime(), SHELF),
        rec(tagId, nextTime(), SHELF),
        rec(tagId, nextTime(), SHELF),
        rec(tagId, nextTime(), FRONT_DOOR),
    ]
}

function anItemWentDark(): IRawScanRecord[] {
    let t = startTime;
    const nextTime = () => {t = Math.floor(t + (Date.now() - t) * Math.random()); return t;};

    const tagId = `stolen_went_dark_${Math.random()}`;
    return [
        rec(tagId, nextTime(), SHELF),
    ]
}

function aBackroomItem(): IRawScanRecord[] {
    let t = startTime;
    const nextTime = () => {t = Math.floor(t + (Date.now() - t) * Math.random()); return t;};

    const tagId = `backroom_${Math.random()}`;
    return [
        rec(tagId, nextTime(), BACKROOM),
    ]
}

function anOKitem(): IRawScanRecord[] {
    let t = startTime;
    const nextTime = () => {t = Math.floor(t + (Date.now() - t) * Math.random()); return t;};

    const tagId = `ok_${Math.random()}`;
    return [
        rec(tagId, nextTime(), SHELF),
        rec(tagId, nextTime(), SHELF),
        rec(tagId, nextTime(), POS),
        rec(tagId, nextTime(), FRONT_DOOR),
    ]
}

export function generateRecords(): IRawScanRecord[] {
    return [
        anOKitem(),
        anOKitem(),
        anOKitem(),
        anOKitem(),
        anItemWentDark(),
        anItemWentDark(),
        anItemWentDark(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        aBackroomItem()
    ].reduce((x,y) => x.concat(y), [])
}

const records = generateRecords();
fs.writeFileSync('./public/generated_records.json', JSON.stringify(records, null, 2));
