import React from "react";
import {BrowserRouter, Link} from "react-router-dom";
import {inject, observer} from "mobx-react";
import {Statistics} from "./statistics";
import {BarChart} from "./bar-chart";
import {toJS} from "mobx";
import {partnerBrandImage, stageImage} from "./resources";

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
    render() {
        const byPartner = this.props.statistics.itemCountByPartner;
        const partners = Object.keys(toJS(byPartner)).sort();
        const byStage = this.props.statistics.itemCountByStage;
        const stages = Object.keys(toJS(byStage)).sort();
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
                    <div className={"alerts"}>
                        <ul>
                            <li>This is the first alert</li>
                            <li>This is the second alert</li>
                            <li>This is the third alert</li>
                        </ul>
                        <table className={"alerts-table"}>
                            <tr>
                                <td>TIMESTAMP</td>
                                <td>ITEM ID</td>
                                <td>DESCRIPTION</td>
                            </tr>
                            {this.props.statistics.alerts.map(alert => <tr>
                                <td style={{whiteSpace: "nowrap"}}>{alert.timestamp.toDateString()}</td>
                                <td style={{whiteSpace: "nowrap"}}>{alert.itemId}</td>
                                <td style={{width: "100%"}}>{alert.description}</td>
                            </tr>)}
                        </table>
                    </div>
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
