import { Component, ContextType, MouseEvent as ReactMouseEvent, ChangeEvent as ReactChangeEvent } from 'react';
import * as haEntity from '../../../types/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as base from '../../base';
import * as icon from '../../icon/icon';
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
    preset?: string,
    presetOptions?: string[],
}

type State = {
    /** Store not-yet-dispatched temperature changes */
    pendingTargetTemperature?: number,
}

const initialState: State = {}

export class Thermostat extends Component<Props, State> implements tile.MappableProps<Props>{
    context!: ContextType<typeof authContext.AuthContext>
    static contextType = authContext.AuthContext;

    changeTemperatureTimeout?: NodeJS.Timeout;

    constructor(props: Props) {
        super(props);
        this.state = { ...initialState };
        this.onClickTemperatureArrow = this.onClickTemperatureArrow.bind(this);
        this.debouncedChangeTemperature = this.debouncedChangeTemperature.bind(this);
        this.onChangePreset = this.onChangePreset.bind(this);
    }

    propsMapper(entity: haEntity.Entity, _options: tile.Options): tile.MappedProps<Props> {
        // String enums aren't reverse-mapped
        const mode = Object.values(Mode).includes(entity.state as Mode) ? entity.state as Mode : Mode.Unknown;
        let icon;
        switch (mode) {
            case Mode.Heat:
                icon = {
                    name: 'gas',
                    color: 'ff6666',
                    filled: true,
                };
                break;
            case Mode.Cool:
                icon = {
                    name: 'winter',
                    color: '8888ff',
                    filled: true,
                };
                break;
            case Mode.Off:
                icon = {
                    name: 'offline',
                    color: '6644aa',
                    filled: true,
                };
                break;
            default:
                icon = {
                    name: 'temperature--v1',
                    color: '6644aa',
                    filled: true,
                };
        }
        return {
            icon,
            mode,
            targetTemperature: parseFloat(entity.attributes['temperature']),
            unit: '°F',
            preset: entity.attributes['preset_mode'],
            presetOptions: entity.attributes['preset_modes'],
        };
    }

    onClickTemperatureArrow(operation: Operation) {
        return (e: ReactMouseEvent) => {
            e.preventDefault();
            const newTemp = this.state.pendingTargetTemperature || this.props.targetTemperature + (operation === Operation.TempUp ? 1 : -1);
            this.debouncedChangeTemperature(newTemp);
            this.setState({ ...this.state, pendingTargetTemperature: newTemp });
        }
    }

    /** Debounce actually sending temperature to HA to avoid ratelimiting */
    debouncedChangeTemperature(temperature: number) {
        clearTimeout(this.changeTemperatureTimeout);
        this.changeTemperatureTimeout = setTimeout(() => {
            authContext.callWebsocketOrWarn(this.context, 'climate', 'set_temperature', { temperature }, this.props.entityID);
            this.setState({ ...this.state, pendingTargetTemperature: undefined });
        }, DEBOUNCE_MS);
    }

    onChangePreset(e: ReactChangeEvent<HTMLSelectElement>) {
        const selected = e.target.value;
        authContext.callWebsocketOrWarn(this.context, 'climate', 'set_preset_mode', { preset_mode: selected }, this.props.entityID);
    }

    render() {
        return (
            <div className='thermostat'>
                <>
                    <div className='temperature'>
                        {this.props.icon && icon.buildIcon(this.props.icon)}
                        <div className='value-container'>
                            {this.state.pendingTargetTemperature || this.props.targetTemperature}
                            <span className='unit'>{this.props.unit}</span>
                        </div>
                        <div className='ctrl-buttons'>
                            <div onClick={this.onClickTemperatureArrow(Operation.TempUp)}>
                                <Icon name='chevron-up' filled color='6644aa' />
                            </div>
                            <div onClick={this.onClickTemperatureArrow(Operation.TempDown)}>
                                <Icon name='chevron-down' filled color='6644aa' />
                            </div>
                        </div>
                    </div>
                    {this.props.preset &&
                        <div className='preset'>
                            {this.props.presetOptions ?
                                <select defaultValue={this.props.preset} onChange={this.onChangePreset}>
                                    {this.props.presetOptions.map(opt => (
                                        <option value={opt} key={opt}>{opt}</option>
                                    ))}
                                </select> :
                                this.props.preset}
                        </div>
                    }
                </>
            </div>
        );
    }
}