import React from "react";
import {AlertType, IAlert} from "./alerts";
import * as _ from "lodash";
import {IAdjacentScansAlert, IRepeatedScanAlert, ITooManyScansAlert} from "./statistics";
import {ILargeQuantityWentDarkAlert} from "./shrinkage-alerts";
import {MenuItem, Select, TablePagination} from "@material-ui/core";
import {observer} from "mobx-react";
import {observable} from "mobx";

const twodigits = (n:number) => (n < 10 ? '0' : '') + n.toString();

@observer
export class AlertsTable extends React.Component<{alerts: IAlert[]}> {
    @observable private rowsPerPage: number = 5;
    @observable private page: number = 0;

    @observable alertTypeFilter: AlertType | "all" = "all";

    render() {
        const {alerts} = this.props;
        const alertTypes = _.uniq(alerts.map(a => a.alertType));
        const filteredAlerts = alerts.filter(a => this.alertTypeFilter == "all" || a.alertType == this.alertTypeFilter);
        return <div>
            <div style={{textAlign: 'right', paddingRight: 20}}>
                <div style={{display: 'inline-block', paddingRight: 10}}>Show only:</div>
                <Select value={this.alertTypeFilter} onChange={(e) => {
                    this.alertTypeFilter = e.target.value as AlertType;
                    this.page = 0;
                }}>
                    <MenuItem value={"all"}>- All -</MenuItem>
                    {alertTypes.map(a => <MenuItem value={a}>{a}</MenuItem>)}
                </Select>
            </div>
            <table className={"alerts-table"}>
                <tr>
                    <td>TIMESTAMP</td>
                    <td>CATEGORY</td>
                    <td>ALERT TYPE</td>
                    <td>ITEM ID</td>
                    <td>GATEWAY</td>
                    <td>DESCRIPTION</td>
                </tr>
                {filteredAlerts.length ?
                    _.sortBy(filteredAlerts, alert => -alert.timestamp.getTime())
                    .slice(this.page * this.rowsPerPage, (this.page+1) * this.rowsPerPage)
                    .map((alert: IAlert) => <tr>
                        <td style={{whiteSpace: "nowrap"}}>{alert.timestamp.toDateString()} {twodigits(alert.timestamp.getHours())}:{twodigits(alert.timestamp.getMinutes())}</td>
                        <td style={{whiteSpace: "nowrap"}}>{alert.category}</td>
                        <td style={{whiteSpace: "nowrap"}}>{alert.alertType}</td>
                        <td style={{whiteSpace: "nowrap"}}>{alert.itemId}</td>
                        <td style={{whiteSpace: "nowrap"}}>{alert.gatewayId}</td>
                        <td style={{width: "100%"}}>{
                            alert.alertType == 'Repeated Scan' ?
                                <span> Item was scanned twice at location <i>{(alert as IRepeatedScanAlert).location}</i> (previous scan was at {(alert as IRepeatedScanAlert).prevTime.toDateString()})</span>
                                : alert.alertType == 'Too Many Scans' ?
                                <span> Item was scanned <b>{(alert as ITooManyScansAlert).count}</b> times</span>
                                : alert.alertType == 'Adjacent Scans' ?
                                    <span> Detected two consecutive scans in different locations in under <b>{Math.ceil((alert as IAdjacentScansAlert).deltaInMs / 1000 / 60)}</b> minutes.</span>
                                    : alert.alertType == 'Inventory Not On Shelf' ?
                                        <span>Customer shelf contains less than 3 items.</span>
                                        : alert.alertType == 'Backroom Inventory Low' ?
                                            <span>Customer backroom is empty.</span>
                                            : alert.alertType == 'Item Skipped POS' ?
                                                <span>Item went from shelf to front door, skipped point-of-sale.</span>
                                                : alert.alertType == 'Item Went Dark' ?
                                                    <span>On-shelf item did not scan for more than {Math.floor((Date.now() - alert.timestamp.getTime()) / 60 / 60 / 1000)} hours.</span>
                                                    : alert.alertType == 'Large Quantity Went Dark' ?
                                                        <span> <b>{(alert as ILargeQuantityWentDarkAlert).quantity}</b> items went dark.</span>
                                                        :
                                                        <span></span>
                        }</td>
                    </tr>)
                :   <tr><td colSpan={6} style={{textAlign: "center", color: "grey"}}>- No Alerts - </td></tr>
                }
            </table>
            <TablePagination
                rowsPerPageOptions={[5, 10]}
                component="div"
                count={filteredAlerts.length}
                rowsPerPage={this.rowsPerPage}
                page={this.page}
                onChangePage={(e, page) => this.page = page}
                onChangeRowsPerPage={(e) => {
                    this.rowsPerPage = parseInt(e.target.value)
                }}
            />
        </div>
    }

}
