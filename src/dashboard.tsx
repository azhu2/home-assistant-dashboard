import React from 'react';
import {
    Auth,
    createConnection,
    Connection,
    getAuth,
    getAuthOptions,
    subscribeEntities,
    HassEntity,
} from 'home-assistant-js-websocket';
import Light from './components/light/light';

const LIGHT_ENTITY_IDS = [
    'switch.marble_lamp',
    'switch.pendant_lamp',
    'light.family_room_lights',
    'light.family_room_chandelier',
    'switch.cat_den',
    'switch.kitchen_chandelier',
    'switch.kitchen_lights',
];

type State = {
    connection?: Connection,
    lightEntities: Map<string, HassEntity>,
};

const initialState: State = {
    connection: undefined,
    lightEntities: new Map(),
};

class Dashboard extends React.Component<{}, State> {
    constructor() {
        super({});
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
        const lightProps = Array.from(this.state.lightEntities, ([entityID, entity]) => (
            <Light
                key={entityID}
                entityID={entityID}
                friendlyName={entity.attributes.friendly_name}
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
        this.setState({...this.state, connection: c});
        return c;
    }

    async setupSubscription(connection: Connection) {
        subscribeEntities(connection, (entities) => {
            const newLightEntities = new Map(this.state.lightEntities);

            Object.entries(entities).forEach(entry => {
                const [entityID, entity] = entry;
                if (LIGHT_ENTITY_IDS.includes(entityID)) {
                    newLightEntities.set(entityID, entity);
                }
            })

            this.setState({ ...this.state, lightEntities: newLightEntities });

            console.log("Entities found:", Object.keys(entities));
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