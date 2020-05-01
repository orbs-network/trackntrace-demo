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

@inject("gatewayConfig", "records")
@observer
export class SettingsPage extends React.Component<{ gatewayConfig: GatewayConfig, records: RecordStore}, {}> {

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
        return <div>
            <style dangerouslySetInnerHTML={{__html:`
                .gw-conf-table {
                  border-collapse: collapse;
                  margin: 20px 0;
                }
                
                .gw-conf-table tr:first-child {
                    font-weight: bold;
                }
                
                .gw-conf-table td {
                    border: 1px solid;
                    padding: 5px;
                }
            `}}/>
            <PageHeader title={"Settings"}/>
            {!this.ready ?
                <div style={{padding: 10}}><CircularProgress/></div>
            : <div style={{width: 1200, padding: 20}}>
                    <b> Gateway Configuration </b><br/>
                    <table className={"gw-conf-table"}>
                        <tr>
                            <td>Gateway ID</td>
                            <td>Alias</td>
                            <td>Location Category</td>
                            <td>Site Category</td>
                            <td>Backroom Gateway ID</td>
                        </tr>
                        {
                            this.props.gatewayConfig.all().map(c => <tr>
                                <td>{c.ID}</td>
                                <td>{c.Alias}</td>
                                <td>{c.LocationCategory}</td>
                                <td>{c.SiteCategory}</td>
                                <td>{c.BackroomGatewayId}</td>
                            </tr>)
                        }
                    </table>
                    <div>
                        To set a different gateway configuration, upload a CSV file in the specified format.
                        This can be done using the <pre style={{display: 'inline-block'}}>aws-cli</pre> tool and the provided AWS credentials:
                        <div style={{border: "1px solid", backgroundColor: "#dfdfdf", display: "inline-block", padding: 5, fontFamily: ""}}>
                            export AWS_ACCESS_KEY_ID=<i>Your AWS_ACCESS_KEY_ID</i> <br/>
                            export AWS_SECRET_ACCESS_KEY=<i>Your AWS_SECRET_ACCESS_KEY</i> <br/>
                            export AWS_DEFAULT_REGION=us-west-2 <br/><br/>
                            aws s3 cp /path/to/local/gateway-config.csv s3://trackntrace-config/gw-conf.csv <br/>
                        </div>
                        <br/>
                        <br/>
                        Note: the page must be refreshed for changes to take effect.
                        <br/>
                        <br/>
                    </div><br/>
                    <b>Scan Records</b><br/>
                    <div style={{display: "flex", flexDirection: "row", alignItems: "baseline"}}>
                        <div style={{marginRight: 10}}>The system detected {this.props.records.records.length} item scan records.</div>
                        <Button variant="contained"  onClick={() => this.deleteAllRecordsClicked()} color="secondary" style={{marginTop: 20}}>
                            DELETE ALL SCAN RECORDS
                        </Button>
                    </div>
            </div>}
        </div>
    }

    private deleteAllRecordsClicked() {
        if (window.confirm("Are you sure you want to delete all scan records?")) {
            fetch("https://png-collector.herokuapp.com/clearAllEvents?iamsure=YES", {
                method: "POST",
            })
        }
    }
}
