import React from "react";
import * as _ from "lodash";
import {inject, observer} from "mobx-react";
import {Statistics} from "./statistics";
import {observable, reaction} from "mobx";
import {GatewayConfig, IGatewayConfigRecord} from "./gateway-config";
import {RecordStore} from "./record-store";
import {ErrorPage} from "./error-page";
import {Line} from "react-chartjs-2";
import {ShrinkageAlerts} from "./shrinkage-alerts";
import {alertsByTime} from "./alerts";
import {PageHeader} from "./page-header";
import {AlertsTable} from "./alerts-table";
import {CircularProgress} from "@material-ui/core";

@inject("statistics", "gatewayConfig", "records", "shrinkageAlerts")
@observer
export class ShrinkagePage extends React.Component<{statistics: Statistics, gatewayConfig: GatewayConfig, records: RecordStore, shrinkageAlerts: ShrinkageAlerts}, {}> {

    @observable private ready = false;
    private currentTimeoutHandle;

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        this.ready = false;
        if (this.currentTimeoutHandle) {
            clearTimeout(this.currentTimeoutHandle);
        }
        this.currentTimeoutHandle = setTimeout(() => {
            this.ready = true;
            this.currentTimeoutHandle = null;
        }, 1000);
    }

    componentWillUnmount() {
        if (this.currentTimeoutHandle) {
            clearTimeout(this.currentTimeoutHandle);
        }
    }

    render() {
        if (this.props.gatewayConfig.all().length == 0) {
            return <ErrorPage err={new Error("Gateway config appears to be empty. The shrinkage dashboard required a gateway config.")}/>
        }

        const itemWentDarkAlertsByTime = alertsByTime(this.props.shrinkageAlerts.itemWentDarkAlerts, 30, 24*60*60*1000);
        const itemSkippedPOSAlertsByTime = alertsByTime(this.props.shrinkageAlerts.itemSkippedPOSAlerts, 30, 24*60*60*1000);

        return <div>
            <PageHeader title={"Shrinkage Dashboard"}/>
            {!this.ready ? <div style={{padding: 10}}><CircularProgress/></div> : <div style={{paddingLeft: 10, width: 1000}}>
                <div style={{display: 'flex', flexDirection: 'row', width: "100%", justifyContent: 'center'}}>
                    {this.metricBox("SUSPECTED STOLEN ITEMS", "PAST 24H", this.props.shrinkageAlerts.alertedItemsCountLast24Hours, "#8f5c5c")}
                    {this.metricBox("SUSPECTED STOLEN ITEMS", "PAST 30 DAYS", this.props.shrinkageAlerts.alertedItemsCountLast30Days, "#be8b8b")}
                </div>
                <div style={{width: "100%", }}>
                    <Line
                        data={{
                            // labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                            datasets: [
                                {
                                    label: 'Item Went Dark',
                                    fill: false,
                                    lineTension: 0.1,
                                    backgroundColor: 'rgba(75,192,192,0.4)',
                                    borderColor: '#8f5c5c',
                                    borderCapStyle: 'butt',
                                    borderDash: [],
                                    borderDashOffset: 0.0,
                                    borderJoinStyle: 'miter',
                                    pointBorderColor: '#8f5c5c',
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 1,
                                    pointHoverRadius: 5,
                                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                                    pointHoverBorderWidth: 2,
                                    pointRadius: 3,
                                    pointHitRadius: 10,
                                    data: itemWentDarkAlertsByTime.bins.map((count, i) => ({t: itemWentDarkAlertsByTime.startTime + itemWentDarkAlertsByTime.binSize*i, y: count}))
                                },
                                {
                                    label: 'Item Skipped POS',
                                    fill: false,
                                    lineTension: 0.1,
                                    backgroundColor: 'rgba(75,192,192,0.4)',
                                    borderColor: '#bbbbbb',
                                    borderCapStyle: 'butt',
                                    borderDash: [],
                                    borderDashOffset: 0.0,
                                    borderJoinStyle: 'miter',
                                    pointBorderColor: '#bbbbbb',
                                    pointBackgroundColor: '#fff',
                                    pointBorderWidth: 3,
                                    pointHoverRadius: 5,
                                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                                    pointHoverBorderWidth: 2,
                                    pointRadius: 1,
                                    pointHitRadius: 10,
                                    data: itemSkippedPOSAlertsByTime.bins.map((count, i) => ({t: itemSkippedPOSAlertsByTime.startTime + itemSkippedPOSAlertsByTime.binSize*i, y: count}))
                                },
                            ]
                        }}
                        width={800}
                        height={300}
                        options={{
                            scales: {
                                xAxes: [{
                                    type: 'time',
                                    distribution: 'linear',
                                    offset: true,
                                    // ticks: {
                                    //     major: {
                                    //         enabled: true,
                                    //         fontStyle: 'bold'
                                    //     },
                                    //     source: 'data',
                                    //     autoSkip: true,
                                    //     autoSkipPadding: 75,
                                    //     // maxRotation: 0,
                                    //     sampleSize: 100
                                    // },
                                    // afterBuildTicks: function(scale: any, ticks: any) {
                                    //     var majorUnit = scale._majorUnit;
                                    //     var firstTick = ticks[0];
                                    //     var i, ilen, val, tick, currMajor, lastMajor;
                                    //
                                    //     val = moment(ticks[0].value);
                                    //     if ((majorUnit === 'minute' && val.second() === 0)
                                    //         || (majorUnit === 'hour' && val.minute() === 0)
                                    //         || (majorUnit === 'day' && val.hour() === 9)
                                    //         || (majorUnit === 'month' && val.date() <= 3 && val.isoWeekday() === 1)
                                    //         || (majorUnit === 'year' && val.month() === 0)) {
                                    //         firstTick.major = true;
                                    //     } else {
                                    //         firstTick.major = false;
                                    //     }
                                    //     lastMajor = val.get(majorUnit);
                                    //
                                    //     for (i = 1, ilen = ticks.length; i < ilen; i++) {
                                    //         tick = ticks[i];
                                    //         val = moment(tick.value);
                                    //         currMajor = val.get(majorUnit);
                                    //         tick.major = currMajor !== lastMajor;
                                    //         lastMajor = currMajor;
                                    //     }
                                    //     return ticks;
                                    // }
                                }],
                                yAxes: [{
                                    ticks: {
                                        beginAtZero:true
                                    }
                                }]
                            },
                            maintainAspectRatio: false,
                            legend: {display: true}
                        }}
                    />
                </div>
                <div style={{margin: "20px 0 20px 20px", fontWeight: 'bold'}}> Shrinkage Alerts </div>
                <AlertsTable alerts={this.props.shrinkageAlerts.alerts}/>
            </div>}
        </div>
    }

    metricBox(title: string, subTitle: string, value: number, color: string) {
        return <div style={{width: 300, textAlign: 'center', color: "white", letterSpacing: 1.07, fontSize: 12, padding: 15}}>
            <div style={{padding: 10, backgroundColor: color}}>{title}</div>
            <div style={{backgroundColor: "#f8f8f8", color: "#3d3d3d"}}>
                <div style={{padding: "15px 0 0 0"}}>{subTitle}</div>
                <div style={{padding: "15px 0 25px 0", fontWeight: "bold", fontSize: 25}}>{value}</div>
            </div>
        </div>
    }
}
