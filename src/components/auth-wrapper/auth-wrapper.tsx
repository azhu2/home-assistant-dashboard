import { Auth, Connection, createConnection } from "home-assistant-js-websocket";
import { Component, ReactNode } from "react";
import { loadWebsocketTokens } from "../../services/local-storage/local-storage";
import { ConnectionContext, ErrConnectionNotInitialized } from "../../services/websocket/context";
import { authenticateWebsocket } from "../../services/websocket/websocket";

type Props = {
    children: ReactNode;
}

type State = {
    connection: Connection | Error,
};

const initialState: State = {
    connection: ErrConnectionNotInitialized,
};

/** Wrapper that provides a (Connection | Error) context. */
class AuthWrapper extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { ...initialState };
        this.checkAuth = this.checkAuth.bind(this);
    }

    componentDidMount() {
        this.checkAuth();
    }

    componentWillUnmount() {
        if (this.state.connection instanceof Connection) {
            this.state.connection.close();
        }
    }

    async checkAuth() {
        const authData = await loadWebsocketTokens();
        if (!authData) {
            this.setState({ ...this.state, connection: new Error('No Home Assistant config set') });
            return;
        }
        let auth: Auth;
        try {
            auth = await authenticateWebsocket(authData.hassUrl);
        } catch (err) {
            this.setState({ ...this.state, connection: new Error('Authentication failed', { cause: err }) });
            return;
        }
        let connection: Connection;
        try {
            connection = await createConnection({ auth });
        } catch (err) {
            this.setState({ ...this.state, connection: new Error('Could not establish connection', { cause: err }) });
            return;
        }

        this.setState({ ...this.state, connection });
        return connection;
    }

    render() {
        return (
            <ConnectionContext.Provider value={this.state.connection}>
                {this.props.children}
            </ConnectionContext.Provider>
        );
    }
};

export default AuthWrapper;