import { Connection } from 'home-assistant-js-websocket';
import React from 'react';
import { EntityID } from '../../entities/ha-entity';
import { Websocket as WebsocketAPI } from './websocket';

export const ErrConnectionNotInitialized = new Error('Connection not intialized');
export const ConnectionContext = React.createContext<Connection | Error>(ErrConnectionNotInitialized);
export const WebsocketAPIContext = React.createContext<WebsocketAPI | Error>(ErrConnectionNotInitialized);
export async function callWebsocketOrWarn(websocket: WebsocketAPI | Error, domain: string, action: string, data?: object, target?: EntityID): Promise<any> {
    if (websocket instanceof Error) {
        console.warn(`Websocket not intiialized. ${domain}.${action}`);
        return;
    }
    return websocket.call(domain, action, data, target);
}
