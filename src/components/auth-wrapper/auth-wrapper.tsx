import * as haWebsocket from 'home-assistant-js-websocket';
import { Component } from 'react';
import * as reactRouter from 'react-router-dom';
import { RouterProvider } from 'react-router-dom';
import { Dashboard } from '../../pages/dashboard/dashboard';
import { Settings } from '../../pages/settings/settings';
import * as authContext from '../../services/auth-context';
import { AuthContextProvider } from '../../services/auth-context';
import * as localStorage from '../../services/local-storage/local-storage';
import * as restAPI from '../../services/rest-api/rest-api';
import * as websocket from '../../services/websocket/websocket';

const HEALTH_CHECK_MS = 5000;

type State = authContext.AuthContextType;

const initialState: State = {
    ...authContext.emptyAuthContext,
};

/** Wrapper that provides an AuthContext. */
class AuthWrapper extends Component<{}, State> {
    wsHealthCheckTimer?: NodeJS.Timer;

    constructor(props: {}) {
        super(props);
        this.state = { ...initialState };
        this.setWebsocketAuth = this.setWebsocketAuth.bind(this);
        this.setRestAuth = this.setRestAuth.bind(this);
        this.wsHealthCheck = this.wsHealthCheck.bind(this);
    }

    /** Try to set up connections from data in local storage. */
    componentDidMount() {
        this.setWebsocketAuth().catch(err => console.error(err));
        this.setRestAuth(localStorage.loadHAURL(), localStorage.loadLongLivedAccessToken());
    }

    componentWillUnmount() {
        if (!(this.state.websocketConnection instanceof Error)) {
            this.state.websocketConnection.close();
        }
        clearInterval(this.wsHealthCheckTimer);
    }

    /** Check websocket auth, set connection or error in state, and return result. */
    async setWebsocketAuth(haURL?: string): Promise<websocket.Connection> {
        return this.checkWebsocketAuth(haURL)
            .then(connection => {
                if (!this.wsHealthCheckTimer) {
                    this.wsHealthCheckTimer = setInterval(this.wsHealthCheck, HEALTH_CHECK_MS);
                }
                this.setState({
                    ...this.state,
                    websocketConnection: connection,
                    websocketAPI: new websocket.WebsocketAPIImpl(connection),
                });
                return connection;
            })
            .catch(err => {
                this.setState({
                    ...this.state,
                    websocketConnection: err,
                    websocketAPI: err,
                });
                throw err;
            });
    }

    /** Set and return websocket connection if valid. */
    async checkWebsocketAuth(haURL?: string): Promise<websocket.Connection> {
        try {
            const auth = await websocket.authenticate(haURL);
            return await haWebsocket.createConnection({ auth });
        } catch (err) {
            switch (err) {
                case haWebsocket.ERR_HASS_HOST_REQUIRED:
                    throw new Error('Home Assistant URL not provided.');
                case haWebsocket.ERR_INVALID_AUTH:
                    throw new Error('Auth code invalid.');
                case haWebsocket.ERR_INVALID_HTTPS_TO_HTTP:
                    throw new Error('Cannot access http Home Assistant from https context.');
                case haWebsocket.ERR_CANNOT_CONNECT:
                    throw new Error('Cannot connect to websocket API');
                case haWebsocket.ERR_CONNECTION_LOST:
                    throw new Error('Connection lost!')
            }
            throw new Error('Unrecognized error', { cause: err });
        }
    }

    async wsHealthCheck() {
        if (this.state.websocketAPI instanceof Error) {
            this.setWebsocketAuth();
            return;
        }
        this.state.websocketAPI.ping()
            .catch(() => {
                const err = new Error('Websocket API unreachable');
                if (!(this.state.websocketAPI instanceof Error)) {
                    // if error, already broken, so don't re-log to reduce clutter
                    console.error(err);
                }
                this.setState({ ...this.state, websocketAPI: err, websocketConnection: err });
            });
    }

    /** Set and return authed rest API. */
    async setRestAuth(baseURL: string, llaToken: string): Promise<restAPI.RestAPI> {
        return restAPI.create(baseURL, llaToken)
            .then(restAPI => {
                localStorage.saveLongLivedAccessToken(llaToken);
                localStorage.saveHAURL(baseURL);
                this.setState({
                    ...this.state,
                    restAPI,
                });
                return restAPI;
            })
            .catch(err => {
                this.setState({
                    ...this.state,
                    restAPI: err,
                });
                throw err;
            });
    }

    render() {
        const router = reactRouter.createBrowserRouter([
            {
                path: '/',
                element: <Dashboard />
            },
            {
                path: '/settings',
                element: <Settings
                    checkWebsocketCallback={this.setWebsocketAuth}
                    checkRestAPICallback={this.setRestAuth}
                />
            }
        ]);

        return (
            <AuthContextProvider value={this.state} >
                <RouterProvider router={router} />
            </AuthContextProvider>
        );
    }
};

export default AuthWrapper;