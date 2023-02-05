import { Auth, callService, Connection, getAuth, getAuthOptions } from 'home-assistant-js-websocket';
import { EntityID } from '../../entities/ha-entity';
import { loadWebsocketTokens, saveWebsocketTokens } from '../local-storage/local-storage';

export const authenticateWebsocket = async (haURL?: string): Promise<Auth> => {
    const options: getAuthOptions = {
        hassUrl: haURL,
        saveTokens: saveWebsocketTokens,
        loadTokens: loadWebsocketTokens,
    };
    return getAuth(options);
};

export const callWebsocketService = (connection: Connection | Error, domain: string, action: string, data?: object, target?: EntityID) => {
    if (connection instanceof Error) {
        console.error(`No connection to make websocket service call ${domain}.${action}!`);
        return;
    }
    callService(connection, domain, action, data, { entity_id: target?.getCanonicalized() });
};
