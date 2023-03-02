import { Component, ContextType, createRef, ReactElement, RefObject } from 'react';
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

export class HistoryGauge extends Gauge {
    context!: ContextType<typeof authContext.AuthContext>
    static contextType = authContext.AuthContext;
    ref: RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);
        this.state = {...initialState};
        this.ref = createRef();
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
        this.setState({
            ...this.state,
            componentHeight: this.ref.current?.clientHeight,
            componentWidth: this.ref.current?.clientWidth,
        })
    }

    componentWillUnmount() {
        if (this.state.unsubFunc) {
            this.state.unsubFunc();
        }
    }

    render() {
        const historyElement = (
            <div className='history-background' ref={this.ref}>
                {this.state.componentHeight} x {this.state.componentWidth}
            </div>
        );
        return this.renderHelper(historyElement);
    }
}
