import { HassEntity } from "home-assistant-js-websocket";
import Type from "./type";

export type HaEntity = {
    entityID: string,
    type: Type,
    state: string,
    friendlyName?: string,
    attributes: {[key: string]: any},
}

export function fromHassEntity(e: HassEntity, t: Type): HaEntity {
    return {
        entityID: e.entity_id,
        type: t,
        state: e.state,
        friendlyName: e.attributes.friendly_name,
        attributes: e.attributes,
    };
}
