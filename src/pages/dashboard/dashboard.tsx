import { Connection, subscribeEntities, UnsubscribeFunc } from 'home-assistant-js-websocket';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { fromHassEntity, HaEntity } from '../../entities/ha-entity';
import Layout from '../../layout/layout';
import entityTypeMap from '../../mappers/entity-types';
import { ConnectionContext, ErrConnectionNotInitialized } from '../../services/websocket/context';

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
            <ConnectionContext.Consumer>
                {connection => {
                    if (this.state.entityMap.size === 0) {
                        if (connection instanceof Connection) {
                            this.setupSubscription(connection);
                        } else if (connection === ErrConnectionNotInitialized) {
                            // Expected error while AuthWrapper still initializing
                            console.info('Connection not established yet. Should retry or redirect.');
                        } else {
                            console.warn('Unable to automatically connect. Redirecting to settings.', connection);
                            return (
                                <Navigate to='/settings' />
                            );
                        }
                    }
                    return (
                        <Layout entityMap={this.state.entityMap} />
                    );
                }}
            </ConnectionContext.Consumer>
        </>);
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
}

export default Dashboard;