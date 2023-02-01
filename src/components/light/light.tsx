import React, { MouseEvent as ReactMouseEvent, Ref, RefObject } from "react";
import { Color } from "../../entities/color";
import { ConnectionContext } from "../../services/websocket-service/context";
import callWebsocketService from "../../services/websocket-service/websocket-service";
import BaseEntityProps from "../base";
import Icon from "../icon/icon";
import BrightnessSlider from "./brightness-slider";

/** Default color for lights that are on. Lights with brightness are a scaled varion of this color.
 * I have no RGB lights in HA, so not dealing with those for now.
 */
const ON_COLOR = "#BBBB22";

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

class Light extends React.Component<Props, State> {
    context!: React.ContextType<typeof ConnectionContext>
    static contextType = ConnectionContext;
    isDimmable: boolean;
    ref: RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);
        this.state = { ...initialState };
        this.isDimmable = this.props.entityID.domain === 'light';
        this.onClick = this.onClick.bind(this);
        this.onClickOutside = this.onClickOutside.bind(this);
        this.onSetBrightness = this.onSetBrightness.bind(this);
        this.ref = React.createRef();
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
        if (this.isDimmable && e.button > 0) {
            this.setState({ ...this.state, isExpanded: !this.state.isExpanded });
            return;
        }
        // Use home assistant domain for generic toggle (works for lights and switches)
        callWebsocketService(this.context, 'homeassistant', 'toggle', { entity_id: this.props.entityID.getCanonicalized() })
    }

    /** To un-expand when clicked elsewhere */
    onClickOutside(e: MouseEvent) {
        if (this.state.isExpanded && this.ref.current && !this.ref.current.contains(e.target as Node)) {
            this.setState({ ...this.state, isExpanded: false });
        }
    };

    /** Callback for setting dimmer brightness */
    onSetBrightness(brightness: number) {
        const stringified = `${brightness.toFixed(0)}`;
        callWebsocketService(this.context, 'light', 'turn_on', { brightness: stringified }, this.props.entityID);
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
            <div className="light" id={this.props.entityID.getCanonicalized()} ref={this.ref}>
                <button onClick={this.onClick} onContextMenu={this.onClick}>
                    <Icon name={icon} color={this.color()} />
                    {this.isDimmable &&
                        <div>
                            <BrightnessSlider
                                value={this.props.brightness || 0}
                                color={this.color()}
                                isExpanded={this.state.isExpanded}
                                onSetBrightness={this.onSetBrightness}
                            />
                        </div>
                    }
                </button>
                {this.props.friendlyName}
            </div>
        );
    }
}

export default Light;
