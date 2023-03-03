import { Component, ContextType, ReactElement } from 'react';
import * as haEntity from '../../../entities/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as base from '../../base';
import * as tile from '../../tile/tile';
import './gauge.css';

type Props = base.BaseEntityProps & {
    state: string,
    unit?: string,
}

type State = {
    unsubFunc?: () => void,
    history?: haEntity.History,
    componentHeight?: number,
    componentWidth?: number,
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
        return {
            state: entity.state,
            unit: entity.attributes['unit_of_measurement'],
        };
    }

    render() {
        return this.renderHelper();
    }

    renderHelper(historyElement?: ReactElement) {
        return (
            <div className='gauge' id={this.props.entityID.getCanonicalized()}>
                <>
                    {historyElement}
                    {/* extra div so superscript works with flexbox used to vertical-center values */}
                    <div>
                        <span className='value'>{this.props.state}</span>
                        {this.props.unit && <span className='unit'>{this.props.unit || ''}</span>}
                    </div>
                </>
            </div>
        );
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
        this.buildBuckets = this.buildBuckets.bind(this);
    }

    componentDidMount() {
        if (!(this.context.websocketAPI instanceof Error)) {
            this.context.websocketAPI.subscribeHistory(
                this.props.entityID,
                history => this.setState({ ...this.state, history })
            ).then(unsubFunc =>
                this.setState({ ...this.state, unsubFunc })
            ).catch(err =>
                console.error(`Failed to set up history subscription for ${this.props.entityID.getCanonicalized()}`, err)
            );
        }
    }

    componentWillUnmount() {
        if (this.state.unsubFunc) {
            this.state.unsubFunc();
        }
    }

    buildBuckets(numBuckets: number): HistoryBucket[] {
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

        this.state.history?.forEach(entry => {
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

    render() {
        let svg;
        if (this.state.history) {
            // TODO Customizable how many buckets
            const buckets = this.buildBuckets(100);
            svg = buildSVG(buckets);
        }

        const historyElement = (
            <div className='history-background'>
                {svg}
            </div>
        );
        return this.renderHelper(historyElement);
    }
}

interface OverallStats {
    min?: number;
    max?: number;
    first?: number;
    last?: number;
}

const buildSVG = (buckets: HistoryBucket[]): ReactElement => {
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
        transform='scale(1, -1)'>
        <path d={pathStr} stroke='rgba(192, 192, 240, 128)' fill='rgba(240, 240, 255, 64)' />
    </svg>;
}
