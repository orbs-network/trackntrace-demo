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
import {gatewayImage, partnerBrandImage, stageImage} from "./resources";
import {TablePagination} from "@material-ui/core";
import {stages, stagesDisplay} from "./record";

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

@inject('statistics')
@observer
export class OverviewPage extends React.Component<{
    statistics: Statistics
}, {}> {
    @observable private rowsPerPage: number = 5;
    @observable private page: number = 0;
    render() {
        const byGateway = this.props.statistics.itemCountByGatewayAlias;
        const gateways = _.reverse(Object.keys(toJS(byGateway)).sort());

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
                                images={gateways.map(gateway => gatewayImage(gateway))}
                                labels={gateways}
                                values={gateways.map(gateway => byGateway[gateway])}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{
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
                        <td className={'border-right border-bottom'}><Databox title={"Alerted Products"} data={statistics.alertedItems.length}/></td>
                        <td className={'border-left border-bottom'}><Databox title={"Avg. Time in pipeline"} data={statistics.avgPiplineTimePerItemInDays} subText={"DAYS"} decimals={1}/></td>
                    </tr>
                    <tr>
                        <td className={'border-right border-top'}><Databox title={"Suspected counterfeit"} data={0}/></td>
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
