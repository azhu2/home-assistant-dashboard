import * as haWebsocket from 'home-assistant-js-websocket';

export const saveWebsocketTokens: haWebsocket.SaveTokensFunc = tokens => {
    localStorage.websocketTokens = JSON.stringify(tokens);
};

export const loadWebsocketTokens: haWebsocket.LoadTokensFunc = () => {
    try {
        return JSON.parse(localStorage.websocketTokens);
    } catch (err) {
        return null;
    }
};

export const saveHAURL = (haURL: string) => {
    localStorage.haURL = haURL;
}

export const loadHAURL = () => {
    return localStorage.haURL;
}

export const saveLongLivedAccessToken = (token: string) => {
    localStorage.longLivedToken = token;
}

export const loadLongLivedAccessToken = () => {
    return localStorage.longLivedToken;
}
