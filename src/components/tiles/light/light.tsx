import { Component, ContextType, createRef, MouseEvent as ReactMouseEvent, RefObject } from 'react';
import * as color from '../../../types/color';
import * as haEntity from '../../../types/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as base from '../../base';
import * as icon from '../../icon/icon';
import { Icon } from '../../icon/icon';
import * as tile from '../../tile/tile';
import * as switchTile from '../switch/switch';
import { Switch } from '../switch/switch';
import { BrightnessSlider } from './brightness-slider';
import './light.css';

/** Default color for lights that are on. Lights with brightness are a scaled varion of this color.
 * I have no RGB lights in HA, so not dealing with those for now.
 */
export const ON_COLOR = '#BBBB22';     // TODO lights color

export class Light extends Switch {
    propsMapper(entity: haEntity.Entity, options: tile.Options): tile.MappedProps<switchTile.Props> {
        let opts = options;
        if (options.icon && entity.state === 'on') {
            if (typeof options.icon === 'string') {
                opts = {
                    ...options,
                    icon: {
                        name: options.icon,
                        color: ON_COLOR,
                    },
                };
            } else {
                opts = {
                    ...options,
                    icon: {
                        ...options.icon,
                        color: ON_COLOR,
                    },
                };
            }
        }
        return super.propsMapper(entity, opts);
    }
};

type DimmableProps = base.BaseEntityProps & {
    /** on(true) or off(false) */
    state: boolean,
    /** 0-255 if dimmer available */
    brightness: number,
};

type DimmableState = {
    /** Tracks whether brightness slider is expanded */
    isExpanded: boolean,
};

const initialState: DimmableState = {
    isExpanded: false,
};

export class DimmableLight extends Component<DimmableProps, DimmableState> implements tile.MappableProps<DimmableProps> {
    ref: RefObject<HTMLDivElement>;

    context!: ContextType<typeof authContext.AuthContext>
    static contextType = authContext.AuthContext;

    constructor(props: DimmableProps) {
        super(props);
        this.state = { ...initialState };
        this.onClick = this.onClick.bind(this);
        this.onClickOutside = this.onClickOutside.bind(this);
        this.onSetBrightness = this.onSetBrightness.bind(this);
        this.ref = createRef();
    }

    propsMapper(entity: haEntity.Entity): tile.MappedProps<DimmableProps> {
        return {
            state: entity.state === 'on',
            brightness: entity.attributes['brightness'],
            backgroundColor: entity.state === 'on' ? undefined : '#dddddd'     // TODO inactive color
        };
    }

    componentDidMount() {
        document.addEventListener('click', this.onClickOutside, false);
        document.addEventListener('contextmenu', this.onClickOutside, false);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onClickOutside, false);
        document.removeEventListener('contextmenu', this.onClickOutside, false);
    }

    onClick(e: ReactMouseEvent) {
        e.preventDefault();
        // Right-click on a dimmable light toggles brightness slider
        if (e.button > 0) {
            this.setState({ ...this.state, isExpanded: !this.state.isExpanded });
            return;
        }
        // Use home assistant domain for generic toggle (works for lights and switches)
        authContext.callWebsocketOrWarn(this.context, 'homeassistant', 'toggle', { entity_id: this.props.entityID.getCanonicalized() })
    }

    /** To un-expand when clicked elsewhere */
    // TODO: Also trigger when leaving element && mouse is held down. Probably add document listeners on BrightnessSlider.
    onClickOutside(e: MouseEvent) {
        if (this.state.isExpanded && this.ref.current && !this.ref.current.contains(e.target as Node)) {
            this.setState({ ...this.state, isExpanded: false });
        }
    }

    /** Callback for setting dimmer brightness */
    onSetBrightness(brightness: number) {
        const stringified = `${brightness.toFixed(0)}`;
        authContext.callWebsocketOrWarn(this.context, 'light', 'turn_on', { brightness: stringified }, this.props.entityID);
    }

    color() {
        var scaleFactor: number;
        scaleFactor = this.props.brightness / 255 || 0;
        return new color.Color(ON_COLOR).scale(scaleFactor);
    }

    render() {
        let iconElement;
        if (this.props.icon) {
            iconElement = icon.buildIcon(this.props.icon, this.color());
        } else {
            const iconName = this.props.state ? 'light-on' : 'light-off';
            iconElement = <Icon name={iconName} color={this.color()} />
        }

        return (
            <div className={`light light-${this.props.state ? 'on' : 'off'}`}
                id={`light-${this.props.entityID.getCanonicalized()}`}
                onClick={this.onClick}
                onContextMenu={this.onClick}
                ref={this.ref}
            >
                {iconElement}
                <BrightnessSlider
                    brightness={this.props.brightness || 0}
                    color={this.color()}
                    isExpanded={this.state.isExpanded}
                    onSetBrightness={this.onSetBrightness}
                    // Reset key on open/close or entity brightness change to force creating new component
                    key={`${this.props.entityID.getCanonicalized()}|${this.state.isExpanded}|${this.props.brightness}`}
                />
            </div>
        );
    }
};
