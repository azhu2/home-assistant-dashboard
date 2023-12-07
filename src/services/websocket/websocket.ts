import * as haWebsocket from 'home-assistant-js-websocket';
import * as haEntity from '../../types/ha-entity';
import * as localStorage from '../local-storage/local-storage';

const TIMEOUT_MS = 2000;
// TODO Make period customizable
const LOOKBACK_INTERVAL_MS = 24 * 60 * 60 * 1000;

export type Connection = haWebsocket.Connection;

export interface WebsocketAPI {
    ping: () => Promise<any>,
    call: (domain: string, action: string, data?: object, target?: haEntity.EntityID) => Promise<any>,
    getStreamURL: (entityID: haEntity.EntityID, format?: string) => Promise<haEntity.Stream>,
    subscribeHistory(entityID: haEntity.EntityID | string, attribute?: string): haWebsocket.Collection<haEntity.History>,
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

    subscribeHistory(e: haEntity.EntityID | string, attribute?: string): haWebsocket.Collection<haEntity.History> {
        const entityID = typeof (e) === 'string' ? e : e.getCanonicalized();

        const buildHistoryMessage = (type: string, entityID: string, startTime: Date) => ({
            type,
            entity_ids: [entityID],
            start_time: new Date(startTime.getTime() - LOOKBACK_INTERVAL_MS).toISOString(),
            // end_time: startTime.toISOString(),
            minimal_response: true,
        });

        const parseVal = (val: string) => {
            if (parseFloat(val)) {
                return parseFloat(val);
            }
            switch (val) {
                case 'on':
                    return true;
                case 'off':
                    return false;
            }
            return val;
        }
        const mapToHistoryType = (history: HistoryMap) =>
            // Map to haEntity.History
            history[entityID].reduce((acc, entry) => {
                // API returns seconds
                const ts = entry.lu * 1000;
                // Parse as number or boolean if possible
                acc.set(ts, attribute ? parseVal(entry.a[attribute]) : parseVal(entry.s));
                return acc;
            }, new Map<number, string | number | boolean>());

        return haWebsocket.getCollection<haEntity.History>(
            this.connection,
            `history-${entityID}`,
            conn =>
                conn.sendMessagePromise<HistoryMap>(
                    buildHistoryMessage('history/history_during_period', entityID, new Date())
                ).then(mapToHistoryType),
            (conn, store) =>
                conn.subscribeMessage<HistoryStreamMessage>(stream => {
                    const history = mapToHistoryType(stream.states)
                    const prev = store.state || [];
                    const updated = new Map([prev, history].flatMap(h => [...h]));
                    store.setState(updated, true);
                }, buildHistoryMessage('history/stream', entityID, new Date()))
        )
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

type HistoryStreamMessage = { states: HistoryMap };
// From https://github.com/home-assistant/frontend/blob/f1692038f87d0a4cb012d7bf29afc05020367ca0/src/data/history.ts#L77-L86
type HistoryMap = {
    [entityID: string]: {
        lu: number,
        s: string,
        a: { [key: string]: any },
    }[]
};
