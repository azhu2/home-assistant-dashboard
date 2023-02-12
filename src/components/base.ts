import * as color from '../entities/color';
import * as haEntity from '../entities/ha-entity';

/** A set of base props for any entity-specific component. */
export type BaseEntityProps = {
    entityID: haEntity.EntityID,
    friendlyName?: string,
    icon?: string,
    /** Either a static color or one mapped from the entity. Since it can be mapped, it can be set in propsMapper. */
    backgroundColor?: color.Color | string,
};
