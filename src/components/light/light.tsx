import { useContext } from "react";
import { Color } from "../../entities/color";
import { ConnectionContext } from "../../services/websocket-service/context";
import callWebsocketService from "../../services/websocket-service/websocket-service";
import BaseProps from "../base";
import Icon from "../icon/icon";

type Props = BaseProps & {
    /** on(true) or off(false) */
    state: boolean,
    /** 0-255 if dimmer available */
    brightness?: number,
    icon?: string,
}

const ON_COLOR = "#DDDD44";

function Light(props: Props) {
    const connection = useContext(ConnectionContext);
    const isDimmable = props.entityID.domain === 'light';
    const icon = props.icon ? props.icon : props.state ? 'light-on' : 'light-off';

    function toggle() {
        // Use home assistant domain for generic toggle (works for lights and switches)
        callWebsocketService(connection, 'homeassistant', 'toggle', { entity_id: props.entityID.getCanonicalized() })
    }

    function color() {
        var scaleFactor: number;
        if (!isDimmable || !props.brightness) {
            scaleFactor = props.state ? 1 : 0;
        } else {
            scaleFactor = props.brightness / 255;
        }
        return new Color(ON_COLOR).scale(scaleFactor);
    }

    return (
        <div className="light" id={props.entityID.getCanonicalized()}>
            <button onClick={toggle}>
                <Icon name={icon} color={color()} />
                {props.friendlyName}
            </button>
        </div>
    );
}

export default Light;
