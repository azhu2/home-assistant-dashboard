import React from 'react';
import { HaEntity } from '../../entities/ha-entity';

/** Props for a tile representing a single entity. */
export type TileProps = {
    entity: HaEntity,
    icon?: string,
}

/** Factory to create a tile for an entity.
 * @param props         the entity and optional icon.
 * @param propsMapper   function mapping props to the child element inside the tile.
 */
export const makeEntityTile = (props: TileProps, propsMapper: (props: TileProps) => React.ReactElement) =>
    <div className='tile'>
        {propsMapper(props)}
    </div>
    ;

