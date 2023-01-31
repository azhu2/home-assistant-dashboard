import {
    Auth, Connection, createConnection, getAuth,
    getAuthOptions,
    subscribeEntities
} from 'home-assistant-js-websocket';
import React from 'react';
import Camera from '../components/camera/camera';
import Gauge from '../components/gauge/gauge';
import Light from '../components/light/light';
import { EntityID, EntityType, fromHassEntity, HaEntity } from '../entities/ha-entity';
import getType from '../mappings/types';
import { ConnectionContext } from '../services/websocket-service/context';

type State = {
    connection?: Connection,
    baseURL?: string,
    entities: Map<string, HaEntity>,
};

const initialState: State = {
    connection: undefined,
    baseURL: 'http://localhost:8123',
    entities: new Map(),
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
        const allProps = Array.from(this.state.entities, ([id, entity]) => {
            const entityID = new EntityID(id);
            switch (entity.type) {
                case EntityType.Light:
                    return (<Light
                        key={entityID.getCanonicalized()}
                        entityID={entityID}
                        friendlyName={entity.friendlyName}
                        state={entity.state === 'on'}
                        brightness={entity.attributes['brightness']}
                    />);
                case EntityType.Gauge:
                    return (<Gauge
                        key={entityID.getCanonicalized()}
                        entityID={entityID}
                        friendlyName={entity.friendlyName}
                        state={entity.state}
                        unit={entity.attributes['unit_of_measurement']}
                    />);
                case EntityType.Camera:
                    return (<Camera
                        key={entityID.getCanonicalized()}
                        entityID={entityID}
                        friendlyName={entity.friendlyName}
                        snapshotURL={entity.attributes['entity_picture'] ? `${this.state.baseURL}${entity.attributes['entity_picture']}` : ''}
                    />);
                default:
                    console.warn(`Unrecognized entity type ${entity.type} for ${entityID}`)
            }
        });
        return (<>
            <ConnectionContext.Provider value={this.state.connection}>
                <p>WIP Home Assistant Dashboard</p>
                <div className='lights'>
                    {allProps}
                </div>
            </ConnectionContext.Provider>

            <div>
                TODO Footer: <a target="_blank" href="https://icons8.com/">Icons by Icons8</a>
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
                "http://localhost:8123"
            );
            // Spin until auth succeeds
            return await this.authenticate(hassURL);
        }
    }
}

export default Dashboard;
