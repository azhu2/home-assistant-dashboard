import { Connection } from 'home-assistant-js-websocket';
import { Component, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icon/icon';
import { Color } from '../../entities/color';
import { loadWebsocketTokens } from '../../services/local-storage/local-storage';
import { ConnectionContext } from '../../services/websocket/context';
import './settings.css';

const DEFAULT_URL = 'http://127.0.0.1:8123';

type Props = {
    checkAuthCallback: (haURL: string) => Promise<Connection>,
}

type State = {
    haURL?: string,
}

const initialState: State = {
    haURL: undefined,
}

class Settings extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { ...initialState };
        this.loadHAURL = this.loadHAURL.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.loadHAURL();
    }

    async loadHAURL() {
        const authData = await loadWebsocketTokens();
        if (!authData) {
            return;
        }
        this.setState({ ...this.state, haURL: authData.hassUrl });
    }

    async onSubmit(event: FormEvent) {
        event.preventDefault();

        if (!this.state.haURL) {
            return;
        }

        this.props.checkAuthCallback(this.state.haURL)
            .then(connection => this.setState({ ...this.state, haURL: connection.options.auth?.data.hassUrl }));
            // TODO Clear URL params after complete
    }

    render() {
        return (
            <>
                <div>Settings</div>
                <form onSubmit={this.onSubmit}>
                    <div>
                        <label htmlFor='ha-url'>Home Assistant URL </label>
                        <input type='text' id='ha-url' required
                            placeholder={DEFAULT_URL}
                            value={this.state.haURL || ''}
                            onChange={event => this.setState({ ...this.state, haURL: event.currentTarget.value })} />
                        <ConnectionContext.Consumer>
                            {connection => {
                                if (connection instanceof Error) {
                                    return (
                                        <>
                                            {/* TODO Error color */}
                                            <Icon name='circled-x' color={new Color('aa0000')} />
                                            {/* TODO Make hover */}
                                            {connection.message}
                                        </>
                                    );
                                }
                                return (
                                    // TODO Success color
                                    <Icon name='ok--v1' color={new Color('#00aa00')} />
                                )
                            }}
                        </ConnectionContext.Consumer>
                    </div>
                    <input type='submit' />
                </form>
                <div><Link to='/'>Back</Link></div>
            </>
        );
    }
};

export default Settings;