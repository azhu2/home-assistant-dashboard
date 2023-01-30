import { useContext } from "react";
import { ConnectionContext } from "../../services/websocket-service/context";
import callWebsocketService from "../../services/websocket-service/websocket-service";
import BaseProps from "../base";

type Props = BaseProps & {
    state: boolean,
    brightness?: number,
}

function Light(props: Props) {
    const connection = useContext(ConnectionContext);

    return(
        <div className="light" id={props.entityID}>
            {props.friendlyName}
            | {props.state ? 'on' : 'off'} {props.brightness || ''}
            {/* homeassistant domain for generic toggle (light or switch) */}
            | <button onClick={() => callWebsocketService(connection, 'homeassistant', 'toggle', {entity_id: props.entityID})}>Toggle</button>
        </div>
    );
}

export default Light;
