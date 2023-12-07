import { Component, MouseEvent, PropsWithChildren, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import * as base from '../base';
import * as haEntity from '../../types/ha-entity';
import * as authContext from '../../services/auth-context';
import * as graph from '../../common/graph/graph';
import './graph.css';
import * as util from './util';

const updateIntervalMs = 5000;

type ElementProps = base.BaseEntityProps & {
    label?: string;
    attribute?: string;
    filled?: boolean;
};

/**
 * GraphElement is an empty props container. Rendering is handled in the outer Graph component.
 * Needs to be a class, not a functional component so ReactElement<GraphElement> is valid.
 * An empty constructor must be present or rerenders don't work.
 */
export class GraphElement extends Component<ElementProps> {
    constructor(props: ElementProps) {
        super(props);
    }
}

type GraphProps = {
    numBuckets?: number;
    setBaselineToZero?: boolean;
    xAxisGridIncrement?: number;
    yAxisGridIncrement?: number;
    showLegend?: boolean;
}

export function Graph(props: PropsWithChildren<GraphProps>) {
    const [series, setSeries] = useState({} as { [key: string]: graph.SeriesData })
    const updateThrottler = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const websocketAPI = useContext(authContext.AuthContext).websocketAPI;

    const numBuckets = props.numBuckets || 100;

    const childSeries = util.getPropsOfChildType<ElementProps>(props.children, GraphElement)

    useEffect(() => {
        if (!childSeries || Object.keys(childSeries).length == 0) {
            return;
        }
        if (!(websocketAPI instanceof Error)) {
            let unsubFuncs: (() => void)[] = [];
            Object.entries(childSeries).forEach(([entityID, seriesProps]) => {
                const collection = websocketAPI.subscribeHistory(entityID, seriesProps.attribute);
                const unsubFunc = collection.subscribe((history: haEntity.History) => {
                    const throttler = updateThrottler.current;
                    if (entityID in throttler) {
                        return;
                    }
                    throttler[entityID] = setTimeout(() => delete throttler[entityID], updateIntervalMs);
                    const seriesData = {
                        ...series[entityID],
                        ...graph.buildHistoryGraphSeries(entityID, history, {numBuckets: numBuckets}),
                        filled: seriesProps.filled,
                        label: seriesProps.label,
                    };
                    setSeries(s => ({ ...s, [entityID]: seriesData }));
                });
                unsubFuncs = [...unsubFuncs, unsubFunc];
            })
            return () => {
                unsubFuncs.forEach(f => f());
            }
        }
    }, [childSeries, websocketAPI]);

    if (!childSeries || Object.keys(childSeries).length == 0) {
        return (
            <div className='entity-unavailable'>
                Unavailable
            </div>
        );
    }

    const onClick = (entityID: string) => (_: MouseEvent) => {
        if (series[entityID].focused) {
            const unfocusedSeries = {...series[entityID], focused: false};
            setSeries({...series, [entityID]: unfocusedSeries});
            return;
        }

        const updatedSeries = Object.entries(series).reduce((acc, [e, data]) => {
            acc[e] = {...data, focused: e === entityID};
            return acc;
        }, {} as {[key: string]: graph.SeriesData})
        setSeries(updatedSeries);
    };

    const buildLegend = (): ReactElement => {
        return <div className='legend'>
            {Object.entries(series).map(([entityID, data]) => {
                const label = data.label ? data.label.toLowerCase() : entityID;
                return <div className={`legend-entry ${data.focused ? 'focused' : ''}`} key={label}
                    onClick={onClick(entityID)}
                >
                    <div className={`legend-label label-${label}`}>{label}</div>
                    <div className='legend-value'>{data.overall.last}</div>
                </div>
            })}
        </div>;
    }

    return <div className='graph'>
        <div className='graph-context'>
            {Object.keys(series).length > 0 &&
                graph.buildHistoryGraph(Object.entries(series).
                    filter(([entityID]) => entityID in childSeries).
                    map(([_, v]) => v), {
                    numBuckets: numBuckets,
                    showLabels: true,
                    xAxisGridIncrement: props.xAxisGridIncrement,
                    yAxisGridIncrement: props.yAxisGridIncrement,
                })}
        </div>
        {props.showLegend && buildLegend()}
    </div>
}
