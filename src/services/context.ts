import React from 'react';
import { EntityID } from '../entities/ha-entity';
import { RestAPI } from './rest-api/rest-api';
import { WebsocketConnection, WebsocketAPI } from './websocket/websocket';

export type AuthContextType = {
    websocketConnection: WebsocketConnection | Error,
    websocketAPI: WebsocketAPI | Error,
    restAPI: RestAPI | Error,
}
export const ErrConnectionNotInitialized = new Error('Connection not intialized');
export const emptyAuthContext: AuthContextType = {
    websocketConnection: ErrConnectionNotInitialized,
    websocketAPI: ErrConnectionNotInitialized,
    restAPI: ErrConnectionNotInitialized,
}
export const AuthContext = React.createContext<AuthContextType>(emptyAuthContext);

export async function callWebsocketOrWarn(context: AuthContextType, domain: string, action: string, data?: object, target?: EntityID): Promise<any> {
    if (context.websocketAPI instanceof Error) {
        console.warn(`Websocket not intiialized. ${domain}.${action}`);
        return;
    }
    return context.websocketAPI.call(domain, action, data, target);
}
