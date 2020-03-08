import * as _ from "lodash";
import React from "react";

const scale = 0.6;

class Bar extends React.Component<{
                 label: string,
                 value: number,
                 color: string,
                 image: string,
                 percent: number
             }, {}> {

    toRunOnMount = [];

    componentDidMount() {
        const fs = this.toRunOnMount;
        this.toRunOnMount = null;
        fs.forEach(f => f());
    }

    runOnMount(f) {
        if (this.toRunOnMount == null) {
            f();
        } else {
            this.toRunOnMount.push(f);
        }
    }

    render() {
        const {label, value, color, image, percent} = this.props;

        return <div style={{
            display: 'flex',
            flexDirection: 'column',
            margin: "0 3px"
        }}>
            <div
                style={{flex: 1, display: "flex", flexDirection: "column", alignContent: 'flex-end', paddingBottom: 5}}>
                <div style={{flex: 1}}/>
                <div style={{textAlign: 'center', fontSize: 40 * scale, paddingBottom: 3}}>{value}</div>
                <div style={{
                    backgroundColor: color,
                    height: 0,
                    transition: 'height 1s'
                }} ref={e => this.runOnMount(() => {
                    setTimeout(() => {
                        if (e) e.style.height = `${Math.ceil(percent * 100)}%`
                    }, 10);
                })}/>
            </div>
            <div style={{
                height: 124 * scale + 10,
                width: 114 * scale,
                backgroundColor: "#e9e9e9",
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                fontSize: 16 * scale,
                color: "#060606",
                alignItems: 'center'
            }}>
                <div style={{
                    height: 70 * scale,
                    minHeight: 70 * scale,
                    width: 70 * scale,
                    minWidth: 70 * scale,
                    marginTop: 20 * scale,
                    backgroundImage: `url(${image})`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                }}/>
                <span style={{
                    textAlign: 'center',
                    paddingTop: 5,
                    paddingBottom: 20 * scale,
                    wordBreak: 'break-word'
                }}>{label}</span>
            </div>
        </div>
    }
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
            {/*{[labels[0], labels[1], labels[2], labels[3]].map(*/}
            {/*    (l, i) => <Bar*/}
            {/*        label={labels[i]}*/}
            {/*        value={values[i]}*/}
            {/*        image={images[i]}*/}
            {/*        color={colors[i % colors.length]}*/}
            {/*        percent={maxValue == 0 ? 0 : values[i] / maxValue}*/}
            {/*    />*/}
            {/*)}*/}
        </div>
    }

}
