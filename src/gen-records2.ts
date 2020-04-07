import * as _ from "lodash";
import * as fs from "fs";
import {IRawScanRecord, stages} from "./record";

const hashCode = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));

const BACKROOM = "GW98F4AB141DF4";
const SHELF = "GW98F4AB141D0C";
const POS = "GW3C71BF63E190";
const FRONT_DOOR = "GW98F4AB141D14";
const TRUCK = "GW98F4AB141D70";
const DC_SHELF = "GW98F4AB141D38";

const startTime = Date.now() - 7*24*60*60*1000;

const rec = (tagId: string, t: number, gwid: string) => ({
    tagId,
    timestamp: Math.floor(t/1000),
    latitude: "123.456",
    longitude: "123.456",
    eventType: "PRESENCE",
    gatewayId: gwid,
    eventValue: "1"
} as IRawScanRecord);

const _nextTime = (t, maxGap) => {
    maxGap = maxGap || 60*60*1000;
    const next = Math.floor(t + (Date.now() - t) * Math.random());
    if (next - t >= maxGap) {
        return Math.floor(t + maxGap * Math.random() / 2)
    }
    return next;
};

function anItemSkippedPOS(startTimeOverride?: number): IRawScanRecord[] {
    let t = startTimeOverride || startTime;
    const nextTime = (maxGap?) => {t = _nextTime(t, maxGap); return t;};
    nextTime((Date.now() - t) * 0.8);

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
    const nextTime = (maxGap?) => {t = _nextTime(t, maxGap); return t;};
    nextTime((Date.now() - t) / 2);

    const tagId = `stolen_went_dark_${Math.random()}`;
    return [
        rec(tagId, nextTime(), SHELF),
    ]
}

function aBackroomItem(): IRawScanRecord[] {
    let t = startTime;
    const nextTime = (maxGap?) => {t = _nextTime(t, maxGap); return t;};
    nextTime((Date.now() - t) / 2);

    const tagId = `backroom_${Math.random()}`;
    return [
        rec(tagId, nextTime(), BACKROOM),
    ]
}

function aShelfItem(): IRawScanRecord[] {
    let t = startTime;
    const nextTime = (maxGap?) => {t = _nextTime(t, maxGap); return t;};
    nextTime((Date.now() - t) / 2);

    const tagId = `shelf_${Math.random()}`;
    return [
        rec(tagId, nextTime(), SHELF),
    ]
}

function aTruckItem(): IRawScanRecord[] {
    let t = startTime;
    const nextTime = (maxGap?) => {t = _nextTime(t, maxGap); return t;};
    nextTime((Date.now() - t) / 2);

    const tagId = `shelf_${Math.random()}`;
    return [
        rec(tagId, nextTime(), TRUCK),
    ]
}

function aDCShelfItem(): IRawScanRecord[] {
    let t = startTime;
    const nextTime = (maxGap?) => {t = _nextTime(t, maxGap); return t;};
    nextTime((Date.now() - t) / 2);

    const tagId = `shelf_${Math.random()}`;
    return [
        rec(tagId, nextTime(), DC_SHELF),
    ]
}

function aPOSItem(): IRawScanRecord[] {
    let t = startTime;
    const nextTime = (maxGap?) => {t = _nextTime(t, maxGap); return t;};
    nextTime((Date.now() - t) / 2);

    const tagId = `shelf_${Math.random()}`;
    return [
        rec(tagId, nextTime(), POS),
    ]
}

function anOKitem(): IRawScanRecord[] {
    let t = startTime;
    const nextTime = (maxGap?) => {t = _nextTime(t, maxGap); return t;};
    nextTime((Date.now() - t) / 2);

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
        anOKitem(),
        anOKitem(),
        anOKitem(),
        anItemWentDark(),
        anItemWentDark(),
        anItemWentDark(),
        anItemWentDark(),
        anItemWentDark(),
        anItemWentDark(),
        anItemWentDark(),
        anItemWentDark(),
        anItemWentDark(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(),
        anItemSkippedPOS(Date.now() - 23*60*60*1000),
        anItemSkippedPOS(Date.now() - 23*60*60*1000),
        anItemSkippedPOS(Date.now() - 23*60*60*1000),
        aBackroomItem(),
        aBackroomItem(),
        aShelfItem(),
        aTruckItem(),
        aTruckItem(),
        aTruckItem(),
        aTruckItem(),
        aTruckItem(),
        aTruckItem(),
        aPOSItem(),
        aPOSItem(),
        aPOSItem(),
        aDCShelfItem(),
        aDCShelfItem(),
        aDCShelfItem(),
        aDCShelfItem(),
    ].reduce((x,y) => x.concat(y), [])
}

const records = generateRecords();
fs.writeFileSync('./public/generated_records.json', JSON.stringify(records, null, 2));
