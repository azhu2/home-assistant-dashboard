import { Connection } from "home-assistant-js-websocket";
import React from "react";

export const ConnectionContext = React.createContext<Connection | undefined>(undefined);
