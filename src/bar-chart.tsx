import * as _ from "lodash";
import React from "react";

const scale = 0.6;

function Bar(props: {
                 label: string,
                 value: number,
                 color: string,
                 image: string,
                 percent: number
             }) {
    const {label, value, color, image, percent} = props;

    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        margin: "0 3px"
    }}>
        <div style={{flex: 1, display: "flex", flexDirection:"column", alignContent: 'flex-end', paddingBottom: 5}}>
            <div style={{flex: 1}}/>
            <div style={{textAlign: 'center', fontSize: 40 * scale, paddingBottom: 3}}>{value}</div>
            <div style={{
                backgroundColor: color,
                height: `${Math.ceil(percent * 100)}%`
            }}/>
        </div>
        <div style={{
            height: 124 * scale + 10,
            width: 114 * scale,
            backgroundColor: "#e9e9e9",
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            fontSize: 16 * scale,
            color: "#060606"
        }}>
            <img src={image} alt={label} style={{paddingTop: 30*scale, paddingBottom: 5*scale}}/>
            <span style={{textAlign:'center', paddingBottom: 20*scale, wordBreak: 'break-all'}}>{label}</span>
        </div>
    </div>
}

export class BarChart extends React.Component<{
    labels: string[],
    values: number[],
    colors: string[],
    images: string[]
}, {}> {

    render() {
        const {labels, values, colors, images} = this.props;
        const maxValue = _.max(values);
        return <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center'
        }}>
            {labels.map(
                (l, i) => <Bar
                    label={labels[i]}
                    value={values[i]}
                    image={images[i]}
                    color={colors[i % colors.length]}
                    percent={maxValue == 0 ? 0 : values[i] / maxValue}
                />
            )}
        </div>
    }

}
