import { ReactElement } from 'react';
import * as haEntity from '../../types/ha-entity';
import './graph.css';

type CommonOptions = {
    numBuckets: number;
    setBaselineToZero?: boolean;
}

export type GraphOptions = CommonOptions & {
    showLabels?: boolean;
    xAxisGridIncrement?: number;
    yAxisGridIncrement?: number;
}

/**
 * Builds a <svg> element for a history graph of an
 * @param series Built by buildHistoryGraphSeries
 */
export const buildHistoryGraph = (series: SeriesResult[], options: GraphOptions): ReactElement => {
    const overall = series.map(s => s.overall).reduce((acc: OverallStats, cur: OverallStats) => ({
        min: Math.min(acc.min, cur.min),
        max: Math.max(acc.max, cur.max),
    }), {
        min: Number.MAX_VALUE,
        max: Number.MIN_VALUE,
    })

    const baseline = options.setBaselineToZero ? 0 : overall.min;

    let gridlines: ReactElement[] = [];
    if (options.xAxisGridIncrement && options.xAxisGridIncrement > 0) {
        const inc = options.xAxisGridIncrement;
        for (let i = inc; i < options.numBuckets; i += inc) {
            gridlines = [
                ...gridlines,
                <line
                    className='gridline vertical'
                    x1={i} y1={baseline}
                    x2={i} y2={overall.max} />
            ];
        }
    }
    if (options.yAxisGridIncrement && options.yAxisGridIncrement > 0) {
        const inc = options.yAxisGridIncrement;
        for (let i = Math.floor((baseline + inc) / inc) * inc; i < overall.max; i += inc) {
            gridlines = [
                ...gridlines,
                <line
                    className='gridline vertical'
                    x1={0} y1={i}
                    x2={options.numBuckets} y2={i} />
            ];
        }
    }

    return <>
        {options?.showLabels && <div className='graph-label max'>{Math.round(overall.max)}</div>}
        <svg
            // Set viewbox based on data and let viewport resize
            viewBox={`0 ${baseline} ${options.numBuckets - 1} ${overall.max - baseline}`}
            preserveAspectRatio='none'
            // Flip since built with 0 as baseline (bottom)
            transform='scale(1, -1)'
        >
            {gridlines}
            {series.map(s => s.series)}
        </svg>
        {options?.showLabels && <div className='graph-label min'>{Math.round(baseline)}</div>}
    </>;
}

export interface SeriesResult {
    series: ReactElement;
    overall: OverallStats;
}

export type SeriesOptions = CommonOptions & {
    filled?: boolean;
}

/**
 * Builds the svg <path> element for a single series for a history graph.
 * Use buildHistoryGraph to build the entire <svg> element.
 * This utility doesn't build the entire graph in case there are multiple series.
 */
export const buildHistoryGraphSeries = (entityID: haEntity.EntityID | string, history: haEntity.History, options?: SeriesOptions): SeriesResult => {
    const buckets = buildBuckets(history, options?.numBuckets || 100);
    const overall = buildOverallStats(buckets);
    return {
        series: buildSvg(entityID, buckets, overall, options?.setBaselineToZero || false, options?.filled || false),
        overall,
    };
}

interface HistoryBucket {
    start: Date;
    max?: number;
    min?: number;
    avg?: number;
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

export interface OverallStats {
    min: number;
    max: number;
    first?: number;
    last?: number;
}

const buildOverallStats = (buckets: HistoryBucket[]): OverallStats => {
    return buckets
        .reduce<OverallStats>((overall, val) => {
            if (val.avg === undefined) {
                return overall;
            }
            let changes = {};
            if (!overall.first) {
                changes = { ...changes, first: val.avg };
            }
            if (!overall.min || val.avg < overall.min) {
                changes = { ...changes, min: val.avg };
            }
            if (!overall.max || val.avg > overall.max) {
                changes = { ...changes, max: val.avg };
            }
            changes = { ...changes, last: val.avg };
            return { ...overall, ...changes };
        }, {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
        });
}

const buildSvg = (e: haEntity.EntityID | string, buckets: HistoryBucket[], overall: OverallStats, zeroBaseline: boolean, filled: boolean): ReactElement => {
    if (!overall.first || !overall.last || !overall.min || !overall.max) {
        return <>Error - no history</>;
    }

    const baseline = zeroBaseline ? 0 : overall.min;

    // Start path outside viewbox, lift up to first datapoint
    // -10 is meant to account for series with different baseliens but may sometimes fail
    let pathStr = `M-1,${baseline - 10} L0,${overall.first} `;
    buckets.forEach((bucket, idx) => {
        if (bucket.avg) {
            pathStr += `L${idx},${bucket.avg}`
        }
    });
    // Close path outside viewbox
    pathStr += `L${buckets.length},${overall.last} L${buckets.length},${baseline - 10} Z`

    const entityID = typeof (e) === 'string' ? e : e.getCanonicalized()

    return (
        <path
            className={`history history-${entityID.replaceAll('.', '-')} ${filled && 'filled'}`}
            key={entityID}
            d={pathStr}
            vectorEffect='non-scaling-stroke'
        />
    );
}