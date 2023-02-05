import { Auth, callService, Connection, getAuth, getAuthOptions } from 'home-assistant-js-websocket';
import { EntityID } from '../../entities/ha-entity';
import { loadWebsocketTokens, saveWebsocketTokens } from '../local-storage/local-storage';

export type WebsocketConnection = Connection;

export interface WebsocketAPI {
    call: (domain: string, action: string, data?: object, target?: EntityID) => Promise<any>,
};

export class WebsocketAPIImpl implements WebsocketAPI {
    connection: WebsocketConnection;

    constructor(connection: WebsocketConnection) {
        this.connection = connection;
    }

    async call(domain: string, action: string, data?: object, target?: EntityID) {
        return callService(this.connection, domain, action, data, { entity_id: target?.getCanonicalized() });
    }
}

export const authenticateWebsocket = async (haURL?: string): Promise<Auth> => {
    const options: getAuthOptions = {
        hassUrl: haURL,
        saveTokens: saveWebsocketTokens,
        loadTokens: loadWebsocketTokens,
    };
    return getAuth(options);
};
