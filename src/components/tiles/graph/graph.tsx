import { Children, Component, ContextType, PropsWithChildren, ReactElement, useContext, useEffect, useState } from 'react';
import * as base from '../../base';
import * as haEntity from '../../../types/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as graph from '../../../common/graph/graph';
import './graph.css';

type Props = base.BaseEntityProps & {
    filled?: boolean;
    // TODO Move below to graph props
    numBuckets?: number;
    setBaselineToZero?: boolean;
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

export class GraphElement extends Component<Props, State> {
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
        if (this.state.history) {
            const { series: path, overall } = graph.buildHistoryGraphSeries(this.props.entityID, this.state.history, {
                numBuckets: this.props.numBuckets || 100,
                filled: this.props.filled
            });
            this.setState({ ...this.state, overall });
            return path;
        }
        return (
            <></>
        )
    }
}

export function Graph(props: PropsWithChildren) {
    const [series, setSeries] = useState({} as { [key: string]: graph.SeriesResult })

    const websocketAPI = useContext(authContext.AuthContext).websocketAPI;

    // Massage children to GraphElements so we can deconstruct their props
    const childSeries = Children.map(props.children, c => c)?.
        filter((c): c is ReactElement<GraphElement> => !!c).
        filter(c => c.type === GraphElement).
        reduce((arr, cur) => {
            const props = cur.props as unknown as Props;
            return { ...arr, [props.entityID.getCanonicalized()]: props };
        }, {} as { string: Props })

    useEffect(() => {
        if (!childSeries || Object.keys(childSeries).length == 0) {
            return;
        }
        if (!(websocketAPI instanceof Error)) {
            let unsubFuncs: (() => void)[] = [];
            Object.entries(childSeries).forEach(([entityID, props]) => {
                const collection = websocketAPI.subscribeHistory(entityID);
                const unsubFunc = collection.subscribe((history: haEntity.History) => {
                    const seriesGraph = graph.buildHistoryGraphSeries(entityID, history, {
                        numBuckets: props.numBuckets || 100,
                        filled: props.filled, setBaselineToZero: props.setBaselineToZero
                    });
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

    return <div className='graph'>
        {graph.buildHistoryGraph(Object.entries(series).
            filter(([entityID]) => entityID in childSeries).
            map(([k, v]) => v), {
            numBuckets: 100,
            showLabels: true,
        })}
    </div>;
}
