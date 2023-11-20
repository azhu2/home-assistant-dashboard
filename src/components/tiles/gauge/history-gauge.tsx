import { ContextType, ReactElement } from 'react';
import * as haEntity from '../../../types/ha-entity';
import * as authContext from '../../../services/auth-context';
import { Gauge } from './gauge';
import * as gauge from './gauge';

interface HistoryBucket {
    start: Date;
    max?: number;
    min?: number;
    avg?: number;
}

export class HistoryGauge extends Gauge {
    context!: ContextType<typeof authContext.AuthContext>
    static contextType = authContext.AuthContext;

    constructor(props: gauge.Props) {
        super(props);
        this.state = { ...gauge.initialState };
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
        if (this.state.history) {
            // TODO Customizable how many buckets
            const buckets = buildBuckets(this.state.history, 100);
            const overall = buildOverallStats(buckets);
            if (overall) {
                const graph = buildHistoryGraph(buckets, overall, this.props.setBaselineToZero || false);
                return this.renderHelper(graph);
            }
        }
        return this.renderHelper();
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
        const ts = entry.timestamp.getTime();
        if (typeof entry.value !== 'number') {
            // Can't graph
            return;
        }
        if (ts < startMs) {
            // Before time range
            return;
        }
        if (ts > startMs + (curIdx + 1) * bucketWidthMs) {
            // Aggregate previous bucket
            buckets[curIdx] = {
                start: new Date(startMs + curIdx * bucketWidthMs),
                min: curMin,
                max: curMax,
                avg: curCnt > 0 ? curSum / curCnt : undefined,
            };

            // Clear current bucket
            curIdx = Math.floor((ts - startMs) / bucketWidthMs);
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
    min: number;
    max: number;
    first?: number;
    last?: number;
}

const buildOverallStats = (buckets: HistoryBucket[]): OverallStats => {
    return buckets
        .reduce<OverallStats>((overall, val) => {
            if (val.avg === undefined || val.max === undefined || val.min === undefined) {
                return overall;
            }
            let changes = {};
            if (!overall.first) {
                changes = { ...changes, first: val.avg };
            }
            if (!overall.min || val.min < overall.min) {
                changes = { ...changes, min: val.min };
            }
            if (!overall.max || val.max > overall.max) {
                changes = { ...changes, max: val.max };
            }
            changes = { ...changes, last: val.avg };
            return { ...overall, ...changes };
        }, {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
        });
}

const buildHistoryGraph = (buckets: HistoryBucket[], overall: OverallStats, zeroBaseline: boolean): ReactElement => {
    if (!overall.first || !overall.last || !overall.min || !overall.max) {
        return <>Error - no history</>;
    }

    const baseline = zeroBaseline ? 0 : overall.min;

    // Start path outside viewbox, lift up to first datapoint
    let pathStr = `M-1,${baseline - 1} L0,${overall.first} `;
    buckets.forEach((bucket, idx) => {
        if (bucket.avg) {
            pathStr += `L${idx},${bucket.avg}`
        }
    });
    // Close path outside viewbox
    pathStr += `L${buckets.length},${overall.last} L${buckets.length},${baseline - 1} Z`

    return <>
        <div className='graph-label max'>{Math.round(overall.max)}</div>
        <svg
            // Set viewbox based on data and let viewport resize
            viewBox={`0 ${baseline} ${buckets.length - 1} ${overall.max - baseline}`}
            preserveAspectRatio='none'
            // Flip since built with 0 as baseline (bottom)
            transform='scale(1, -1)'
        >
            <path
                className='history'
                d={pathStr}
                vectorEffect='non-scaling-stroke'
            />
        </svg>
        <div className='graph-label min'>{Math.round(baseline)}</div>
    </>;
}