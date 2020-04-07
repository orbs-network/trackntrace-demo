import React from "react";
import * as _ from 'lodash';
import {inject, observer} from "mobx-react";
import {
    AdjacentScansAlertThresholdMs, IAdjacentScansAlert,
    IRepeatedScanAlert,
    ITooManyScansAlert,
    Statistics,
    TooManyScansAlertThreshold
} from "./statistics";
import {BarChart} from "./bar-chart";
import {computed, observable, toJS} from "mobx";
import {gatewayImage, partnerBrandImage, stageImage} from "./resources";
import {TablePagination} from "@material-ui/core";
import {stages, stagesDisplay} from "./record";
import {GatewayConfig} from "./gateway-config";
import {OSAAlerts} from "./osa-alerts";
import {IAlert} from "./alerts";
import {
    GOING_DARK_TIMEOUT,
    ILargeQuantityWentDarkAlert,
    LARGE_QTY_WENT_DARK_THRESHOLD,
    ShrinkageAlerts
} from "./shrinkage-alerts";
import {AlertsTable} from "./alerts-table";

@observer
class Databox extends React.Component<{
    title: string,
    data: number
    subText?: string
    decimals?: number
}, {}> {

    @observable initDisplayedData: number = 0;
    @observable finalDisplayedData: number = null;
    @observable initial = true;

    mounted = false;

    format(v: number): string {
        if (this.props.decimals) {
            return `${Math.floor(v)}.${Math.floor(v * 10) % 10}`;
        } else {
            return `${v}`
        }
    }

    componentDidMount() {
        this.mounted = true;
        const duration = 1000;
        const data = this.props.data || 0;
        const mountedAt = Date.now();
        const update = () => {
            if (this.mounted) {
                const delta = Date.now() - mountedAt;
                if (delta < duration) {
                    this.initDisplayedData = Math.floor(data * (delta / duration));
                    requestAnimationFrame(update);
                } else {
                    this.finalDisplayedData = data;
                    this.initial = false;
                }
            }
        };
        update();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidUpdate() {
        this.finalDisplayedData = this.props.data;
    }

    render() {
        return <div className={'databox'}>
            <div className={'databox-title'}>{this.props.title}</div>
            <div className={'databox-infotext'}>
                <span>{this.format(this.initial ? this.initDisplayedData : this.finalDisplayedData)}</span>
                {this.props.subText &&
                    <div className={'databox-subtext'}>
                        <span>{this.props.subText}</span>
                    </div>
                }
            </div>
        </div>
    }

}

@inject('statistics', 'gatewayConfig', 'osaAlerts', 'shrinkageAlerts')
@observer
export class OverviewPage extends React.Component<{
    statistics: Statistics,
    gatewayConfig: GatewayConfig,
    osaAlerts: OSAAlerts
    shrinkageAlerts: ShrinkageAlerts
}, {}> {
    @observable private rowsPerPage: number = 5;
    @observable private page: number = 0;
    render() {
        const gateways = this.props.gatewayConfig.all().map(cfg => cfg.ID);

        return <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
        }}>
            <div style={{display: 'flex', flexDirection:'column', flex: 1, borderRight: '1px solid #ebedf8'}}>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: 'wrap'
                }}>
                    <div style={{flex: 1, marginTop: 50}}>
                        <div className="title" style={{
                            height: 46,
                            borderBottom: '1px solid #ebedf8',
                            alignItems: 'start'
                        }}>
                            <span>Products by gateway</span>
                        </div>
                        <div style={{height: 300, padding: 20, borderBottom: '1px solid #ebedf8'}}>
                            <BarChart
                                colors={["#035093", "#035093", "#4889c2", "#0a4171"]}
                                images={gateways.map(gateway => this.props.gatewayConfig.gatewayImage(gateway))}
                                labels={gateways.map(gw => this.props.gatewayConfig.getFor(gw).Alias)}
                                values={gateways.map(gateway => this.props.statistics.itemCountByGateway(gateway))}
                            />
                        </div>
                    </div>
                </div>
                {this.renderAlertsSection()}
            </div>
            <div style={{
                letterSpacing: 1.13,
                fontSize: 19,
            }}>
                {this.renderDataSection()}
            </div>
        </div>
    }

    @computed get allAlerts(): IAlert[] {
        return this.props.osaAlerts.alerts
            .concat(this.props.shrinkageAlerts.alerts)
    }

    @computed get alertedItemsCount(): number {
        return _.uniq(
            this.allAlerts
            .map(a => a.itemId)
            .filter(x => x)
        ).length;
    }

    @computed get suspectedCounterfietCount(): number {
        return _.uniq(
            this.props.shrinkageAlerts.alerts
            .map(a => a.itemId)
            .filter(x => x)
        ).length;
    }

    private renderAlertsSection() {
        const inventoryNotOnShelfAlerts = this.props.osaAlerts.inventoryNotOnShelfAlerts;
        const backroomInventoryLowAlerts = this.props.osaAlerts.backroomInventoryLowAlerts;
        const itemSkippedPOSAlerts = this.props.shrinkageAlerts.itemSkippedPOSAlerts;
        const itemWentDarkAlerts = this.props.shrinkageAlerts.itemWentDarkAlerts;
        const largeQtyWentDarkAlerts = this.props.shrinkageAlerts.largeQuantityWentDarkAlerts;
        const alerts = inventoryNotOnShelfAlerts
            .concat(backroomInventoryLowAlerts)
            .concat(itemSkippedPOSAlerts)
            .concat(itemWentDarkAlerts)
            .concat(largeQtyWentDarkAlerts);

        return <div style={{marginLeft: 50}}>
            <div style={{
                height: 50,
                borderBottom: '1px solid #ebedf8',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <img src={process.env.REACT_APP_BASE_URL + "/alert.svg"} alt={"alert"} style={{padding: "0 10px"}}/> <span>Alerts</span>
            </div>
            {
                alerts.length > 0 ?
                    <div className={"alerts"}>
                        <ul>
                            {alerts.length == 1 && <li>There is <b>1</b> active alert</li>}
                            {alerts.length > 1 && <li>There are <b>{alerts.length}</b> alerts active</li>}
                        </ul>
                        <div>
                            <AlertsTable alerts={alerts}/>
                        </div>
                        {/*<table className={"alerts-table"}>*/}
                        {/*    <tr>*/}
                        {/*        <td>TIMESTAMP</td>*/}
                        {/*        <td>CATEGORY</td>*/}
                        {/*        <td>ALERT TYPE</td>*/}
                        {/*        <td>ITEM ID</td>*/}
                        {/*        <td>GATEWAY</td>*/}
                        {/*        <td>DESCRIPTION</td>*/}
                        {/*    </tr>*/}
                        {/*    {_.sortBy(alerts, alert => -alert.timestamp.getTime())*/}
                        {/*        .slice(this.page * this.rowsPerPage, (this.page+1) * this.rowsPerPage)*/}
                        {/*        .map((alert: IAlert) => <tr>*/}
                        {/*            <td style={{whiteSpace: "nowrap"}}>{alert.timestamp.toDateString()}</td>*/}
                        {/*            <td style={{whiteSpace: "nowrap"}}>{alert.category}</td>*/}
                        {/*            <td style={{whiteSpace: "nowrap"}}>{alert.alertType}</td>*/}
                        {/*            <td style={{whiteSpace: "nowrap"}}>{alert.itemId}</td>*/}
                        {/*            <td style={{whiteSpace: "nowrap"}}>{alert.gatewayId}</td>*/}
                        {/*            <td style={{width: "100%"}}>{*/}
                        {/*                alert.alertType == 'Repeated Scan' ?*/}
                        {/*                    <span> Item was scanned twice at location <i>{(alert as IRepeatedScanAlert).location}</i> (previous scan was at {(alert as IRepeatedScanAlert).prevTime.toDateString()})</span>*/}
                        {/*                    : alert.alertType == 'Too Many Scans' ?*/}
                        {/*                    <span> Item was scanned <b>{(alert as ITooManyScansAlert).count}</b> times</span>*/}
                        {/*                    : alert.alertType == 'Adjacent Scans' ?*/}
                        {/*                        <span> Detected two consecutive scans in different locations in under <b>{Math.ceil((alert as IAdjacentScansAlert).deltaInMs / 1000 / 60)}</b> minutes.</span>*/}
                        {/*                        : alert.alertType == 'Inventory Not On Shelf' ?*/}
                        {/*                            <span>Customer shelf contains less than 3 items.</span>*/}
                        {/*                            : alert.alertType == 'Backroom Inventory Low' ?*/}
                        {/*                                <span>Customer backroom is empty.</span>*/}
                        {/*                                : alert.alertType == 'Item Skipped POS' ?*/}
                        {/*                                    <span>Item went from shelf to front door, skipped point-of-sale.</span>*/}
                        {/*                                    : alert.alertType == 'Item Went Dark' ?*/}
                        {/*                                        <span>On-shelf item did not scan for more than {Math.floor((Date.now() - alert.timestamp.getTime()) / 60 / 60 / 1000)} hours.</span>*/}
                        {/*                                        : alert.alertType == 'Large Quantity Went Dark' ?*/}
                        {/*                                            <span> <b>{(alert as ILargeQuantityWentDarkAlert).quantity}</b> items went dark.</span>*/}
                        {/*                                            :*/}
                        {/*                                            <span></span>*/}
                        {/*            }</td>`*/}
                        {/*        </tr>)}*/}
                        {/*</table>*/}
                        {/*<TablePagination*/}
                        {/*    rowsPerPageOptions={[5, 10]}*/}
                        {/*    component="div"*/}
                        {/*    count={alerts.length}*/}
                        {/*    rowsPerPage={this.rowsPerPage}*/}
                        {/*    page={this.page}*/}
                        {/*    onChangePage={(e, page) => this.page = page}*/}
                        {/*    onChangeRowsPerPage={(e) => {*/}
                        {/*        this.rowsPerPage = parseInt(e.target.value)*/}
                        {/*    }}*/}
                        {/*/>*/}
                    </div>
                    : <div style={{color: '#bebebe', margin: 10}}>- None -</div>
            }

        </div>
    }

    private renderDataSection() {
        const {statistics} = this.props;
        return <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className={"title"} style={{
                height: 96,
                width: '100%',
                borderBottom: '1px solid #ebedf8',
            }}><span style={{marginTop: 22}}>Data</span></div>
            <div style={{margin:"30px 30px 0 30px"}}>
                <table className={'data-table'}>
                    <tr>
                        <td className={'border-right border-bottom'}><Databox title={"Alerted Products"} data={this.alertedItemsCount}/></td>
                        <td className={'border-left border-bottom'}><Databox title={"Avg. Time in pipeline"} data={statistics.avgPiplineTimePerItemInDays} subText={"DAYS"} decimals={1}/></td>
                    </tr>
                    <tr>
                        <td className={'border-right border-top'}><Databox title={"Suspected counterfeit"} data={this.suspectedCounterfietCount}/></td>
                        <td className={'border-left border-top'}><Databox title={"Avg. scans per item"} data={statistics.avgRecordsPerItem} decimals={1}/></td>
                    </tr>
                </table>
                <div style={{
                    borderBottom: "1px solid #ebedf8",
                    height: 0
                }}/>
                <div style={{
                    fontSize: 16,
                    color: '#060606',
                    margin: '40px 0 40px'
                }}>
                    Items Location
                </div>
                <img src={process.env.REACT_APP_BASE_URL + "/worldmap.svg"} style={{width: '100%'}} alt="Route tracking"/>
            </div>
        </div>
    }
}
