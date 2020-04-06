import React from "react";
import * as _ from "lodash";
import {inject, observer} from "mobx-react";
import {Statistics} from "./statistics";
import {observable, reaction} from "mobx";
import {Button, CircularProgress, DialogTitle, TablePagination, TextField} from "@material-ui/core";
import {Autocomplete, createFilterOptions} from "@material-ui/lab";
import {gatewayImage, partnerBrandImage, stageImage} from "./resources";
import {ScanRecord, stagesDisplay} from "./record";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import {GatewayConfig, IGatewayConfigRecord} from "./gateway-config";
import {OSAStats} from "./osa-stats";
import {RecordStore} from "./record-store";
import {BarChart} from "./bar-chart";
import {ErrorPage} from "./error-page";
import {Bar, Line} from 'react-chartjs-2';
import moment from "moment";
import {PageHeader} from "./page-header";
import {AlertsTable} from "./alerts-table";
import {OSAAlerts} from "./osa-alerts";

const twodigits = (n:number) => (n < 10 ? '0' : '') + n.toString();

const prettyFloat = (f: number) => `${Math.floor(f*10)/10}`;

const formatTurnoverTime = (tMs: number): string => {
    const MINUTE_MS = 60*1000;
    const HOUR_MS = 60*MINUTE_MS;
    const DAY_MS = 24*HOUR_MS;
    if (tMs < HOUR_MS) {
        const minutes = tMs / MINUTE_MS;
        return `${prettyFloat(minutes)} Minutes`
    }
    if (tMs < DAY_MS) {
        const hours = tMs / HOUR_MS;
        return `${prettyFloat(hours)} Hours`
    }

    const days = tMs / DAY_MS;
    return `${prettyFloat(days)} Days`

};

@inject("statistics", "gatewayConfig", "records", "osaAlerts")
@observer
export class OnShelfAvailabilityPage extends React.Component<{statistics: Statistics, gatewayConfig: GatewayConfig, records: RecordStore, osaAlerts: OSAAlerts}, {}> {

    @observable private ready = false;
    private currentTimeoutHandle;

    @observable selectedGatewayId: string;
    @observable osaStats: OSAStats;

    componentDidMount() {
        const first = this.props.gatewayConfig.customerRetailShelves[0];
        if (first) {
            this.selectedGatewayId = first.ID;
        }
        this.loadData();
    }

    loadData() {
        const gatewayId = this.selectedGatewayId;
        if (this.props.gatewayConfig.getFor(gatewayId) == null) {
            return;
        }

        this.ready = false;
        if (this.currentTimeoutHandle) {
            clearTimeout(this.currentTimeoutHandle);
        }
        this.currentTimeoutHandle = setTimeout(() => {
            this.ready = true;
            this.currentTimeoutHandle = null;
            this.osaStats = new OSAStats(gatewayId, this.props.records, this.props.statistics, this.props.gatewayConfig);
        }, 1000);
    }

    componentWillUnmount() {
        if (this.currentTimeoutHandle) {
            clearTimeout(this.currentTimeoutHandle);
        }
    }

    render() {
        if (this.props.gatewayConfig.customerRetailShelves.length == 0) {
            return <ErrorPage err={new Error("Gateway config does not appear to contain a shelf gateway. Please make sure there is at least one gateway with LocationType set to 'Customer Retail Shelf', and that the gateway is configured with a BackroomGatewayID. ")}/>
        }
        const turnoverTimeHistogram = this.osaStats ? this.osaStats.turnoverTimeHistogram(10) : null;
        return <div>
            <PageHeader title={"OSA Dashboard"}/>
            {!this.ready ?
                <div style={{padding: 10}}><CircularProgress/></div>
            : <div style={{width: 1200}}>
                <div style={{margin: "0 0 30px 30px"}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={{
                        fontWeight: 'bold',
                        fontSize: 21,
                        padding: '32px 15px 32px 0'
                    }}>Select a shelf gateway:</div>
                    <Autocomplete
                        options={this.props.gatewayConfig.customerRetailShelves.map(c => c.ID)}
                        getOptionLabel={(gwId) => {
                            const cfg = this.props.gatewayConfig.getFor(gwId);
                            return `${cfg.ID} ${ cfg.Alias ? `- ${cfg.Alias}` : ''}`;
                        }}
                        style={{width: 600}}
                        onChange={(e, value) => {
                            this.selectedGatewayId = value;
                            this.loadData();
                        }}
                        value={this.selectedGatewayId}
                        renderInput={params => <TextField {...params} label="Gateway ID" variant="outlined" />}
                    />
                    {!this.ready && <CircularProgress style={{marginLeft: 20}}/>}
                </div>
                { this.osaStats && <div>
                    <div style={{display: 'flex', flexDirection: 'row', paddingBottom: 20, borderBottom: '1px solid grey'}}>
                        <div style={{borderRight: "1px solid grey"}}>
                            {this.metricBox("ITEMS ON SHELF", "#1d6aac", process.env.REACT_APP_BASE_URL + '/inventory.svg', this.osaStats.itemCountAtGateway)}
                            {this.metricBox("ITEMS IN STOREROOM", "#008a91", process.env.REACT_APP_BASE_URL + '/mixingcenter.svg', this.osaStats.itemCountAtBackroom)}
                        </div>
                        <div style={{flex: 1, padding: "0 10px"}}>
                            <div style={{width: 800}}>
                                <Line
                                    data={{
                                        // labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                                        datasets: [
                                            {
                                                label: 'Shelf Item Count',
                                                fill: false,
                                                lineTension: 0.1,
                                                backgroundColor: 'rgba(75,192,192,0.4)',
                                                borderColor: 'rgba(75,192,192,1)',
                                                borderCapStyle: 'butt',
                                                borderDash: [],
                                                borderDashOffset: 0.0,
                                                borderJoinStyle: 'miter',
                                                pointBorderColor: 'rgba(75,192,192,1)',
                                                pointBackgroundColor: '#fff',
                                                pointBorderWidth: 1,
                                                pointHoverRadius: 5,
                                                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                                                pointHoverBorderColor: 'rgba(220,220,220,1)',
                                                pointHoverBorderWidth: 2,
                                                pointRadius: 1,
                                                pointHitRadius: 10,
                                                data: this.osaStats.gatewayItemCountHistory.map(x => ({t: x.time, y: x.count}))
                                            },
                                            {
                                                label: 'Storeroom Item Count',
                                                fill: false,
                                                lineTension: 0.1,
                                                backgroundColor: 'rgba(75,0,192,0.4)',
                                                borderColor: 'rgba(75,0,192,1)',
                                                borderCapStyle: 'butt',
                                                borderDash: [],
                                                borderDashOffset: 0.0,
                                                borderJoinStyle: 'miter',
                                                pointBorderColor: 'rgba(75,0,192,1)',
                                                pointBackgroundColor: '#fff',
                                                pointBorderWidth: 1,
                                                pointHoverRadius: 5,
                                                pointHoverBackgroundColor: 'rgba(75,0,192,1)',
                                                pointHoverBorderColor: 'rgba(220,0,220,1)',
                                                pointHoverBorderWidth: 2,
                                                pointRadius: 1,
                                                pointHitRadius: 10,
                                                data: this.osaStats.backroomItemCountHistory.map(x => ({t: new Date(x.time), y: x.count}))
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
                        </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', paddingTop: 20}}>
                        <div style={{padding: "0 10px", borderRight: "1px solid grey"}}>
                            <div style={{width: 300, backgroundColor: "#f8f8f8", margin: "50px 0"}}>
                                <div style={{textAlign: "center", padding: 20, fontWeight: 900, letterSpacing: '1.07px'}}>AVG TURNOVER TIME</div>
                                <div style={{textAlign: "center", padding: "40px 60px 60px 60px", fontWeight: 'bold', fontSize: 30}}>{formatTurnoverTime(this.osaStats.avgTurnoverTime)}</div>
                            </div>
                        </div>
                        <div style={{padding: "0 10px", width: 800, height: 300}}>
                            <div style={{textAlign: 'center', fontWeight: 'bold'}}>TURNOVER TIME (histogram)</div>
                            {/*<BarChart labels={_.range(10).map(s => s.toString())} values={this.osaStats.turnoverTimeHistogram(10).bins} colors={["black"]} images={[]}/>*/}
                            <Bar
                                data={{
                                    labels: _.range(turnoverTimeHistogram.bins.length).map((s, i) => '<'+formatTurnoverTime((i + 1)*turnoverTimeHistogram.binSize)),
                                    datasets: [
                                        {
                                            label: 'Turnover Time',
                                            backgroundColor: 'rgba(255,99,132,0.2)',
                                            borderColor: 'rgba(255,99,132,1)',
                                            borderWidth: 1,
                                            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                                            hoverBorderColor: 'rgba(255,99,132,1)',
                                            data: turnoverTimeHistogram.bins
                                        }
                                    ]
                                }}
                                width={800}
                                height={200}
                                options={{
                                    maintainAspectRatio: false,
                                    legend: {display: false},
                                    scales: {
                                        yAxes: [{
                                            ticks: {
                                                beginAtZero:true
                                            }
                                        }]
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div> }
                </div>
                <div style={{margin: "0 0 20px 20px", fontWeight: 'bold'}}> OSA Alerts </div>
                <AlertsTable alerts={this.props.osaAlerts.alerts}/>
            </div>}
        </div>
    }

    metricBox(title: string, color: string, iconUrl: string, count: number, style={}) {
        return <div style={{width: 300, padding: 10, letterSpacing: "1.07px", ...style}}>
            <div style={{backgroundColor: color, padding: 10, color: "white"}}>
                <img src={iconUrl} style={{verticalAlign: "middle", paddingRight: 20, width: 30}}/>
                <span style={{verticalAlign: "middle", fontSize: "0.8em"}}>{title}</span>
            </div>
            <div style={{
                backgroundColor: "#f8f8f8",
                textAlign: "center",
                padding: "20px 0",
                fontWeight: "bold",
                fontSize: 30
            }}>{count}</div>
        </div>
    }

}
