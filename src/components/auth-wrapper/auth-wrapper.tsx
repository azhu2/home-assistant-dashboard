import { Auth, Connection, createConnection, ERR_CANNOT_CONNECT, ERR_CONNECTION_LOST, ERR_HASS_HOST_REQUIRED, ERR_INVALID_AUTH, ERR_INVALID_HTTPS_TO_HTTP } from "home-assistant-js-websocket";
import { Component } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "../../pages/dashboard/dashboard";
import Settings from "../../pages/settings/settings";
import { ConnectionContext, ErrConnectionNotInitialized } from "../../services/websocket/context";
import { authenticateWebsocket } from "../../services/websocket/websocket";

type State = {
    connection: Connection | Error,
};

const initialState: State = {
    connection: ErrConnectionNotInitialized,
};

/** Wrapper that provides a (Connection | Error) context. */
class AuthWrapper extends Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = { ...initialState };
        this.setAuthInState = this.setAuthInState.bind(this);
    }

    componentDidMount() {
        this.setAuthInState().catch(err => console.error(err));
    }

    componentWillUnmount() {
        if (this.state.connection instanceof Connection) {
            this.state.connection.close();
        }
    }

    /** Check auth, set connection or error in state, and return result. */
    async setAuthInState(haURL?: string) {
        return this.checkAuth(haURL)
            .then(connection => {
                this.setState({ ...this.state, connection });
                return connection;
            })
            .catch(err => {
                this.setState({ ...this.state, connection: err });
                throw err;
            });
    }

    /** Set and return Connection if valid. */
    async checkAuth(haURL?: string) {
        let auth: Auth;
        try {
            auth = await authenticateWebsocket(haURL);
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
            throw new Error('Unrecognized error', {cause: err});
        }
    }

    render() {
        const router = createBrowserRouter([
            {
                path: '/',
                element: <Dashboard />
            },
            {
                path: '/settings',
                element: <Settings checkAuthCallback={this.setAuthInState} />
            }
        ]);

        return (
            <ConnectionContext.Provider value={this.state.connection}>
                <RouterProvider router={router} />
            </ConnectionContext.Provider>
        );
    }
};

export default AuthWrapper;