import * as color from '../../../types/color';
import { Gauge } from './gauge';


export class NeedleGauge extends Gauge {
    render() {
        let background;
        if (typeof this.props.state === 'number' &&
            typeof this.props.min === 'number' &&
            typeof this.props.max === 'number') {
            const pct = Math.max(0, Math.min(1, (this.props.state - this.props.min) / (this.props.max - this.props.min)));

            /*
             * Green -> Yellow -> Red scaling scheme
             * pct 0.0 -> 0.5 -> 1.0
             * r   0   -> 255 -> 255
             * g   255 -> 255 -> 0
             */
            const fillColor = new color.Color(
                255 * Math.min(1, (pct * 2)),
                255 * Math.min(1, 2 - pct * 2),
                0,
                64);

            background =
                <svg viewBox='0 0 1 0.5'>
                    {/* Base circle */}
                    <circle cx='0.5' cy='0.5' r='0.5' fill={fillColor.rgbString(true)} />
                    {/* Inner circle */}
                    <circle cx='0.5' cy='0.5' r='0.3' fill='white' />
                    {/* Cover unused part of dial with rotated rectangle */}
                    <rect
                        x='0' y='0.5' width='1.5' height='0.5' fill='white'
                        transform={`rotate(-${Math.round((1 - pct) * 180)})`}
                        transform-box='view-box' transform-origin='bottom'
                    />
                    {/* Needle */}
                    <path d='M0 0.5 L0.46 0.48 Q0.5 0.5 0.46 0.52 Z' fill='black'
                        transform={`rotate(${Math.round(pct * 180)})`}
                        transform-box='view-box' transform-origin='bottom'
                    />
                </svg>;
        }

        return this.renderHelper(background);
    }
}

export class PercentGauge extends Gauge {
    render() {
        return (
            <NeedleGauge {...this.props} min={0} max={100} />
        )
    }
}
