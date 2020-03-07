import React from "react";
import * as _ from "lodash";
import {observer} from "mobx-react";
import {observable} from "mobx";

@observer
export class LoadingPage extends React.Component<{}, {}> {

    @observable loadingCaption = "Loading...";

    render() {
        return <div className={"loading-page"}>
            <div className={"logo-container"}>
                <div style={{
                    height: '100%',
                    width: '100%',
                    textAlign: 'center'
                }}><img className={"orbs-logo"} src={"/orbs-logo.svg"}/></div>
                <div className={"loading-lbl"}>{this.loadingCaption}</div>
            </div>
        </div>
    }

    componentDidMount() {
        let i = 0;
        setInterval(() => {
            this.loadingCaption = "Loading" + _.range(i).map(() => '.').join('');
            i = (i + 1) % 4;
        }, 500)
    }
}
