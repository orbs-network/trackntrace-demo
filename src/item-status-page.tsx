import React from "react";
import * as _ from "lodash";
import {inject, observer} from "mobx-react";
import {Statistics} from "./statistics";

const twodigits = (n:number) => (n < 10 ? '0' : '') + n.toString();

@inject("statistics")
@observer
export class ItemStatusPage extends React.Component<{statistics: Statistics}, {}> {
    private selectedItemUID: string;
    render() {
        const selected = this.selectedItemUID || this.props.statistics.itemUIDs[0];
        return <div style={{margin: "30px"}}>
            <div>
                <div style={{
                    display: 'inline-block',
                    fontWeight: 'bold',
                    fontSize: 21,
                    padding: '32px 15px 32px 0'
                }}>Search an item:</div>
                <datalist id={"items"}>
                    {this.props.statistics.itemUIDs.map(uid => <option value={uid}/>)}
                </datalist>
                <input value={selected || ""} onChange={e => this.selectedItemUID = e.target.value} list={"items"}/>
            </div>
            {selected != null  && <div style={{
                borderRadius: 4,
                border: "solid 1px #ebedf8",
                backgroundColor: "#f8f8f8",
                padding: 37,
                display: 'flex',
                flexDirection: 'row',
                marginRight: 30,
                overflow: "auto"
            }}>
                <div>
                    <div style={{
                        fontSize: 19,
                        color: "#1a173b",
                        letterSpacing: 0.13,
                        paddingBottom: 12
                    }}>
                        Item UID
                    </div>
                    <div style={{
                        color: "#484848",
                        fontSize: 15
                    }}>
                        {selected}
                    </div>
                </div>
                <div>
                    <table className={"item-table"} style={{
                        paddingLeft: 40
                    }}>
                        <tr style={{
                            fontSize: 15,
                            letterSpacing: 0.1,
                            color: "#5e6e7b"
                        }}>
                            <td>Brand</td>
                            <td>Description</td>
                            <td>Catalog No.</td>
                            <td>Time in pipeline</td>
                            <td>Status</td>
                        </tr>
                        <tr style={{
                            fontSize: 16,
                            color: "#060606"
                        }}>
                            <td>Gillette</td>
                            <td>Razor Package 135Xg</td>
                            <td>1225434DLX</td>
                            <td>{Math.floor(this.props.statistics.itemPipelineTimeInSeconds(selected) / 60 / 60 / 24)} days</td>
                            <td style={{
                                fontWeight: 'bold',
                                fontSize: 16,
                                color: '#769806'
                            }}>OK</td>
                        </tr>
                    </table>
                </div>
            </div>}
            <div>
                <div style={{
                    display: 'inline-block',
                    fontWeight: 'bold',
                    fontSize: 21,
                    padding: '32px 15px 32px 0',
                    borderBottom: "solid 0.5px #ebedf8",
                    width: "100%"
                }}>Item history</div>
                <div>
                    <table className={'item-history-table'}>
                        <tr>
                            <td></td>
                            <td>Partner</td>
                            <td>Stage</td>
                            <td>Date</td>
                            <td>Time</td>
                            <td>Status</td>
                            <td>Comments</td>
                        </tr>
                        {
                            _.sortBy(this.props.statistics.itemRecords(selected), r => -r.timestampInSeconds())
                                .map(r => <tr>
                                    <td className={'record-id-cell'}>Record {r.recordId()}</td>
                                    <td>{r.partner()}</td>
                                    <td>{r.stage()}</td>
                                    <td>{`${twodigits(r.timestampAsDate().getDate())} ${r.timestampAsDate().toLocaleString('default', { month: 'short' })}, ${r.timestampAsDate().getFullYear()}`}</td>
                                    <td>{`${twodigits(r.timestampAsDate().getHours())}:${twodigits(r.timestampAsDate().getMinutes())}`}</td>
                                    <td className={'status-cell'}><div>OK</div></td>
                                    <td style={{color: "grey", fontWeight: "normal"}}>N/A</td>
                                </tr>)
                        }
                    </table>
                </div>
            </div>
        </div>
    }
}
