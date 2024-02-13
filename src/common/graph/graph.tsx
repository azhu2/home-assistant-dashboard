import { ReactElement } from 'react';
import * as haEntity from '../../types/ha-entity';
import './graph.css';

type SeriesOptions = {
    numBuckets: number;
}

export type GraphOptions = SeriesOptions & {
    showLabels?: boolean;
    xAxisGridIncrement?: number;
    yAxisGridIncrement?: number;
    setBaselineToZero?: boolean;
}

/**
 * Builds a <svg> element for a history graph of an
 * @param series Built by buildHistoryGraphSeries
 */
export const buildHistoryGraph = (series: SeriesData[], annotations: AnnotationData[], options: GraphOptions): ReactElement => {
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
                    x2={i} y2={overall.max}
                    vectorEffect='non-scaling-stroke'
                />
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
                    x2={options.numBuckets} y2={i}
                    vectorEffect='non-scaling-stroke'
                />
            ];
        }
    }

    // Combine matching labels
    const consolidatedSeries = Object.values(series.reduce((acc, seriesData) => {
        const label = seriesData.label || seriesData.seriesID;
        if (label in acc) {
            acc[label].paths.push(seriesData.seriesPath);
            return acc;
        }
        acc[label] = {
            ...seriesData,
            label,
            paths: [seriesData.seriesPath]
        };
        return acc;
    }
        , {} as { [key: string]: { label: string, paths: string[], focused?: boolean, filled?: boolean } }
    ));

    return <>
        {options?.showLabels && <div className='graph-label max'>{Math.round(overall.max)}</div>}
        <svg
            // Set viewbox based on data and let viewport resize
            viewBox={`0 ${baseline} ${options.numBuckets - 1} ${overall.max - baseline}`}
            preserveAspectRatio='none'
            // Flip since built with 0 as baseline (bottom)
            transform='scale(1, -1)'
        >
            {annotations
                .filter(a => a.annotationIntervals)
                .map(a => {
                    const path = buildAnnotationPath(a.annotationIntervals, options.numBuckets, overall);
                    return <path
                        className={`annotation annotation-${a.label?.toLowerCase() || a.annotationID}`}
                        key={a.annotationID}
                        d={path}
                        vectorEffect='non-scaling-stroke'
                    />
                })}
            {gridlines}
            {consolidatedSeries
                // Draw focused path last and multi-paths first
                .sort((a: { paths: string[], focused?: boolean }, b: { paths: string[], focused?: boolean }) => a.focused ? 1 : b.focused ? -1 : b.paths.length - a.paths.length)
                .map(s => {
                    switch (s.paths.length) {
                        case 1:
                            return (<path
                                className={
                                    `history history-${s.label.toLowerCase().replaceAll(' ', '_')} ${s.filled ? 'filled' : ''} ${s.focused ? 'focused' : ''}`
                                }
                                key={s.label}
                                d={s.paths[0]}
                                vectorEffect='non-scaling-stroke'
                            />);
                        case 2:
                            return (
                                <>
                                    <mask id={`mask-${s.label}`}>
                                        <rect x={0} y={baseline} width={options.numBuckets} height={overall.max - baseline} fill='white' />
                                        <path
                                            key={s.label}
                                            d={s.paths[0]}
                                            vectorEffect='non-scaling-stroke'
                                            fill='black'
                                        />
                                    </mask>
                                    <path
                                        className={
                                            `history masked history-${s.label.toLowerCase().replaceAll(' ', '_')} ${s.filled ? 'filled' : ''} ${s.focused ? 'focused' : ''}`
                                        }
                                        key={s.label}
                                        d={s.paths[1]}
                                        vectorEffect='non-scaling-stroke'
                                        mask={`url(#mask-${s.label})`}
                                    />
                                </>
                            );
                        default:
                            // Gets weird with more than 2...
                            console.error(`Can't build graph series for ${s.paths.length} series. Only 1 or 2 series are supported.`)
                            return (<></>);
                    };
                })}
        </svg>
        {options?.showLabels && <div className='graph-label min'>{Math.round(baseline)}</div>}
    </>;
}

export interface SeriesData {
    seriesID: string;
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
export const buildHistoryGraphSeries = (seriesID: string, history: haEntity.History, numBuckets?: number): SeriesData => {
    const buckets = buildBuckets(history, numBuckets || 100);
    const overall = buildOverallStats(buckets);
    return {
        seriesID,
        seriesPath: buildSeriesPath(buckets, overall),
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

    history.forEach((entry, ts) => {
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
                avg: curCnt > 0 ? curSum / curCnt : curLst,
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
        if (typeof entry !== 'number') {
            // Can't graph
            return;
        }
        // Add value to current bucket
        if (!curMin || entry < curMin) {
            curMin = entry;
        }
        if (!curMax || entry > curMax) {
            curMax = entry;
        }
        curSum += entry;
        curCnt++;
        if (!curFir) {
            curFir = entry;
        }
        curLst = entry;
    });
    // Aggregate last bucket TODO DRY
    buckets[curIdx] = {
        start: new Date(startMs + curIdx * bucketWidthMs),
        min: curMin,
        max: curMax,
        avg: curCnt > 0 ? curSum / curCnt : curLst,
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

const buildSeriesPath = (buckets: HistoryBucket[], overall: OverallStats): string => {
    // Start path outside viewbox, lift up to first datapoint
    let pathStr = `M-1,${Number.MIN_VALUE} L0,${overall.first} `;
    buckets.forEach((bucket, idx) => {
        if (bucket.avg) {
            pathStr += `L${idx},${bucket.avg} `
        }
    });
    // Close path outside viewbox
    pathStr += `L${buckets.length},${overall.last} L${buckets.length},${Number.MIN_VALUE} Z`

    return pathStr;
}

export interface AnnotationData {
    annotationID: string;
    annotationIntervals: AnnotationInterval[];
    label?: string;
}

/**
 * Builds the d parameter for the svg <path> element for a single series for a history graph.
 * Use buildHistoryGraph to build the entire <svg> element.
 * This utility doesn't build the entire graph in case there are multiple series.
 */
export const buildHistoryGraphAnnotation = (annotationID: string, history: haEntity.History, numBuckets?: number): AnnotationData => {
    return {
        annotationID,
        annotationIntervals: buildAnnotationIntervals(history, numBuckets || 100),
    };
}

interface AnnotationInterval {
    start: number;
    end: number;
}

const buildAnnotationIntervals = (history: haEntity.History, numBuckets: number): AnnotationInterval[] => {
    let intervals = Array<AnnotationInterval>();

    // TODO Dynamic time ranges
    const timeRangeMs = 24 * 60 * 60 * 1000;
    const bucketWidthMs = timeRangeMs / numBuckets;
    const startMs = Date.now() - timeRangeMs;

    let curStart: number | undefined = undefined;

    history.forEach((entry, ts) => {
        if (typeof entry !== 'boolean') {
            // Can't graph
            return;
        }
        const scaledTimestamp = (ts - startMs) / bucketWidthMs;
        if (ts < startMs) {
            // Before time range
            if (entry) {
                curStart = scaledTimestamp;
            } else {
                curStart = undefined;
            }
            return;
        }
        if (!curStart) {
            if (entry) {
                // Start new interval
                curStart = scaledTimestamp;
            }
        } else {
            if (!entry) {
                // End of current interval
                intervals = [...intervals, { start: curStart, end: scaledTimestamp }];
                curStart = undefined;
            }
        }
    });
    if (curStart) {
        // Final interval not ended yet
        intervals = [...intervals, { start: curStart, end: numBuckets }];
    }

    return intervals;
}

const buildAnnotationPath = (intervals: AnnotationInterval[], numBuckets: number, overall: OverallStats): string => {
    // Draw a single path and hide false state under viewbox
    let pathStr = `M-1,${overall.min} `;

    intervals.forEach(interval => {
        // Left vertical line (up)
        pathStr += `L${interval.start},${overall.min} L${interval.start},${overall.max} `
        // Right vertical line (down)
        pathStr += `L${interval.end},${overall.max} L${interval.end},${overall.min} `
    })

    // Close path outside viewbox
    pathStr += `L${numBuckets},${overall.min} Z`

    return pathStr;
}
