import { Component, ContextType, MouseEvent as ReactMouseEvent } from 'react';
import * as haEntity from '../../../entities/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as base from '../../base';
import { Icon } from '../../icon/icon';
import * as tile from '../../tile/tile';
import './thermostat.css';

const DEBOUNCE_MS = 2000;

enum Mode {
    Heat = 'heat',
    Cool = 'cool',
    HeatCool = 'heat_cool',
    Off = 'off',
    Unknown = 'unknown',
}

enum Operation {
    TempUp,
    TempDown,
}

type Props = base.BaseEntityProps & {
    mode: Mode,
    targetTemperature: number,
    // TODO Pull temp unit from HA config
    unit: string,
}

type State = {
    targetTemperature: number,
}

export class Thermostat extends Component<Props, State> implements tile.MappableProps<Props>{
    context!: ContextType<typeof authContext.AuthContext>
    static contextType = authContext.AuthContext;

    changeTemperatureTimeout?: NodeJS.Timeout;

    constructor(props: Props) {
        super(props);
        this.state = { targetTemperature: props.targetTemperature };
        this.onClick = this.onClick.bind(this);
        this.debouncedChangeTemperature = this.debouncedChangeTemperature.bind(this);
    }

    propsMapper(entity: haEntity.Entity, _options: tile.Options): tile.MappedProps<Props> {
        // String enums aren't reverse-mapped
        const mode = Object.values(Mode).includes(entity.state as Mode) ? entity.state as Mode : Mode.Unknown;
        let icon;
        switch (mode) {
            case Mode.Heat:
                icon = 'gas';
                break;
            case Mode.Cool:
                icon = 'winter';
                break;
            case Mode.Off:
                icon = 'offline';
                break;
            default:
                icon = 'temperature--v1';
        }
        return {
            icon: icon,
            mode: mode,
            targetTemperature: parseFloat(entity.attributes['temperature']),
            unit: '°F',
        };
    }

    onClick(operation: Operation) {
        return (e: ReactMouseEvent) => {
            e.preventDefault();
            const newTemp = this.state.targetTemperature + (operation === Operation.TempUp ? 1 : -1);
            this.debouncedChangeTemperature(newTemp);
            this.setState({ ...this.state, targetTemperature: newTemp });
        }
    }

    /** Debounce actually send temperature to HA to avoid ratelimiting */
    debouncedChangeTemperature(temperature: number) {
        clearTimeout(this.changeTemperatureTimeout);
        this.changeTemperatureTimeout = setTimeout(() => authContext.callWebsocketOrWarn(this.context, 'climate', 'set_temperature', { temperature }, this.props.entityID), DEBOUNCE_MS);
    }

    render() {
        return <div className='thermostat'>
            <Icon name={this.props.icon!} filled color='6644aa' />
            <div className='value-container'>
                {this.state.targetTemperature}
                <span className='unit'>{this.props.unit}</span>
            </div>
            <div className='ctrl-buttons'>
                <div onClick={this.onClick(Operation.TempUp)}>
                    <Icon name='chevron-up' filled color='6644aa' />
                </div>
                <div onClick={this.onClick(Operation.TempDown)}>
                    <Icon name='chevron-down' filled color='6644aa' />
                </div>
            </div>
        </div>
    }
}