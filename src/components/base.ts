import { Color } from '../entities/color';
import { EntityID } from '../entities/ha-entity';

/** A set of base props for any entity-specific component. */
export type BaseEntityProps = {
    entityID: EntityID,
    friendlyName?: string,
    icon?: string,
    /** Either a static color or one mapped from the entity. Since it can be mapped, it can be set in propsMapper. */
    backgroundColor?: Color | string,
};
