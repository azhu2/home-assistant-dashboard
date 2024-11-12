import { Component, ContextType, MouseEvent as ReactMouseEvent } from 'react';
import * as haEntity from '../../../types/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as base from '../../base';
import * as icon from '../../icon/icon';
import { Icon } from '../../icon/icon';
import * as tile from '../../tile/tile';
import './humidifier.css';

const DEBOUNCE_MS = 2000;

enum Mode {
    Off = 'off',
    Idle = 'idle',
    Active = 'humidifying',
}

enum Operation {
    TargetUp,
    TargetDown,
}

const ActiveIcon: icon.Props = {
    name: 'hot-springs',
    color: '6644aa',
    filled: true,
}

const IdleIcon: icon.Props = {
    name: 'sleep',
    color: 'bbbbbb',
    filled: true,
}

type Props = base.BaseEntityProps & {
    target: number,
    mode: Mode,
    // TODO Pull temp unit from HA config
    unit: string,
}

type State = {
    /** Store not-yet-dispatched target changes */
    pendingTarget?: number,
}

const initialState: State = {}

export class Humidifier extends Component<Props, State> implements tile.MappableProps<Props> {
    context!: ContextType<typeof authContext.AuthContext>
    static contextType = authContext.AuthContext;

    changeTargetTimeout?: NodeJS.Timeout;

    constructor(props: Props) {
        super(props);
        this.state = { ...initialState };
        this.onClickTargetArrow = this.onClickTargetArrow.bind(this);
        this.debouncedChangeTarget = this.debouncedChangeTarget.bind(this);
        this.onChangeMode = this.onChangeMode.bind(this);
    }

    propsMapper(entity: haEntity.Entity, _options: tile.Options): tile.MappedProps<Props> {
        // String enums aren't reverse-mapped
        const action = entity.attributes['action'];
        const mode = Object.values(Mode).includes(action as Mode) ? action as Mode : Mode.Off;
        const target = entity.attributes['humidity'];

        return {
            icon: Humidifier.mapModeToIcon(mode),
            mode,
            target: target,
            unit: '%',
        };
    }

    onClickTargetArrow(operation: Operation) {
        return (e: ReactMouseEvent) => {
            e.preventDefault();
            const curTarget = this.state.pendingTarget || this.props.target;
            const newTarget = curTarget + (operation === Operation.TargetUp ? 1 : -1);
            this.debouncedChangeTarget(newTarget);
            this.setState({ ...this.state, pendingTarget: newTarget });
        }
    }

    /** Debounce actually sending change to HA to avoid ratelimiting */
    debouncedChangeTarget(target: number) {
        clearTimeout(this.changeTargetTimeout);
        this.changeTargetTimeout = setTimeout(() => {
            authContext.callWebsocketOrWarn(this.context, 'humidifier', 'set_humidity', { humidity: target }, this.props.entityID);
            this.setState({ ...this.state, pendingTarget: undefined });
        }, DEBOUNCE_MS);
    }

    onChangeMode() {
        authContext.callWebsocketOrWarn(this.context, 'homeassistant', 'toggle', {}, this.props.entityID);
    }

    render() {
        return (
            <>
                <div className='mode' onClick={this.onChangeMode}>
                    {this.props.icon && icon.buildIcon(this.props.icon)}
                </div>
                <div className='value-container'>
                    {this.state.pendingTarget || this.props.target}
                    <span className='unit'>{this.props.unit}</span>
                </div>
                <div className='ctrl-buttons'>
                    <div onClick={this.onClickTargetArrow(Operation.TargetUp)}>
                        <Icon name='chevron-up' filled color='6644aa' />
                    </div>
                    <div onClick={this.onClickTargetArrow(Operation.TargetDown)}>
                        <Icon name='chevron-down' filled color='6644aa' />
                    </div>
                </div>
            </>
        );
    }

    static mapModeToIcon(mode: Mode): icon.Props {
        switch (mode) {
            case Mode.Active:
                return ActiveIcon;
            case Mode.Idle:
                return IdleIcon;
            default:
                return IdleIcon;
        }
    }
}