import { Connection } from 'home-assistant-js-websocket';
import React from 'react';

export const ErrConnectionNotInitialized = new Error('Connection not intialized');
export const ConnectionContext = React.createContext<Connection | Error>(ErrConnectionNotInitialized);
