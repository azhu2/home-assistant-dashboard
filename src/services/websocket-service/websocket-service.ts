import { callService, Connection } from 'home-assistant-js-websocket';
import { EntityID } from '../../entities/ha-entity';

const callWebsocketService = (connection: Connection | undefined, domain: string, action: string, data?: object, target?: EntityID) => {
    if (!connection) {
        console.error(`No connection to make websocket service call ${domain}.${action}!`);
        return;
    }
    callService(connection, domain, action, data, {entity_id: target?.getCanonicalized()});
}

export default callWebsocketService;