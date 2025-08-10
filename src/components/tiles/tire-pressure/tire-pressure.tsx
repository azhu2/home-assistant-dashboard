import { Component } from 'react';
import * as color from '../../../types/color';
import * as formatter from '../../../types/formatter';
import * as haEntity from '../../../types/ha-entity';
import * as base from '../../base';
import * as tile from '../../tile/tile';
import './tire-pressure.css';

export type Props = base.BaseEntityProps & {
    /** pressures are the first 4 entities of options.secondaryEntities. Order: RF, LF, RR, LR. -1 indicates unavailable. */
    pressures: number[],
    /** targetPressures are the second 4 entities of options.secondaryEntities. Order: RF, LF, RR, LR. -1 indicates unavailable. */
    targetPressures: number[],
}

export class TirePressure extends Component<Props, {}> implements tile.MappableProps<Props> {
    propsMapper(_: haEntity.Entity, options: tile.Options): tile.MappedProps<Props> {
        if (!options.secondaryEntities || options.secondaryEntities?.length !== 8) {
            return {
                pressures: [],
                targetPressures: [],
            }
        }
        return {
            pressures: options.secondaryEntities.slice(0, 4).map(e => e.state).map(s => Number.isNaN(s) ? -1 : Number(s)),
            targetPressures: options.secondaryEntities.slice(4).map(e => e.state).map(s => Number.isNaN(s) ? -1 : Number(s)),
        };
    }

    render() {
        const valid = this.props.pressures.concat(this.props.targetPressures).every(p => p >= 0);

        if (!valid) {
            return (
                <div className={`tire-pressure ${!valid && 'tire-pressure-invalid'}`}></div>
            )
        }

        return (
            <div className='tire-pressure'
                id={`tire-pressure-${this.props.entityID.getCanonicalized()}`}
            >
                <svg viewBox='0 0 1 1'>
                    <Tire label='left-front' pressure={this.props.pressures[0]} targetPressure={this.props.targetPressures[0]}></Tire>
                    <Tire label='right-front' pressure={this.props.pressures[1]} targetPressure={this.props.targetPressures[1]}></Tire>
                    <Tire label='left-rear' pressure={this.props.pressures[2]} targetPressure={this.props.targetPressures[2]}></Tire>
                    <Tire label='right-rear' pressure={this.props.pressures[3]} targetPressure={this.props.targetPressures[3]}></Tire>
                </svg>
            </div>
        );
    }
}

type TireProps = {
    label: string,
    pressure: number,
    targetPressure: number,
}

const Tire = (p: TireProps) => (
    <>
        <rect className={`tire ${p.label}`}
            width='0.15'
            height='0.3'
            fill={statusColor(p.pressure, p.targetPressure).rgbString(true)}
        >
            <title>
                {formatter.WithPrecision(1)(p.pressure)}
                /
                {formatter.WithPrecision(1)(p.targetPressure)}
            </title>
        </rect>
    </>
);

// TODO Extract common logic shared with needleGauge
const statusColor = (state: number, exp: number): color.Color => {
    const pct = Math.max(0, Math.min(1, state / exp));

    /*
        * Green -> Yellow -> Red scaling scheme
        * pct 0.0 -> 0.5 -> 1.0
        * r   0   -> 255 -> 255
        * g   255 -> 255 -> 0
    */

    // Copy invert color functionality
    const colorPct = 1 - pct;
    return new color.Color(
        255 * Math.min(1, (colorPct * 2)),
        255 * Math.min(1, 2 - colorPct * 2),
        0,
        96);
}
