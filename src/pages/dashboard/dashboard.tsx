import * as haWebsocket from 'home-assistant-js-websocket';
import { Component } from 'react';
import { Navigate } from 'react-router-dom';
import * as haEntity from '../../types/ha-entity';
import { Layout } from '../../layout/layout';
import * as subscribedEntities from '../../mappers/subscribed-entities';
import * as authContext from '../../services/auth-context';
import { AuthContextConsumer } from '../../services/auth-context';
import * as websocket from '../../services/websocket/websocket';

type State = {
    entityMap: Map<string, haEntity.Entity>,
    unsubFunc?: haWebsocket.UnsubscribeFunc,
};

const initialState: State = {
    entityMap: new Map(),
    unsubFunc: undefined,
};

/** Dashboard wraps Layout with entity subscription and redirects to settings if auth fails. */
export class Dashboard extends Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = { ...initialState };
        this.setupSubscription = this.setupSubscription.bind(this);
    }

    componentWillUnmount() {
        if (this.state.unsubFunc) {
            this.state.unsubFunc();
        }
    }

    render() {
        return (<>
            <AuthContextConsumer>
                {context => {
                    const websocketConnection = context.websocketConnection;
                    if (this.state.entityMap.size === 0) {
                        if (!(websocketConnection instanceof Error)) {
                            this.setupSubscription(websocketConnection);
                        } else if (websocketConnection === authContext.errConnectionNotInitialized) {
                            // Expected error while AuthWrapper still initializing
                            console.info('Connection not established yet. Should retry.');
                        } else {
                            console.warn('Unable to automatically connect. Redirecting to settings.', websocketConnection);
                            return (
                                <Navigate to='/settings' />
                            );
                        }
                    }
                    return (
                        <Layout entityMap={this.state.entityMap} />
                    );
                }}
            </AuthContextConsumer>
        </>);
    }

    async setupSubscription(connection: websocket.Connection) {
        haWebsocket.subscribeEntities(connection, (entities) => {
            const newEntities = new Map(this.state.entityMap);

            Object.entries(entities).forEach(([entityID, entity]) => {
                if (subscribedEntities.subscribedEntities.has(entityID)) {
                    newEntities.set(entityID, haEntity.fromHassEntity(entity));
                }
            })

            this.setState({ ...this.state, entityMap: newEntities });
        });
    }
}
