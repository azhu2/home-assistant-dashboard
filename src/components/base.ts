import { EntityID } from "../entities/ha-entity";

/** A set of base props for any entity-specific component. */
export type BaseEntityProps = {
    entityID: EntityID,
    friendlyName?: string,
    icon?: string,
};
