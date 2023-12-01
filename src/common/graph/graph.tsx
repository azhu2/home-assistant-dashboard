import { ReactElement } from 'react';
import * as haEntity from '../../types/ha-entity';
import './graph.css';

type SeriesOptions = {
    numBuckets: number;
    setBaselineToZero?: boolean;
}

export type GraphOptions = SeriesOptions & {
    showLabels?: boolean;
    xAxisGridIncrement?: number;
    yAxisGridIncrement?: number;
}

/**
 * Builds a <svg> element for a history graph of an
 * @param series Built by buildHistoryGraphSeries
 */
export const buildHistoryGraph = (series: SeriesData[], options: GraphOptions): ReactElement => {
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
                    key={`gridline-vertical-${i}`}
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
                    className='gridline horizontal'
                    key={`gridline-horizontal-${i}`}
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
            {series.map(s => {
                const entityID = typeof (s.entityID) === 'string' ? s.entityID : s.entityID.getCanonicalized();

                return (
                    <path
                        className={
                            `history history-${entityID.replaceAll('.', '-')}
                            ${s.filled && 'filled'}
                            ${s.focused && 'focused'}`
                        }
                        key={entityID}
                        d={s.seriesPath}
                        vectorEffect='non-scaling-stroke'
                    />
                );
            })}
        </svg>
        {options?.showLabels && <div className='graph-label min'>{Math.round(baseline)}</div>}
    </>;
}

export interface SeriesData {
    entityID: haEntity.EntityID | string;
    seriesPath: string;
    overall: OverallStats;
    label?: string;
    filled?: boolean;
    focused?: boolean;
}

/**
 * Builds the d parameter for the svg <path> element for a single series for a history graph.
 * Use buildHistoryGraph to build the entire <svg> element.
 * This utility doesn't build the entire graph in case there are multiple series.
 */
export const buildHistoryGraphSeries = (entityID: haEntity.EntityID | string, history: haEntity.History, options?: SeriesOptions): SeriesData => {
    const buckets = buildBuckets(history, options?.numBuckets || 100);
    const overall = buildOverallStats(buckets);
    return {
        entityID,
        seriesPath: buildSeriesPath(buckets, overall, options?.setBaselineToZero || false),
        overall,
    };
}

interface HistoryBucket {
    start: Date;
    max?: number;
    min?: number;
    avg?: number;
    first?: number;
    last?: number;
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
    let curFir: number | undefined = undefined;
    let curLst: number | undefined = undefined;

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
                first: curFir,
                last: curLst,
            };

            // Clear current bucket
            curIdx = Math.floor((ts - startMs) / bucketWidthMs);
            curMin = undefined;
            curMax = undefined;
            curSum = 0;
            curCnt = 0;
            curFir = undefined;
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
        if (!curFir) {
            curFir = entry.value;
        }
        curLst = entry.value;
    });
    // Aggregate last bucket TODO DRY
    buckets[curIdx] = {
        start: new Date(startMs + curIdx * bucketWidthMs),
        min: curMin,
        max: curMax,
        avg: curCnt > 0 ? curSum / curCnt : undefined,
        first: curFir,
        last: curLst,
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
                changes = { ...changes, first: val.first };
            }
            if (!overall.min || val.avg < overall.min) {
                changes = { ...changes, min: val.avg };
            }
            if (!overall.max || val.avg > overall.max) {
                changes = { ...changes, max: val.avg };
            }
            changes = { ...changes, last: val.last };
            return { ...overall, ...changes };
        }, {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
        });
}

const buildSeriesPath = (buckets: HistoryBucket[], overall: OverallStats, zeroBaseline: boolean): string => {
    const baseline = zeroBaseline ? 0 : overall.min;

    // Start path outside viewbox, lift up to first datapoint
    let pathStr = `M-1,${Number.MIN_VALUE} L0,${overall.first} `;
    buckets.forEach((bucket, idx) => {
        if (bucket.avg) {
            pathStr += `L${idx},${bucket.avg}`
        }
    });
    // Close path outside viewbox
    pathStr += `L${buckets.length},${overall.last} L${buckets.length},${baseline - 10} Z`

    return pathStr;
}
