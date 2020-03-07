import React from "react";
import * as _ from 'lodash';
import {inject, observer} from "mobx-react";
import {
    AdjacentScansAlertThresholdMs, IAdjacentScansAlert,
    IAlert,
    IRepeatedScanAlert,
    ITooManyScansAlert,
    Statistics,
    TooManyScansAlertThreshold
} from "./statistics";
import {BarChart} from "./bar-chart";
import {observable, toJS} from "mobx";
import {partnerBrandImage, stageImage} from "./resources";
import {TablePagination} from "@material-ui/core";

class Databox extends React.Component<{
    title: string,
    infoText: string|number
    subText?: string
}, {}> {

    render() {
        return <div className={'databox'}>
            <div className={'databox-title'}>{this.props.title}</div>
            <div className={'databox-infotext'}>
                <span>{this.props.infoText}</span>
                {this.props.subText &&
                    <div className={'databox-subtext'}>
                        <span>{this.props.subText}</span>
                    </div>
                }
            </div>
        </div>
    }

}

@inject('statistics')
@observer
export class OverviewPage extends React.Component<{
    statistics: Statistics
}, {}> {
    @observable private rowsPerPage: number = 5;
    @observable private page: number = 0;
    render() {
        const byPartner = this.props.statistics.itemCountByPartner;
        const partners = Object.keys(toJS(byPartner)).sort();
        const byStage = this.props.statistics.itemCountByStage;
        const stages = Object.keys(toJS(byStage)).sort();
        const repeatedScanAlertsCount = this.props.statistics.alerts.filter(a => a.alertType == 'Repeated Scan').length;
        const tooManyAlertsCount = this.props.statistics.alerts.filter(a => a.alertType == 'Too Many Scans').length;
        const adjacentScansAlertsCount = this.props.statistics.alerts.filter(a => a.alertType == 'Adjacent Scans').length;
        const alertCount = this.props.statistics.alerts.length;

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
                    <div style={{flex: 1, borderRight: '1px solid #ebedf8', marginTop: 50}}>
                        <div className="title" style={{
                            height: 46,
                            borderBottom: '1px solid #ebedf8',
                            alignItems: 'start'
                        }}>
                            <span>Products by stage</span>
                        </div>
                        <div style={{height: 300, padding: 20, marginLeft: 50, borderBottom: '1px solid #ebedf8'}}>
                            <BarChart
                                colors={["#035093", "#035093", "#4889c2", "#0a4171"]}
                                images={stages.map(stage => stageImage(stage))}
                                labels={stages}
                                values={stages.map(stage => byStage[stage])}
                            />
                        </div>
                    </div>
                    <div style={{flex: 1, marginTop: 50}}>
                        <div className="title" style={{
                            height: 46,
                            borderBottom: '1px solid #ebedf8',
                            alignItems: 'start'
                        }}>
                            <span>Products by partner</span>
                        </div>
                        <div style={{height: 300, padding: 20, borderBottom: '1px solid #ebedf8'}}>
                            <BarChart
                                colors={["#bb8888", "#a37878", "#d19d9d", "#bb8888"]}
                                images={partners.map(partner => partnerBrandImage(partner))}
                                labels={partners}
                                values={partners.map(partner => byPartner[partner])}
                            />
                        </div>
                    </div>
                </div>
                <div style={{marginLeft: 50}}>
                    <div style={{
                        height: 50,
                        borderBottom: '1px solid #ebedf8',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <img src={"/alert.svg"} alt={"alert"} style={{padding: "0 10px"}}/> <span>Alerts</span>
                    </div>
                    {
                        alertCount > 0 ?
                        <div className={"alerts"}>
                            <ul>
                                {repeatedScanAlertsCount > 0 && <li><b>{repeatedScanAlertsCount}</b> item{repeatedScanAlertsCount > 1 ? 's were' : ' was'} rescanned in a previous location (<i>Repeated-Scan-Alert</i>).</li>}
                                {tooManyAlertsCount > 0 && <li><b>{tooManyAlertsCount}</b> item{tooManyAlertsCount > 1 ? 's were' : ' was'} scanned more than {TooManyScansAlertThreshold} times (<i>Too-Many-Scans-Alert</i>).</li>}
                                {adjacentScansAlertsCount > 0 && <li><b>{adjacentScansAlertsCount}</b> item{adjacentScansAlertsCount > 1 ? 's were' : ' was'} scanned in two or more different locations within a period of less than {AdjacentScansAlertThresholdMs / 1000 / 60} minutes (<i>Adjacent-Scans-Alert</i>).</li>}
                            </ul>
                            <table className={"alerts-table"}>
                                <tr>
                                    <td>TIMESTAMP</td>
                                    <td>ALERT TYPE</td>
                                    <td>ITEM ID</td>
                                    <td>DESCRIPTION</td>
                                </tr>
                                {_.sortBy(this.props.statistics.alerts, alert => -alert.timestamp.getTime())
                                    .slice(this.page * this.rowsPerPage, (this.page+1) * this.rowsPerPage)
                                    .map((alert: IAlert) => <tr>
                                        <td style={{whiteSpace: "nowrap"}}>{alert.timestamp.toDateString()}</td>
                                        <td style={{whiteSpace: "nowrap"}}>{alert.alertType}</td>
                                        <td style={{whiteSpace: "nowrap"}}>{alert.itemId}</td>
                                        <td style={{width: "100%"}}>{
                                            alert.alertType == 'Repeated Scan' ?
                                                <span> Item was scanned twice at location <i>{(alert as IRepeatedScanAlert).location}</i> (previous scan was at {(alert as IRepeatedScanAlert).prevTime.toDateString()})</span>
                                            : alert.alertType == 'Too Many Scans' ?
                                                <span> Item was scanned <b>{(alert as ITooManyScansAlert).count}</b> times</span>
                                            : alert.alertType == 'Adjacent Scans' ?
                                                <span> Detected two consecutive scans in different locations in under <b>{Math.ceil((alert as IAdjacentScansAlert).deltaInMs / 1000 / 60)}</b> minutes.</span>
                                            :
                                                <span></span>
                                        }</td>
                                    </tr>)}
                            </table>
                            <TablePagination
                                rowsPerPageOptions={[5, 10]}
                                component="div"
                                count={this.props.statistics.alerts.length}
                                rowsPerPage={this.rowsPerPage}
                                page={this.page}
                                onChangePage={(e, page) => this.page = page}
                                onChangeRowsPerPage={(e) => {
                                    this.rowsPerPage = parseInt(e.target.value)
                                }}
                            />
                        </div>
                        : <div style={{color: '#bebebe', margin: 10}}>- None -</div>
                    }

                </div>
            </div>
            <div style={{
                // width: 500,
                // height: '100%',
                letterSpacing: 1.13,
                fontSize: 19,
            }}>
                {this.renderDataSection()}
            </div>
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
                        <td className={'border-right border-bottom'}><Databox title={"Alerted Products"} infoText={statistics.itemUIDs.length}/></td>
                        <td className={'border-left border-bottom'}><Databox title={"Avg. Time in pipeline"} infoText={Math.floor(statistics.avgPiplineTimePerItemInDays)} subText={"DAYS"}/></td>
                    </tr>
                    <tr>
                        <td className={'border-right border-top'}><Databox title={"Suspected counterfiet"} infoText={0}/></td>
                        <td className={'border-left border-top'}><Databox title={"Avg. scans per item"} infoText={Math.floor(statistics.avgRecordsPerItem)}/></td>
                    </tr>
                </table>
                <div style={{
                    borderBottom: "1px solid #ebedf8",
                    height: 0
                }}/>
                <div style={{
                    fontSize: 16,
                    color: '#060606',
                    margin: '70px 0 40px'
                }}>
                    Route Tracking
                </div>
                <img src="/worldmap.svg" style={{width: '100%'}} alt="Route tracking"/>
            </div>
        </div>
    }
}
