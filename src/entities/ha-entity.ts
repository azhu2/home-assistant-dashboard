import { HassEntity } from "home-assistant-js-websocket";
import Type from "./type";

export type HaEntity = {
    entityID: EntityID,
    type: Type,
    state: string,
    friendlyName?: string,
    attributes: {[key: string]: any},
}

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

export function fromHassEntity(e: HassEntity, t: Type): HaEntity {
    return {
        entityID: new EntityID(e.entity_id),
        type: t,
        state: e.state,
        friendlyName: e.attributes.friendly_name,
        attributes: e.attributes,
    };
}
