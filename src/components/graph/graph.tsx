import { MouseEvent, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import * as graph from '../../common/graph/graph';
import * as authContext from '../../services/auth-context';
import * as haEntity from '../../types/ha-entity';
import * as base from '../base';
import './graph.css';

const updateIntervalMs = 5000;

type SeriesProps = base.BaseEntityProps & {
    label?: string;
    filled?: boolean;
};

type AnnotationProps = base.BaseEntityProps & {
    label?: string;
};

type GraphProps = {
    numBuckets?: number;
    setBaselineToZero?: boolean;
    xAxisGridIncrement?: number;
    yAxisGridIncrement?: number;
    showLegend?: boolean;
    series: SeriesProps[];
    annotations?: AnnotationProps[];
}

export function Graph(props: GraphProps) {
    const [series, setSeries] = useState({} as { [key: string]: graph.SeriesData })
    const [annotations, setAnnotations] = useState({} as { [key: string]: graph.AnnotationData })
    const updateThrottler = useRef<{ [key: string]: NodeJS.Timeout }>({});
    const websocketAPI = useContext(authContext.AuthContext).websocketAPI;

    const numBuckets = props.numBuckets || 100;

    const getMapKey = (componentProps: base.BaseEntityProps) => [componentProps.entityID.getCanonicalized(), componentProps.attribute].join('_');
    const mapProps = <P extends base.BaseEntityProps>(props: P[]) => props.reduce((acc, cur) => {
        acc[getMapKey(cur)] = cur;
        return acc;
    }, {} as { [key: string]: P })

    const allSeriesProps = mapProps(props.series);
    const allAnnotationProps = props.annotations ? mapProps(props.annotations) : {};
    // Merge elementProps and annotationProps
    const subscribedEntities = [
        ...Object.keys(allSeriesProps),
        ...Object.keys(allAnnotationProps).filter(k => !allSeriesProps[k])
    ];

    useEffect(() => {
        if (!subscribedEntities || subscribedEntities.length === 0) {
            return;
        }
        if (!(websocketAPI instanceof Error)) {
            let unsubFuncs: (() => void)[] = [];
            subscribedEntities.forEach((mapKey) => {
                const matchingEntityProps = mapKey in allSeriesProps ? allSeriesProps[mapKey] : allAnnotationProps[mapKey];
                const collection = websocketAPI.subscribeHistory(matchingEntityProps.entityID, matchingEntityProps.attribute);
                const unsubFunc = collection.subscribe((history: haEntity.History) => {
                    const throttler = updateThrottler.current;
                    if (mapKey in throttler) {
                        return;
                    }
                    throttler[mapKey] = setTimeout(() => delete throttler[mapKey], updateIntervalMs);

                    if (mapKey in allSeriesProps) {
                        const seriesProps = allSeriesProps[mapKey];
                        const seriesData = {
                            ...series[mapKey],
                            ...graph.buildHistoryGraphSeries(mapKey, history, numBuckets),
                            filled: seriesProps.filled,
                            label: seriesProps.label,
                        };
                        setSeries(s => ({ ...s, [mapKey]: seriesData }));
                    }
                    if (mapKey in allAnnotationProps) {
                        const annotationProps = allAnnotationProps[mapKey];
                        const annotationData = {
                            ...annotations[mapKey],
                            ...graph.buildHistoryGraphAnnotation(mapKey, history, numBuckets),
                            label: annotationProps.label,
                        };
                        setAnnotations(s => ({ ...s, [mapKey]: annotationData }));
                    }
                });
                unsubFuncs = [...unsubFuncs, unsubFunc];
            })
            return () => {
                unsubFuncs.forEach(f => f());
            }
        }
    });

    if (!subscribedEntities || subscribedEntities.length === 0) {
        return (
            <div className='entity-unavailable'>
                Unavailable
            </div>
        );
    }

    const onClick = (entityID: string) => (_: MouseEvent) => {
        if (series[entityID].focused) {
            const unfocusedSeries = { ...series[entityID], focused: false };
            setSeries({ ...series, [entityID]: unfocusedSeries });
            return;
        }

        const updatedSeries = Object.entries(series).reduce((acc, [e, data]) => {
            acc[e] = { ...data, focused: e === entityID };
            return acc;
        }, {} as { [key: string]: graph.SeriesData })
        setSeries(updatedSeries);
    };

    const buildLegend = (): ReactElement => {
        return <div className='legend'>
            {Object.entries(series)
                .filter(([entityID]) => entityID in allSeriesProps)
                .map(([entityID, data]) => {
                    const label = data.label ? data.label.toLowerCase() : data.seriesID;
                    return <div className={`legend-entry ${data.focused ? 'focused' : ''}`} key={label}
                        onClick={onClick(entityID)}
                    >
                        <div className={`legend-label label-${label.toLowerCase().replaceAll(' ', '_')}`}>{label}</div>
                        <div className='legend-value'>{data.overall.last || '??'}</div>
                    </div>
                })}
        </div>;
    }

    return <div className='graph'>
        <div className='graph-context'>
            {Object.keys(series).length > 0 &&
                graph.buildHistoryGraph(
                    Object.entries(series)
                        .filter(([key]) => key in allSeriesProps)
                        .map(([_, v]) => v),
                    Object.entries(annotations)
                        .filter(([key]) => key in allAnnotationProps)
                        .map(([_, v]) => v),
                    {
                        numBuckets: numBuckets,
                        showLabels: true,
                        xAxisGridIncrement: props.xAxisGridIncrement,
                        yAxisGridIncrement: props.yAxisGridIncrement,
                    })}
        </div>
        {props.showLegend && buildLegend()}
    </div>
}
