import { createContext } from 'react';
import * as haEntity from '../types/ha-entity';
import * as restApi from './rest-api/rest-api';
import * as websocket from './websocket/websocket';

export type AuthContextType = {
    websocketConnection: websocket.Connection | Error,
    websocketAPI: websocket.WebsocketAPI | Error,
    restAPI: restApi.RestAPI | Error,
}
export const errConnectionNotInitialized = new Error('Connection not intialized');
export const emptyAuthContext: AuthContextType = {
    websocketConnection: errConnectionNotInitialized,
    websocketAPI: errConnectionNotInitialized,
    restAPI: errConnectionNotInitialized,
}
export const AuthContext = createContext<AuthContextType>(emptyAuthContext);
export const AuthContextConsumer = AuthContext.Consumer;
export const AuthContextProvider = AuthContext.Provider;

export async function callWebsocketOrWarn(context: AuthContextType, domain: string, action: string, data?: object, target?: haEntity.EntityID): Promise<any> {
    if (context.websocketAPI instanceof Error) {
        console.warn(`Websocket not intiialized. ${domain}.${action}`);
        return;
    }
    return context.websocketAPI.call(domain, action, data, target);
}
