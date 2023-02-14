import * as haWebsocket from 'home-assistant-js-websocket';
import * as haEntity from '../../entities/ha-entity';
import * as localStorage from '../local-storage/local-storage';

const TIMEOUT_MS = 2000;

export type Connection = haWebsocket.Connection;

export interface WebsocketAPI {
    ping: () => Promise<any>,
    call: (domain: string, action: string, data?: object, target?: haEntity.EntityID) => Promise<any>,
    getStreamURL: (entityID: haEntity.EntityID, format?: string) => Promise<haEntity.Stream>,
};

export class WebsocketAPIImpl implements WebsocketAPI {
    connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    async ping() {
        return this.withTimeout(this.connection.ping());
    }

    async call(domain: string, action: string, data?: object, target?: haEntity.EntityID) {
        return this.withTimeout(haWebsocket.callService(this.connection, domain, action, data, { entity_id: target?.getCanonicalized() }));
    }

    async getStreamURL(entityID: haEntity.EntityID, format: string = 'hls') {
        // See https://github.com/home-assistant/frontend/blob/a325d32d091e98939b33f5fc78299a08b3d96b51/src/data/camera.ts#L79
        return this.withTimeout(this.connection.sendMessagePromise<haEntity.Stream>({
            type: 'camera/stream',
            entity_id: entityID.getCanonicalized(),
            format: format,
        }));
    }

    withTimeout<RetType>(promise: Promise<RetType>): Promise<RetType> {
        return Promise.race([promise, new Promise<RetType>((_, reject) => {
            setTimeout(() => {
                reject(new Error('Websocket timed out'));
            }, TIMEOUT_MS);
        })]);
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
