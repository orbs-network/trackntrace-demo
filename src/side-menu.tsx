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
