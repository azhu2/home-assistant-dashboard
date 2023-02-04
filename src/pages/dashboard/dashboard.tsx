import {
    Auth, Connection, createConnection, getAuth,
    getAuthOptions,
    subscribeEntities
} from 'home-assistant-js-websocket';
import React from 'react';
import { Link } from 'react-router-dom';
import { fromHassEntity, HaEntity } from '../../entities/ha-entity';
import Layout from '../../layout/layout';
import entityTypeMap from '../../mappers/entity-types';
import { ConnectionContext } from '../../services/websocket-service/context';

type State = {
    connection?: Connection,
    baseURL?: string,
    entityMap: Map<string, HaEntity>,
};

const initialState: State = {
    connection: undefined,
    baseURL: 'http://localhost:8123',
    entityMap: new Map(),
};

class Dashboard extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = { ...initialState };
        this.connectToHA = this.connectToHA.bind(this);
        this.setupSubscription = this.setupSubscription.bind(this);
    }

    componentDidMount() {
        this.connectToHA()
            .then(this.setupSubscription)
            .catch(err => alert(`Unable to connect to Home Assistant: ${err}`));
    }

    componentWillUnmount() {
        this.state.connection?.close()
    }

    render() {
        return (<>
            <ConnectionContext.Provider value={this.state.connection}>
                <p>WIP Home Assistant Dashboard</p>
                <Layout entityMap={this.state.entityMap} />
            </ConnectionContext.Provider>

            <div>
                <p><Link to='/settings'>Settings</Link></p>
                <p>TODO Footer: <a href='https://icons8.com/' target='_blank' rel='noreferrer'>Icons by Icons8</a></p>
            </div>
        </>);
    }

    async connectToHA(): Promise<Connection> {
        const auth = await this.authenticate();
        const c = await createConnection({ auth });
        this.setState({
            ...this.state,
            connection: c,
            baseURL: auth.data.hassUrl,
        });
        return c;
    }

    async setupSubscription(connection: Connection) {
        subscribeEntities(connection, (entities) => {
            const newEntities = new Map(this.state.entityMap);

            Object.entries(entities).forEach(entry => {
                const [entityID, entity] = entry;

                const type = entityTypeMap[entityID]
                if (type) {
                    newEntities.set(entityID, fromHassEntity(entity, type));
                }
            })

            this.setState({ ...this.state, entityMap: newEntities });
        });
    }

    async authenticate(hassURL?: string | null): Promise<Auth> {
        const options: getAuthOptions = {
            hassUrl: hassURL === null ? undefined : hassURL,
            saveTokens: (tokens) => {
                localStorage.haTokens = JSON.stringify(tokens);
            },
            loadTokens: () => {
                try {
                    return JSON.parse(localStorage.haTokens);
                } catch {
                    return undefined;
                }
            },
        };
        try {
            // Try to pick up authentication after user logs in
            const auth = await getAuth(options);
            return auth;
        } catch (err) {
            const hassURL = prompt(
                `[Error ${err}] What host to connect to?`,
                'http://localhost:8123'
            );
            // Spin until auth succeeds
            return await this.authenticate(hassURL);
        }
    }
}

export default Dashboard;
