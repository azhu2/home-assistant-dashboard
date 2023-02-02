import React from 'react';
import { EntityID, HaEntity } from '../entities/ha-entity';

export type WrapperProps = {
    entity: HaEntity,
    icon?: string,
}

export type EntityWrapper = (props: WrapperProps) => React.ReactElement;

/** A set of base props for any entity-specific component. */
export type BaseEntityProps = {
    entityID: EntityID,
    friendlyName?: string,
    icon?: string,
};

