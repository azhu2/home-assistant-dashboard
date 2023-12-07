import { ContextType } from 'react';
import * as authContext from '../../../services/auth-context';
import { Gauge } from './gauge';
import * as gauge from './gauge';
import * as graph from '../../../common/graph/graph';

const updateIntervalMs = 5000;

export class HistoryGauge extends Gauge {
    context!: ContextType<typeof authContext.AuthContext>
    static contextType = authContext.AuthContext;

    updateThrottler?: NodeJS.Timer;

    constructor(props: gauge.Props) {
        super(props);
        this.state = { ...gauge.initialState };
    }

    componentDidMount() {
        if (!(this.context.websocketAPI instanceof Error)) {
            const collection = this.context.websocketAPI.subscribeHistory(this.props.entityID);
            const unsubFunc = collection.subscribe(history => {
                if (this.updateThrottler) {
                    return;
                }
                this.updateThrottler = setTimeout(() => {}, updateIntervalMs);
                this.setState({ ...this.state, history });
            })
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
            const series = graph.buildHistoryGraphSeries(this.props.entityID.getCanonicalized(), this.state.history, {numBuckets: 100});
            series.filled = true;
            const history = graph.buildHistoryGraph([series], {numBuckets: 100, setBaselineToZero: this.props.setBaselineToZero, showLabels: true});
            return this.renderHelper(history);
        }
        return this.renderHelper();
    }
}
