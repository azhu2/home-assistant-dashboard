import * as color from '../types/color';
import * as haEntity from '../types/ha-entity';
import * as icon from './icon/icon';

/** A set of base props for any entity-specific component. */
export type BaseEntityProps = {
    entityID: haEntity.EntityID,
    friendlyName?: string,
    icon?: string | icon.Props,
    /** Either a static color or one mapped from the entity. Since it can be mapped, it can be set in propsMapper. */
    backgroundColor?: color.Color | string,
};
