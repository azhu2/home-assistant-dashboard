import React, { MouseEvent } from "react";
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
    expandBrightnessSlider: boolean,
}

const initialState: State = {
    expandBrightnessSlider: false,
}

class Light extends React.Component<Props, State> {
    context!: React.ContextType<typeof ConnectionContext>
    static contextType = ConnectionContext;
    isDimmable: boolean;

    constructor(props: Props) {
        super(props);
        this.state = { ...initialState };
        this.isDimmable = this.props.entityID.domain === 'light';
        this.onClick = this.onClick.bind(this);
    }

    onClick(e: MouseEvent) {
        e.preventDefault();
        // Right-click on a dimmable light toggles brightness slider
        if (this.isDimmable && e.button > 0) {
            this.setState({ ...this.state, expandBrightnessSlider: !this.state.expandBrightnessSlider });
            return;
        }
        // Use home assistant domain for generic toggle (works for lights and switches)
        callWebsocketService(this.context, 'homeassistant', 'toggle', { entity_id: this.props.entityID.getCanonicalized() })
        this.setState({ ...this.state, expandBrightnessSlider: false });
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
            <div className="light" id={this.props.entityID.getCanonicalized()}>
                <button onClick={this.onClick} onContextMenu={this.onClick}>
                    <Icon name={icon} color={this.color()} />
                    {this.isDimmable &&
                        <BrightnessSlider value={this.props.brightness || 0} color={this.color()} expanded={this.state.expandBrightnessSlider} />
                    }
                </button>
                {this.props.friendlyName}
            </div>
        );
    }
}

export default Light;
