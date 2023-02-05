import { Component, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icon/icon';
import { Color } from '../../entities/color';
import { AuthContext } from '../../services/context';
import { loadWebsocketTokens } from '../../services/local-storage/local-storage';
import './settings.css';

const DEFAULT_URL = 'http://127.0.0.1:8123';

type Props = {
    checkAuthCallback: (haURL: string) => Promise<string>,
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

        let url = this.state.haURL;
        if (!url) {
            return;
        }
        if (!(url.startsWith('https://') && url.startsWith('http://'))) {
            url = `http://${url}`;
        }

        this.props.checkAuthCallback(url)
            .then(haURL => {
                if (haURL) {
                    this.setState({ ...this.state, haURL });
                }
            });
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
                        <AuthContext.Consumer>
                            {auth => {
                                let websocketStatus = <Icon name='ok--v1' color={new Color('#00aa00')} />

                                let errMessage;
                                if (auth.websocketConnection instanceof Error) {
                                    errMessage = auth.websocketConnection.message;
                                } else if (auth.websocketAPI instanceof Error) {
                                    errMessage = auth.websocketAPI.message;
                                }

                                if (errMessage) {
                                    return (
                                        <>
                                            {/* TODO Error color */}
                                            <Icon name='circled-x' color={new Color('aa0000')} />
                                            {/* TODO Make hover */}
                                            {errMessage}
                                        </>
                                    );
                                }
                                return websocketStatus;
                            }}
                        </AuthContext.Consumer>
                    </div>
                    <input type='submit' value='Save' />
                </form>
                <div><Link to='/'>Back</Link></div>
            </>
        );
    }
};

export default Settings;