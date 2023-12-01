import { Children, Component, PropsWithChildren, ReactElement, useContext, useEffect, useState } from 'react';
import * as base from '../../base';
import * as haEntity from '../../../types/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as graph from '../../../common/graph/graph';
import './graph.css';

type ElementProps = base.BaseEntityProps & {
    label?: string;
    attribute?: string;
    filled?: boolean;
};

type State = {
    unsubFunc?: () => void,
    history?: haEntity.History,
    overall?: graph.OverallStats,
}

export const initialState: State = {
    unsubFunc: undefined,
    history: undefined,
    overall: undefined,
}


/** GraphElement is an empty props container. Rendering is handled in the outer Graph component.
 *  Needs to be a class, not a functional component so ReactElement<GraphElement> is valid.
 *  An empty constructor must be present or rerenders don't work.
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

    const websocketAPI = useContext(authContext.AuthContext).websocketAPI;

    const numBuckets = props.numBuckets || 100;

    // Massage children to GraphElements so we can deconstruct their props
    const childSeries = Children.map(props.children, c => c)?.
        filter((c): c is ReactElement<GraphElement> => !!c).
        filter(c => c.type === GraphElement).
        reduce((arr, cur) => {
            const props = cur.props as unknown as ElementProps;
            return { ...arr, [props.entityID.getCanonicalized()]: props };
        }, {} as { string: ElementProps })

    useEffect(() => {
        if (!childSeries || Object.keys(childSeries).length == 0) {
            return;
        }
        if (!(websocketAPI instanceof Error)) {
            let unsubFuncs: (() => void)[] = [];
            Object.entries(childSeries).forEach(([entityID, seriesProps]) => {
                const collection = websocketAPI.subscribeHistory(entityID, seriesProps.attribute);
                const unsubFunc = collection.subscribe((history: haEntity.History) => {
                    const seriesGraph = graph.buildHistoryGraphSeries(entityID, history, {
                        numBuckets: numBuckets,
                        setBaselineToZero: props.setBaselineToZero,
                    });
                    seriesGraph.filled = seriesProps.filled;
                    seriesGraph.label = seriesProps.label;
                    setSeries(s => ({ ...s, [entityID]: seriesGraph }));
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

    const buildLegend = (): ReactElement => {
        return <div className='legend'>
            {Object.entries(series).map(([entityID, data]) => {
                const label = data.label ? data.label.toLowerCase() : entityID;
                return <div className='legend-entry' key={label}>
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
