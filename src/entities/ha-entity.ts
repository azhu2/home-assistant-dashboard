import * as haWebsocket from 'home-assistant-js-websocket';
import * as entityMapper from '../mappers/renamed-entities';

/** Internal representation of a Home Assistant entity, with some attributes mapped more nicely. */
export type Entity = {
    entityID: EntityID,
    type: EntityType,
    state: string,
    friendlyName?: string,
    attributes: {[key: string]: any},
}

/** Internal representation of a Home Assistant entityID, split by domain and value. */
export class EntityID {
    domain: string;
    value: string;

    constructor(entityID: string){
        const split = entityID.split('.');
        if (split.length < 2) {
            throw new Error(`EntityID missing domain and value separated by dot - ${entityID}`)
        }
        this.domain = split[0];
        this.value = split.slice(1).join();
    }

    getDomain(): string {
        return this.domain;
    }

    getCanonicalized(): string {
        return `${this.domain}.${this.value}`;
    }
}

/** Internal representation of a Home Assistant entity type. */
export enum EntityType {
    Light = 'light',
    Gauge = 'gauge',
    Camera = 'camera',
    Garage = 'garage',
    Switch = 'switch',
}

/** Converts from built-in HassEntity type to our HaEntity type. */
export function fromHassEntity(e: haWebsocket.HassEntity, t: EntityType): Entity {
    return {
        entityID: new EntityID(e.entity_id),
        type: t,
        state: e.state,
        friendlyName: entityMapper.renamedEntityMap[e.entity_id] || e.attributes.friendly_name,
        attributes: e.attributes,
    };
}

export type Stream = {
    url: string;
};

export type History = HistoryEntry[];

type HistoryEntry = {
    timestamp: Date,
    value: string | number,
};
