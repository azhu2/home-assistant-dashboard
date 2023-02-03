import React from 'react';
import { HaEntity } from '../../entities/ha-entity';
import './tile.css';

/** Props for a tile representing a single entity. */
export type TileProps = {
    entity: HaEntity,
    icon?: string,
}

type EntityTileProps = TileProps & {
    propsMapper: (entity: HaEntity, icon?: string) => React.ReactElement,
    backgroundColorMapper?: (entity: HaEntity) => string | undefined,
}

const Tile = (props: EntityTileProps) =>
    <div className='tile' style={{
        backgroundColor: props.backgroundColorMapper && props.backgroundColorMapper(props.entity) || 'transparent',
    }}>
        <div className='content'>
            {props.propsMapper(props.entity, props.icon)}
        </div>
    </div>

export default Tile;
