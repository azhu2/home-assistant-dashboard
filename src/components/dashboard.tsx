import React from 'react';
import {
    Auth,
    createConnection,
    Connection,
    getAuth,
    getAuthOptions,
    subscribeEntities,
} from 'home-assistant-js-websocket';
import Light from './light/light';
import getType from '../mappings/types';
import { fromHassEntity, HaEntity } from '../entities/ha-entity';

type State = {
    connection?: Connection,
    entities: Map<string, HaEntity>,
};

const initialState: State = {
    connection: undefined,
    entities: new Map(),
};

class Dashboard extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = { ...initialState };
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
        const lightProps = Array.from(this.state.entities, ([entityID, entity]) => (
            <Light
                key={entityID}
                entityID={entityID}
                friendlyName={entity.friendlyName}
                state={entity.state == 'on'}
                brightness={entity.attributes['brightness']}
            />)
        );
        return (<>
            <p>WIP Home Assistant Dashboard</p>
            <div className='lights'>
                {lightProps}
            </div>
        </>);
    }

    async connectToHA(): Promise<Connection> {
        const auth = await this.authenticate();
        const c = await createConnection({ auth });
        this.setState({ ...this.state, connection: c });
        return c;
    }

    async setupSubscription(connection: Connection) {
        subscribeEntities(connection, (entities) => {
            const newEntities = new Map(this.state.entities);

            Object.entries(entities).forEach(entry => {
                const [entityID, entity] = entry;

                const type = getType(entityID)
                if (type) {
                    newEntities.set(entityID, fromHassEntity(entity, type));
                }
            })

            this.setState({ ...this.state, entities: newEntities });
        });
    }

    async authenticate(hassUrl?: string | null): Promise<Auth> {
        const options: getAuthOptions = {
            hassUrl: hassUrl == null ? undefined : hassUrl,
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
            return await getAuth(options);
        } catch (err) {
            const hassUrl = prompt(
                `[Error ${err}] What host to connect to?`,
                "http://localhost:8123"
            );
            // Spin until auth succeeds
            return await this.authenticate(hassUrl);
        }
    }
}

export default Dashboard;
