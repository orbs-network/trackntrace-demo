import React from "react";

export const PageHeader = ({title}) => <div style={{
    height: 96,
    borderBottom: '1px solid #ebedf8',
    fontWeight: "bold",
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 20
}}>
    <div>{title}</div>
</div>
