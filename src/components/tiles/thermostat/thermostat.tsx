import React, { Component, ContextType, MouseEvent as ReactMouseEvent, ChangeEvent as ReactChangeEvent } from 'react';
import * as haEntity from '../../../types/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as base from '../../base';
import * as icon from '../../icon/icon';
import { Icon } from '../../icon/icon';
import * as tile from '../../tile/tile';
import './thermostat.css';

const DEBOUNCE_MS = 2000;

type TargetTemperature = { [key: string]: number };

enum Mode {
    Heat = 'heat',
    Cool = 'cool',
    HeatCool = 'heat_cool',
    Off = 'off',
    Unknown = 'unknown',
}

enum CurrentActivity {
    Idle = 'idle',
    Heating = 'heating',
    Cooling = 'cooling',
    Fan = 'fan',
    Unknown = 'unknown',
}

enum TempTargetType {
    Single = 'temperature',
    Upper = 'target_temp_high',
    Lower = 'target_temp_low',
}

enum Operation {
    TempUp,
    TempDown,
}

const HeatIcon: icon.Props = {
    name: 'gas',
    color: 'ff6666',
    filled: true,
};
const CoolIcon: icon.Props = {
    name: 'winter',
    color: '8888ff',
    filled: true,
};
const OffIcon: icon.Props = {
    name: 'offline',
    color: 'bbbbbb',
    filled: true,
};
const TempIcon: icon.Props = {
    name: 'temperature-sensitive',
    color: '6644aa',
    filled: false,
}
const IdleIcon: icon.Props = {
    name: 'sleep',
    color: 'bbbbbb',
    filled: true,
}
const FanIcon: icon.Props = {
    name: 'fan',
    color: 'bbbbbb',
    filled: true,
}

type Props = base.BaseEntityProps & {
    mode: Mode,
    targetTemperature: TargetTemperature,
    // TODO Pull temp unit from HA config
    unit: string,
    preset?: string,
    presetOptions?: string[],
    currentActivity: CurrentActivity,
}

type State = {
    /** Store not-yet-dispatched temperature changes */
    pendingTargetTemperature?: TargetTemperature,
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
        this.buildTempControl = this.buildTempControl.bind(this);
    }

    propsMapper(entity: haEntity.Entity, _options: tile.Options): tile.MappedProps<Props> {
        // String enums aren't reverse-mapped
        const mode = Object.values(Mode).includes(entity.state as Mode) ? entity.state as Mode : Mode.Unknown;
        const hvacAction = entity.attributes['hvac_action'];
        const currentActivity = Object.values(CurrentActivity).includes(hvacAction as CurrentActivity) ? hvacAction as CurrentActivity : CurrentActivity.Unknown;
        const targetTemperature: TargetTemperature = mode === Mode.HeatCool ?
            {
                [TempTargetType.Lower]: parseFloat(entity.attributes['target_temp_low']),
                [TempTargetType.Upper]: parseFloat(entity.attributes['target_temp_high']),
            } :
            { [TempTargetType.Single]: parseFloat(entity.attributes['temperature']) }

        // Fix preset modes. Away is not supported as of HA 2023.4, and Manual isn't returned by ecobee
        const presetOptions = entity.attributes['preset_modes'];
        if (presetOptions.includes('away')) {
            presetOptions.splice(presetOptions.indexOf('away'), 1)
        }
        if (!presetOptions.includes('Manual')) {
            presetOptions.push('Manual');
        }

        return {
            icon: Thermostat.mapModeToIcon(mode),
            mode,
            targetTemperature,
            unit: '°F',
            preset: entity.attributes['preset_mode'] === 'temp' ? 'Manual' : entity.attributes['preset_mode'],
            presetOptions,
            currentActivity,
        };
    }

    onClickTemperatureArrow(target: TempTargetType, operation: Operation) {
        return (e: ReactMouseEvent) => {
            e.preventDefault();
            const curTargets = this.state.pendingTargetTemperature || this.props.targetTemperature;
            const newTemp = curTargets[target] + (operation === Operation.TempUp ? 1 : -1);
            const newTargets = {...curTargets, [target]: newTemp};
            this.debouncedChangeTemperature(newTargets);
            this.setState({ ...this.state, pendingTargetTemperature: newTargets });
        }
    }

    /** Debounce actually sending temperature to HA to avoid ratelimiting */
    debouncedChangeTemperature(temperature: TargetTemperature) {
        clearTimeout(this.changeTemperatureTimeout);
        this.changeTemperatureTimeout = setTimeout(() => {
            authContext.callWebsocketOrWarn(this.context, 'climate', 'set_temperature', temperature, this.props.entityID);
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
                <div className='temperature'>
                    {this.props.icon && icon.buildIcon(this.props.icon)}
                    {Object.keys(this.props.targetTemperature).map(key => key as TempTargetType).map(this.buildTempControl)}
                </div>
                <div className='additional-info'>
                    <Icon {...Thermostat.mapCurrentActivityToIcon(this.props.currentActivity)} />
                    {this.props.preset &&
                        <div className='preset'>
                            {this.props.presetOptions ?
                                <select id='thermostat-preset' value={this.props.preset} onChange={this.onChangePreset}>
                                    {this.props.presetOptions.map(opt => (
                                        <option value={opt} key={opt} disabled={opt === 'Manual'}>
                                            {opt[0].toUpperCase() + opt.slice(1).replace('way_indefinitely', 'way')}
                                        </option>
                                    ))}
                                </select> :
                                this.props.preset}
                        </div>
                    }
                </div>
            </div>
        );
    }

    buildTempControl(targetType: TempTargetType) {
        return (
            <React.Fragment key={targetType}>
                <div className='value-container'>
                    {this.state.pendingTargetTemperature?.[targetType] || this.props.targetTemperature?.[targetType]}
                    <span className='unit'>{this.props.unit}</span>
                </div>
                <div className='ctrl-buttons'>
                    <div onClick={this.onClickTemperatureArrow(targetType, Operation.TempUp)}>
                        <Icon name='chevron-up' filled color='6644aa' />
                    </div>
                    <div onClick={this.onClickTemperatureArrow(targetType, Operation.TempDown)}>
                        <Icon name='chevron-down' filled color='6644aa' />
                    </div>
                </div>
            </React.Fragment>
        );
    }

    static mapModeToIcon(mode: Mode): icon.Props {
        switch (mode) {
            case Mode.Heat:
                return HeatIcon;
            case Mode.Cool:
                return CoolIcon;
            case Mode.Off:
                return OffIcon;
            default:
                return TempIcon;
        }
    }

    static mapCurrentActivityToIcon(activity: CurrentActivity): icon.Props {
        switch (activity) {
            case CurrentActivity.Heating:
                return HeatIcon;
            case CurrentActivity.Cooling:
                return CoolIcon;
            case CurrentActivity.Fan:
                return FanIcon;
            default:
                return IdleIcon;
        }
    }
}