import { Auth, callService, Connection, getAuth, getAuthOptions } from 'home-assistant-js-websocket';
import { EntityID } from '../../entities/ha-entity';
import { loadWebsocketTokens, saveWebsocketTokens } from '../local-storage/local-storage';

export interface Websocket {
    call: (domain: string, action: string, data?: object, target?: EntityID) => Promise<any>,
};

export class WebsocketImpl implements Websocket {
    connection: Connection;

    constructor(connection: Connection) {
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
