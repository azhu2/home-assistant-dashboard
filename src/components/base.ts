import { EntityID } from "../entities/ha-entity";

/** A set of base props for any entity-specific component. */
type BaseEntityProps = {
    entityID: EntityID,
    friendlyName?: string,
    icon?: string,
};

export default BaseEntityProps;
