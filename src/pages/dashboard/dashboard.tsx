import { subscribeEntities, UnsubscribeFunc } from 'home-assistant-js-websocket';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { fromHassEntity, HaEntity } from '../../entities/ha-entity';
import Layout from '../../layout/layout';
import entityTypeMap from '../../mappers/entity-types';
import { ErrConnectionNotInitialized, AuthContext } from '../../services/context';
import { WebsocketConnection } from '../../services/websocket/websocket';

type State = {
    entityMap: Map<string, HaEntity>,
    unsubFunc?: UnsubscribeFunc,
};

const initialState: State = {
    entityMap: new Map(),
    unsubFunc: undefined,
};

/** Dashboard wraps Layout with entity subscription and redirects to settings if auth fails. */
class Dashboard extends React.Component<{}, State> {
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
            <AuthContext.Consumer>
                {context => {
                    const websocketConnection = context.websocketConnection;
                    if (this.state.entityMap.size === 0) {
                        if (!(websocketConnection instanceof Error)) {
                            this.setupSubscription(websocketConnection);
                        } else if (websocketConnection === ErrConnectionNotInitialized) {
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
            </AuthContext.Consumer>
        </>);
    }

    async setupSubscription(connection: WebsocketConnection) {
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
}

export default Dashboard;
