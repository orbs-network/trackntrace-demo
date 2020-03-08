import * as _ from 'lodash';

import React from "react";
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import {getCurrentRoute, IRoute, routes} from "./routes";
import {observer} from "mobx-react";
import { useHistory } from "react-router-dom";
import {observable} from "mobx";

function Link({onClick, className}) {
    const history = useHistory();
    return <div onClick={() => onClick(history)} style={{width: '100%', boxSizing: 'border-box', margin: 30}} className={className}/>;
}

@observer
export class SideMenu extends React.Component<{},{}> {

    @observable currentRoute = getCurrentRoute();

    render() {
        const className = (route: IRoute) => {
            return `menu-item menu-item-${route.cssClass} ${this.currentRoute.name == route.name ? 'selected' : ''}`
        };

        return <div className="side-menu" style={{height: '100%', width: '100%'}}>
            <style dangerouslySetInnerHTML={{__html:`
                .side-menu .menu-item-overview {
                    background-image: url(${process.env.REACT_APP_BASE_URL}/menu-overview.svg);
                }

                .side-menu .menu-item-overview.selected{
                    background-image: url(${process.env.REACT_APP_BASE_URL}/menu-overview-selected.svg);
                    border-right: 3px solid #3e4d73;
                }

                .side-menu .menu-item-overview:hover{
                    background-image: url(${process.env.REACT_APP_BASE_URL}/menu-overview-hovered.svg);
                }

                .side-menu .menu-item-item-status {
                    background-image: url(${process.env.REACT_APP_BASE_URL}/menu-item-status.svg);
                }

                .side-menu .menu-item-item-status.selected{
                    background-image: url(${process.env.REACT_APP_BASE_URL}/menu-item-status-selected.svg);
                    border-right: 3px solid #3e4d73;
                }

                .side-menu .menu-item-item-status:hover{
                    background-image: url(${process.env.REACT_APP_BASE_URL}/menu-item-status-hovered.svg);
                }
            `}}/>
            <div className='side-menu-orbs' style={{padding: 30, marginBottom: 20}}>
                <img style={{height: 32, width:32}} src='/orbs-logo.svg'/>
            </div>
            {
                _.sortBy(routes, r => r.displayIndex).map(
                    route => <Link
                        onClick={(history) => this.navigateTo(route, history)}
                        className={className(route)}
                    />
                )
            }
        </div>
    }

    navigateTo(route: IRoute, history: any) {
        history.push(route.path);
        this.currentRoute = route;
    }

    componentDidMount(): void {
        window.onpopstate = () => this.currentRoute = getCurrentRoute();
    }

    componentWillUnmount(): void {
        window.onpopstate = null;
    }
}
