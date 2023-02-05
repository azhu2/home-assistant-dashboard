import { LoadTokensFunc, SaveTokensFunc } from "home-assistant-js-websocket";

export const saveWebsocketTokens: SaveTokensFunc = tokens => {
    localStorage.haTokens = JSON.stringify(tokens);
};

export const loadWebsocketTokens: LoadTokensFunc = () => {
    try {
        return JSON.parse(localStorage.haTokens);
    } catch (err) {
        return null;
    }
};
