import React from "react";
import {BrowserRouter, Link} from "react-router-dom";
import {inject, observer} from "mobx-react";
import {Statistics} from "./statistics";
import {BarChart} from "./bar-chart";
import {toJS} from "mobx";

class Databox extends React.Component<{
    title: string,
    infoText: string|number
}, {}> {

    render() {
        return <div className={'databox'}>
            <div className={'databox-title'}>{this.props.title}</div>
            <div className={'databox-infotext'}>
                <span>{this.props.infoText}</span>
            </div>
        </div>
    }

}

@inject('statistics')
@observer
export class OverviewPage extends React.Component<{
    statistics: Statistics
}, {}> {
    render() {
        const byPartner = this.props.statistics.itemCountByPartner;
        const partners = Object.keys(toJS(byPartner)).sort();
        const byStage = this.props.statistics.itemCountByStage;
        const stages = Object.keys(toJS(byStage)).sort();
        return <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
        }}>
            <div style={{display: 'flex', flexDirection:'column', flex: 1}}>
                <div style={{
                    // borderRight: '1px solid #ebedf8',
                    display: "flex",
                    flexDirection: "row"
                }}>
                    <div style={{flex: 1, borderRight: '1px solid #ebedf8',}}>
                        <div className="title" style={{
                            height: 96,
                            borderBottom: '1px solid #ebedf8',
                        }}>
                            <span>Products by stage</span>
                        </div>
                        <div style={{height: 300, padding: 20, marginLeft: 50, borderBottom: '1px solid #ebedf8'}}>
                            <BarChart
                                colors={["#035093", "#035093", "#4889c2", "#0a4171"]}
                                images={stages.map(() => '/orbs-logo.svg')}
                                labels={stages}
                                values={stages.map(stage => byStage[stage])}
                            />
                        </div>
                    </div>
                    <div style={{flex: 1}}>
                        <div className="title" style={{
                            height: 96,
                            borderBottom: '1px solid #ebedf8',
                            // borderTop: '1px solid #ebedf8',
                        }}>
                            <span>Products by partner</span>
                        </div>
                        <div style={{height: 300, padding: 20, borderBottom: '1px solid #ebedf8'}}>
                            <BarChart
                                colors={["#bb8888", "#a37878", "#d19d9d", "#bb8888"]}
                                images={partners.map(() => '/orbs-logo.svg')}
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
                    <div className={"alerts"}>
                        <ul>
                            <li>This is the first alert</li>
                            <li>This is the second alert</li>
                            <li>This is the third alert</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div style={{
                width: 500,
                height: '100%',
                letterSpacing: 1.13,
                fontSize: 19,
                borderLeft: '1px solid #ebedf8',
            }}>
                {this.renderDataSection()}
            </div>
        </div>
    }

    private renderDataSection() {
        const {statistics} = this.props;
        return <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className={"title"} style={{
                height: 96,
                width: '100%',
                borderBottom: '1px solid #ebedf8',
            }}><span>Data</span></div>
            <div style={{margin:30}}>
                <table className={'data-table'}>
                    <tr>
                        <td className={'border-right border-bottom'}><Databox title={"Alerted Products"} infoText={statistics.itemUIDs.length}/></td>
                        <td className={'border-left border-bottom'}><Databox title={"Avg. Time in pipeline"} infoText={Math.floor(statistics.avgPiplineTimePerItemInDays)}/></td>
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
                    margin: '70px 0'
                }}>
                    Route Tracking
                </div>
                <img src="/worldmap.svg" style={{width: '100%'}} alt="Route tracking"/>
            </div>
        </div>
    }
}
