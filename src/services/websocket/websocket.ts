import * as haWebsocket from 'home-assistant-js-websocket';
import * as haEntity from '../../entities/ha-entity';
import * as localStorage from '../local-storage/local-storage';

export type Connection = haWebsocket.Connection;

export interface WebsocketAPI {
    call: (domain: string, action: string, data?: object, target?: haEntity.EntityID) => Promise<any>,
    getStreamURL: (entityID: haEntity.EntityID, format?: string) => Promise<haEntity.Stream>,
};

export class WebsocketAPIImpl implements WebsocketAPI {
    connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    async call(domain: string, action: string, data?: object, target?: haEntity.EntityID) {
        return haWebsocket.callService(this.connection, domain, action, data, { entity_id: target?.getCanonicalized() });
    }

    async getStreamURL(entityID: haEntity.EntityID, format: string = 'hls') {
        // See https://github.com/home-assistant/frontend/blob/a325d32d091e98939b33f5fc78299a08b3d96b51/src/data/camera.ts#L79
        return this.connection.sendMessagePromise<haEntity.Stream>({
            type: 'camera/stream',
            entity_id: entityID.getCanonicalized(),
            format: format,
        });
    }
}

export const authenticate = async (haURL?: string): Promise<haWebsocket.Auth> => {
    const options: haWebsocket.getAuthOptions = {
        hassUrl: haURL,
        saveTokens: localStorage.saveWebsocketTokens,
        loadTokens: localStorage.loadWebsocketTokens,
    };
    return haWebsocket.getAuth(options);
};
