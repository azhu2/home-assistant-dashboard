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
            const colorPct = this.props.invertColors ? 1 - pct : pct;
            const fillColor = new color.Color(
                255 * Math.min(1, (colorPct * 2)),
                255 * Math.min(1, 2 - colorPct * 2),
                0,
                96);
            const rotateDeg = Math.round(pct * 180);
            const positiveClipPathId = `show-clip-${this.props.entityID.getCanonicalized()}`;
            const negativeClipPathId = `hide-clip-${this.props.entityID.getCanonicalized()}`;

            background =
                <>
                    <svg viewBox='0 0 1 0.5' preserveAspectRatio='xMidYMax meet'>
                        <defs>
                            <clipPath id={positiveClipPathId}>
                                <rect
                                    x={0} y={0.5}
                                    width={1} height={0.5}
                                    transform={`rotate(${rotateDeg})`}
                                    transform-box='view-box' transform-origin='bottom'
                                />
                            </clipPath>
                            <clipPath id={negativeClipPathId}>
                                <rect
                                    x={0} y={0.5}
                                    width={1} height={0.5}
                                    transform={`rotate(${rotateDeg + 180})`}
                                    transform-box='view-box' transform-origin='bottom'
                                />
                            </clipPath>
                        </defs>

                        {/* Base circle */}
                        <circle cx='0.5' cy='0.5' r='0.5' fill={fillColor.rgbString(true)} clipPath={`url(#${positiveClipPathId}`} />
                        {/* Background circle */}
                        <circle cx='0.5' cy='0.5' r='0.5' fill='#eeeeee' clipPath={`url(#${negativeClipPathId}`} />
                        {/* Inner circle */}
                        <circle cx='0.5' cy='0.5' r='0.3' fill='white' />
                        {/* Needle */}
                        <path d='M0 0.5 L0.46 0.48 Q0.5 0.5 0.46 0.52 Z' fill='black'
                            transform={`rotate(${rotateDeg})`}
                            transform-box='view-box' transform-origin='bottom'
                        />
                    </svg>
                </>;
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

export class InversePercentGauge extends Gauge {
    render() {
        return (
            <NeedleGauge {...this.props} min={0} max={100} invertColors />
        )
    }
}
