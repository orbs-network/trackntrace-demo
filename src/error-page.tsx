import React from "react";
import {Alert, AlertTitle} from "@material-ui/lab";


export class ErrorPage extends React.Component<{err: Error}, {}> {

    render() {
        return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'left'}}>
            <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                We were unable to load the page at the moment. Please try again. <br/>
                <span style={{color: "#bebebe"}}><pre>Error: {this.props.err.toString()}</pre></span>
            </Alert>
        </div>
    }

}
