import { Auth, callService, Connection, getAuth, getAuthOptions } from 'home-assistant-js-websocket';
import { EntityID, HaStream } from '../../entities/ha-entity';
import { loadWebsocketTokens, saveWebsocketTokens } from '../local-storage/local-storage';

export type WebsocketConnection = Connection;

export interface WebsocketAPI {
    call: (domain: string, action: string, data?: object, target?: EntityID) => Promise<any>,
    getStreamURL: (entityID: EntityID, format?: string) => Promise<HaStream>,
};

export class WebsocketAPIImpl implements WebsocketAPI {
    connection: WebsocketConnection;

    constructor(connection: WebsocketConnection) {
        this.connection = connection;
    }

    async call(domain: string, action: string, data?: object, target?: EntityID) {
        return callService(this.connection, domain, action, data, { entity_id: target?.getCanonicalized() });
    }

    async getStreamURL(entityID: EntityID, format: string = 'hls') {
        // See https://github.com/home-assistant/frontend/blob/a325d32d091e98939b33f5fc78299a08b3d96b51/src/data/camera.ts#L79
        return this.connection.sendMessagePromise<HaStream>({
            type: 'camera/stream',
            entity_id: entityID.getCanonicalized(),
            format: format,
        });
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
