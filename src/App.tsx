import * as _ from 'lodash';
import React from 'react';
import {inject, observer} from "mobx-react";
import {RecordStore} from "./record-store";
import {BrowserRouter, Switch, Route, HashRouter} from 'react-router-dom';
import {routes} from "./routes";
import {SideMenu} from "./side-menu";
import {LoadingPage} from "./loading-page";
import {ErrorPage} from "./error-page";
import {GatewayConfig} from "./gateway-config";


@inject('records', 'gatewayConfig')
@observer
export class App extends React.Component<{
  records?: RecordStore
  gatewayConfig?: GatewayConfig
},{}> {
  render() {
    return this.props.records.ready && this.props.gatewayConfig.ready ? <HashRouter>
      <div style={{height: '100%', width: '100%', maxWidth: 2000, display: "inline-block", position: 'relative', textAlign: 'left'}}>
        <div style={{position: 'absolute', top: 0, left: 0, bottom: 0, width: 89}}>
          <SideMenu/>
        </div>
        <div style={{position: 'absolute', top: 0, left: 90, bottom: 0, right:0, overflow: 'auto', borderRight: "1px solid #ebedf8"}}>
            <Switch>
              {
                routes.map(route => {
                  const PageComponent = route.component;
                  return <Route path={route.path}>
                    <PageComponent/>
                  </Route>
                })
              }
            </Switch>
        </div>
      </div>
    </HashRouter>
            : this.props.records.err || this.props.gatewayConfig.err ? <ErrorPage err={this.props.records.err || this.props.gatewayConfig.err}/>
            : <LoadingPage/>
  }
}
