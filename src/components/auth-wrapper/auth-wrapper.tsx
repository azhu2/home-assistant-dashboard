import { createConnection, ERR_CANNOT_CONNECT, ERR_CONNECTION_LOST, ERR_HASS_HOST_REQUIRED, ERR_INVALID_AUTH, ERR_INVALID_HTTPS_TO_HTTP } from 'home-assistant-js-websocket';
import { Component } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from '../../pages/dashboard/dashboard';
import Settings from '../../pages/settings/settings';
import { AuthContext, AuthContextType, emptyAuthContext } from '../../services/context';
import { saveLongLivedAccessToken } from '../../services/local-storage/local-storage';
import { NewRestAPI, RestAPI } from '../../services/rest-api/rest-api';
import { authenticateWebsocket, WebsocketAPIImpl, WebsocketConnection } from '../../services/websocket/websocket';

type State = AuthContextType;

const initialState: State = emptyAuthContext;

/** Wrapper that provides an AuthContext. */
class AuthWrapper extends Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = { ...initialState };
        this.setWebsocketAuth = this.setWebsocketAuth.bind(this);
        this.setRestAuth = this.setRestAuth.bind(this);
    }

    componentDidMount() {
        this.setWebsocketAuth().catch(err => console.error(err));
    }

    componentWillUnmount() {
        if (!(this.state.websocketConnection instanceof Error)) {
            this.state.websocketConnection.close();
        }
    }

    /** Check websocket auth, set connection or error in state, and return result. */
    async setWebsocketAuth(haURL?: string): Promise<WebsocketConnection> {
        return this.checkWebsocketAuth(haURL)
            .then(connection => {
                this.setState({
                    ...this.state,
                    websocketConnection: connection,
                    websocketAPI: new WebsocketAPIImpl(connection),
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
    async checkWebsocketAuth(haURL?: string): Promise<WebsocketConnection> {
        try {
            const auth = await authenticateWebsocket(haURL);
            return await createConnection({ auth });
        } catch (err) {
            switch (err) {
                case ERR_HASS_HOST_REQUIRED:
                    throw new Error('Home Assistant URL not provided.');
                case ERR_INVALID_AUTH:
                    throw new Error('Auth code invalid.');
                case ERR_INVALID_HTTPS_TO_HTTP:
                    throw new Error('Cannot access http Home Assistant from https context.');
                case ERR_CANNOT_CONNECT:
                    throw new Error('Cannot connect to websocket API');
                case ERR_CONNECTION_LOST:
                    throw new Error('Connection lost!')
            }
            throw new Error('Unrecognized error', { cause: err });
        }
    }

    /** Set and return authed rest API. */
    async setRestAuth(llaToken: string): Promise<RestAPI> {
        return NewRestAPI(llaToken)
            .then(restAPI => {
                saveLongLivedAccessToken(llaToken);
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
        const router = createBrowserRouter([
            {
                path: '/',
                element: <Dashboard />
            },
            {
                path: '/settings',
                element: <Settings
                    checkWebsocketCallback={async haURL => {
                        const connection = await this.setWebsocketAuth(haURL);
                        return connection.options.auth?.data.hassUrl || '';
                    }}
                    checkRestAPICallback={this.setRestAuth}
                />
            }
        ]);

        return (
            <AuthContext.Provider value={this.state} >
                <RouterProvider router={router} />
            </AuthContext.Provider>
        );
    }
};

export default AuthWrapper;