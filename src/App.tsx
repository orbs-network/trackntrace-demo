import * as _ from 'lodash';
import React from 'react';
import {inject, observer} from "mobx-react";
import {RecordStore} from "./record-store";
import {BrowserRouter, Switch, Route, HashRouter} from 'react-router-dom';
import {routes} from "./routes";
import {SideMenu} from "./side-menu";
import {ItemStatusPage} from "./item-status-page";
import {OverviewPage} from "./overview-page";


export class App extends React.Component<{},{}> {
  render() {
    return <BrowserRouter>
      <div style={{height: '100%', width: '100%', position: 'relative'}}>
        <div style={{position: 'absolute', top: 0, left: 0, bottom: 0, width: 89}}>
          <SideMenu/>
        </div>
        <div style={{position: 'absolute', top: 0, left: 90, bottom: 0, right:0, overflow: 'auto'}}>

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
    </BrowserRouter>
  }
}
