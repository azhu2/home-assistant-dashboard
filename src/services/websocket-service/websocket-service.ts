import { callService, Connection, HassServiceTarget } from "home-assistant-js-websocket";

const callWebsocketService = (connection: Connection | undefined, domain: string, action: string, data?: object | undefined, target?: HassServiceTarget | undefined) => {
    if (!connection) {
        console.error(`No connection to make websocket service call ${domain}.${action}!`);
        return;
    }
    callService(connection, domain, action, data, target);
}

export default callWebsocketService;