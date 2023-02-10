import React, { Component, MouseEvent as ReactMouseEvent, RefObject } from 'react';
import { Color } from '../../../entities/color';
import { HaEntity } from '../../../entities/ha-entity';
import { AuthContext, callWebsocketOrWarn } from '../../../services/context';
import { BaseEntityProps } from '../../base';
import Icon from '../../icon/icon';
import { MappedProps, MappableProps } from '../tile';
import BrightnessSlider from './brightness-slider';
import './light.css';

/** Default color for lights that are on. Lights with brightness are a scaled varion of this color.
 * I have no RGB lights in HA, so not dealing with those for now.
 */
const ON_COLOR = '#BBBB22';     // TODO lights color

type Props = BaseEntityProps & {
    /** on(true) or off(false) */
    state: boolean,
    /** 0-255 if dimmer available */
    brightness?: number,
}

type State = {
    /** Tracks whether brightness slider is expanded */
    isExpanded: boolean,
}

const initialState: State = {
    isExpanded: false,
}

class Light extends Component<Props, State> implements MappableProps<Props>{
    isDimmable: boolean;
    ref: RefObject<HTMLDivElement>;

    context!: React.ContextType<typeof AuthContext>
    static contextType = AuthContext;

    constructor(props: Props) {
        super(props);
        this.state = { ...initialState };
        this.isDimmable = this.props.entityID.domain === 'light';
        this.onClick = this.onClick.bind(this);
        this.onClickOutside = this.onClickOutside.bind(this);
        this.onSetBrightness = this.onSetBrightness.bind(this);
        this.ref = React.createRef();
    }

    propsMapper(entity: HaEntity): MappedProps<Props> {
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
            if (this.isDimmable) {
                this.setState({ ...this.state, isExpanded: !this.state.isExpanded });
            }
            return;
        }
        // Use home assistant domain for generic toggle (works for lights and switches)
        callWebsocketOrWarn(this.context, 'homeassistant', 'toggle', { entity_id: this.props.entityID.getCanonicalized() })
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
        callWebsocketOrWarn(this.context, 'light', 'turn_on', { brightness: stringified }, this.props.entityID);
    }

    color() {
        var scaleFactor: number;
        if (!this.isDimmable || !this.props.brightness) {
            scaleFactor = this.props.state ? 1 : 0;
        } else {
            scaleFactor = this.props.brightness / 255;
        }
        return new Color(ON_COLOR).scale(scaleFactor);
    }

    render() {
        const icon = this.props.icon ? this.props.icon : this.props.state ? 'light-on' : 'light-off';

        return (
            <div className={`light light-${this.props.state ? 'on' : 'off'}`}
                id={`light-${this.props.entityID.getCanonicalized()}`}
                onClick={this.onClick}
                onContextMenu={this.onClick}
                ref={this.ref}
            >
                <Icon name={icon} color={this.color()} />
                {this.isDimmable &&
                    <BrightnessSlider
                        brightness={this.props.brightness || 0}
                        color={this.color()}
                        isExpanded={this.state.isExpanded}
                        onSetBrightness={this.onSetBrightness}
                        // Reset key on open/close or entity brightness change to force creating new component
                        key={`${this.props.entityID}|${this.state.isExpanded}|${this.props.brightness}`}
                    />
                }
            </div>
        );
    }
}

export default Light;
