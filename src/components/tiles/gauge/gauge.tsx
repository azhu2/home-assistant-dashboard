import { Component, ContextType, ReactElement } from 'react';
import * as color from '../../../types/color';
import * as haEntity from '../../../types/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as base from '../../base';
import * as tile from '../../tile/tile';
import './gauge.css';

type Props = base.BaseEntityProps & {
    state: string | number,
    unit?: string,
}

type State = {
    unsubFunc?: () => void,
    history?: haEntity.History,
}

const initialState: State = {
    unsubFunc: undefined,
    history: undefined,
}

export class Gauge extends Component<Props, State> implements tile.MappableProps<Props>{
    constructor(props: Props) {
        super(props);
        this.renderHelper = this.renderHelper.bind(this);
    }

    propsMapper(entity: haEntity.Entity): tile.MappedProps<Props> {
        let state: string | number = entity.state;
        if (!Number.isNaN(parseFloat(state))) {
            state = parseFloat(state);
        }
        return {
            state: state,
            unit: entity.attributes['unit_of_measurement'],
        };
    }

    render() {
        return this.renderHelper();
    }

    renderHelper(background?: ReactElement) {
        return (
            <div className='gauge' id={this.props.entityID.getCanonicalized()}>
                <>
                    <div className='background'>
                        {background}
                    </div>
                    {/* extra div so superscript works with flexbox used to vertical-center values */}
                    <div className='value-container'>
                        <span className='value'>{this.props.state}</span>
                        {this.props.unit && <span className='unit'>{this.props.unit || ''}</span>}
                    </div>
                </>
            </div>
        );
    }
}

export class PercentGauage extends Gauge {
    render() {
        let background;
        if (typeof this.props.state === 'number') {
            const pct = this.props.state / 100;

            /*
             * Green -> Yellow -> Red scaling scheme
             * pct 0.0 -> 0.5 -> 1.0
             * r   0   -> 255 -> 255
             * g   255 -> 255 -> 0
             */
            const fillColor = new color.Color(
                Math.min(255, 256 * Math.min(1, (pct * 2))),
                Math.min(255, 256 * Math.min(1, (2 - pct * 2))),
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
                        transform={`rotate(-${Math.trunc((1 - pct) * 180)})`}
                        transform-box='view-box' transform-origin='bottom'
                    />
                    {/* Needle */}
                    <path d='M0 0.5 L0.46 0.48 Q0.5 0.5 0.46 0.52 Z' fill='black'
                        transform={`rotate(${Math.trunc(pct * 180)})`}
                        transform-box='view-box' transform-origin='bottom'
                    />
                </svg>;
        }

        return this.renderHelper(background);
    }
}

interface HistoryBucket {
    start: Date;
    max?: number;
    min?: number;
    avg?: number;
}

export class HistoryGauge extends Gauge {
    context!: ContextType<typeof authContext.AuthContext>
    static contextType = authContext.AuthContext;

    constructor(props: Props) {
        super(props);
        this.state = { ...initialState };
    }

    componentDidMount() {
        if (!(this.context.websocketAPI instanceof Error)) {
            const collection = this.context.websocketAPI.subscribeHistory(this.props.entityID);
            const unsubFunc = collection.subscribe(history => this.setState({ ...this.state, history }))
            this.setState({ ...this.state, unsubFunc });
        }
    }

    componentWillUnmount() {
        if (this.state.unsubFunc) {
            this.state.unsubFunc();
        }
    }

    render() {
        let svg;
        if (this.state.history) {
            // TODO Customizable how many buckets
            const buckets = buildBuckets(this.state.history, 100);
            svg = buildHistorySVG(buckets);
        }

        return this.renderHelper(svg);
    }
}

const buildBuckets = (history: haEntity.History, numBuckets: number): HistoryBucket[] => {
    let buckets = new Array<HistoryBucket>(numBuckets);
    // TODO Dynamic time ranges
    const timeRangeMs = 24 * 60 * 60 * 1000;
    const bucketWidthMs = timeRangeMs / numBuckets;
    const startMs = Date.now() - timeRangeMs;

    let curIdx = 0;
    let curMin: number | undefined = undefined;
    let curMax: number | undefined = undefined;
    let curSum = 0;
    let curCnt = 0;

    history.forEach(entry => {
        if (typeof entry.value !== 'number') {
            // Can't graph
            return;
        }
        if (entry.timestamp.getTime() < startMs) {
            // Before time range
            return;
        }
        if (entry.timestamp.getTime() > startMs + (curIdx + 1) * bucketWidthMs) {
            // Aggregate previous bucket
            buckets[curIdx] = {
                start: new Date(startMs + curIdx * bucketWidthMs),
                min: curMin,
                max: curMax,
                avg: curCnt > 0 ? curSum / curCnt : undefined,
            };

            // Clear current bucket
            curIdx++;
            curMin = undefined;
            curMax = undefined;
            curSum = 0;
            curCnt = 0;
        }
        // Add value to current bucket
        if (!curMin || entry.value < curMin) {
            curMin = entry.value;
        }
        if (!curMax || entry.value > curMax) {
            curMax = entry.value;
        }
        curSum += entry.value;
        curCnt++;
    });
    // Aggregate last bucket TODO DRY
    buckets[curIdx] = {
        start: new Date(startMs + curIdx * bucketWidthMs),
        min: curMin,
        max: curMax,
        avg: curCnt > 0 ? curSum / curCnt : undefined,
    };

    return buckets;
}

interface OverallStats {
    min?: number;
    max?: number;
    first?: number;
    last?: number;
}

const buildHistorySVG = (buckets: HistoryBucket[]): ReactElement => {
    const overall = buckets
        .map(entry => entry.avg)
        .filter((val): val is number => !!val)
        .reduce<OverallStats>((overall, val) => {
            let changes = {};
            if (!overall.first) {
                changes = { ...changes, first: val };
            }
            if (!overall.min || val < overall.min) {
                changes = { ...changes, min: val };
            }
            if (!overall.max || val > overall.max) {
                changes = { ...changes, max: val };
            }
            changes = { ...changes, last: val };
            return { ...overall, ...changes };
        }, {});
    if (!overall.first || !overall.last || !overall.min || !overall.max) {
        return <>Error - no history</>;
    }

    // Start path outside viewbox, lift up to first datapoint
    let pathStr = `M-1,0 L0,${overall.first} `;
    buckets.forEach((bucket, idx) => {
        if (bucket.avg) {
            pathStr += `L${idx},${bucket.avg}`
        }
    });
    // Close path outside viewbox
    pathStr += `L${buckets.length},${overall.last} L${buckets.length},0 Z`

    // Use 0 baseline if no negative values
    const min = overall.min < 0 ? overall.min : 0;
    return <svg
        // Set viewbox based on data and let viewport resize
        viewBox={`0 ${min} ${buckets.length - 1} ${overall.max - min}`}
        preserveAspectRatio='none'
        // Flip since built with 0 as baseline (bottom)
        transform='scale(1, -1)'
    >
        <path
            className='history'
            d={pathStr}
            vectorEffect='non-scaling-stroke'
        />
    </svg>;
}
