import React from "react";
import * as _ from "lodash";
import {inject, observer} from "mobx-react";
import {Statistics} from "./statistics";
import {observable, reaction} from "mobx";
import {CircularProgress, TablePagination, TextField} from "@material-ui/core";
import {Autocomplete, createFilterOptions} from "@material-ui/lab";
import {partnerBrandImage, stageImage} from "./resources";

const twodigits = (n:number) => (n < 10 ? '0' : '') + n.toString();

@inject("statistics")
@observer
export class ItemStatusPage extends React.Component<{statistics: Statistics}, {}> {

    @observable private selectedItemUID: string;
    @observable private ready = false;
    @observable private pageSize: number = 5;
    @observable private currentPage: number = 0;
    private currentTimeoutHandle;

    get selected(): string {
        return this.selectedItemUID != null ?
            (
                this.props.statistics.itemUIDs.indexOf(this.selectedItemUID) != -1 ?
                    this.selectedItemUID
                    :
                    null
            )
            : this.props.statistics.itemUIDs[0];
    }

    componentDidMount() {
        this.loadData();
        reaction(
            () => this.selected,
            () => this.loadData()
        )
    }

    loadData() {
        const uid = this.selected;
        if (uid) {
            this.ready = false;
            if (this.currentTimeoutHandle) {
                clearTimeout(this.currentTimeoutHandle);
            }
            this.currentTimeoutHandle = setTimeout(() => {
                this.ready = true;
                this.currentTimeoutHandle = null;
            }, 1000);
        }
    }

    componentWillUnmount() {
        if (this.currentTimeoutHandle) {
            clearTimeout(this.currentTimeoutHandle);
        }
    }

    render() {
        const records = this.props.statistics.itemRecords(this.selected);
        return <div style={{margin: "30px"}}>
            <div style={{
                display: 'flex',
                alignItems: 'center'
            }}>
                <div style={{
                    display: 'inline-block',
                    fontWeight: 'bold',
                    fontSize: 21,
                    padding: '32px 15px 32px 0'
                }}>Search an item:</div>
                {/*<datalist id={"items"}>*/}
                {/*    {this.props.statistics.itemUIDs.map(uid => <option value={uid}/>)}*/}
                {/*</datalist>*/}
                {/*<input value={this.selectedItemUID == null ? this.selected : this.selectedItemUID} onChange={e => this.selectedItemUID = e.target.value} list={"items"}/>*/}
                {this.props.statistics.itemUIDs.length > 0 && <Autocomplete
                    options={this.props.statistics.itemUIDs}
                    getOptionLabel={option => option}
                    style={{ width: 300}}
                    filterOptions={createFilterOptions({
                        matchFrom: 'start'
                    })}
                    onChange={(e, value) => {
                        this.selectedItemUID = value;
                        this.loadData();
                    }}
                    value={this.selectedItemUID == null ? this.selected : this.selectedItemUID}
                    renderInput={params => <TextField {...params} label="Item UID" variant="outlined" />}
                />}
                {!this.ready && <CircularProgress style={{marginLeft: 20}}/>}
            </div>
            {this.selected != null && this.ready && <div style={{
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
                        {this.selected}
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
                            <td>{Math.floor(this.props.statistics.itemPipelineTimeInSeconds(this.selected) / 60 / 60 / 24)} days</td>
                            <td style={{
                                fontWeight: 'bold',
                                fontSize: 16,
                                color: '#769806'
                            }}>OK</td>
                        </tr>
                    </table>
                </div>
            </div>}
            {this.selected && this.ready && <div>
                <div style={{
                    display: 'inline-block',
                    fontWeight: 'bold',
                    fontSize: 21,
                    padding: '32px 15px 32px 0',
                    borderBottom: "solid 0.5px #ebedf8",
                    width: "100%"
                }}>Item history</div>
                <div>
                    <div className={'item-history-table'}>
                        <table>
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
                                _.sortBy(records.slice(this.pageSize * this.currentPage, this.pageSize * (this.currentPage + 1)), r => -r.timestampInSeconds())
                                    .map(r => <tr>
                                        <td className={'record-id-cell'}>Record {r.recordId()}</td>
                                        <td style={{textAlign: 'left'}}>
                                            <div style={{
                                                verticalAlign: 'middle',
                                                width: 30,
                                                height: 30,
                                                backgroundImage: `url(${partnerBrandImage(r.partner())})`,
                                                backgroundSize: 'contain',
                                                backgroundRepeat: 'no-repeat',
                                                whiteSpace: 'nowrap',
                                                backgroundPosition: 'center',
                                                display: 'inline-block'
                                            }}/>
                                            &nbsp;&nbsp;&nbsp;{r.partner()}
                                        </td>
                                        <td>
                                            <img src={stageImage(r.stage())} style={{
                                                verticalAlign: 'middle',
                                                width: 20,
                                                height: 20,
                                            }}/>&nbsp;&nbsp;&nbsp;
                                            {r.stage()}
                                        </td>
                                        <td>{`${twodigits(r.timestampAsDate().getDate())} ${r.timestampAsDate().toLocaleString('default', { month: 'short' })}, ${r.timestampAsDate().getFullYear()}`}</td>
                                        <td>{`${twodigits(r.timestampAsDate().getHours())}:${twodigits(r.timestampAsDate().getMinutes())}`}</td>
                                        <td className={'status-cell'}><div>OK</div></td>
                                        <td style={{color: "grey", fontWeight: "normal", textAlign: 'center'}}>N/A</td>
                                    </tr>)
                            }
                        </table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10]}
                            component="div"
                            count={records.length}
                            rowsPerPage={this.pageSize}
                            page={this.currentPage}
                            onChangePage={(e, page) => this.currentPage = page}
                            onChangeRowsPerPage={(e) => {
                                this.pageSize = parseInt(e.target.value)
                            }}
                        />
                    </div>
                </div>
            </div>}
        </div>
    }
}
