import React from 'react';
import { HaEntity } from '../../entities/ha-entity';
import './tile.css';

/** Props for a tile representing a single entity. */
export type TileProps = {
    entity: HaEntity,
    /** Map of additional parms to pass to a tile. */
    options?: TileOptions,
};

enum TileOption {
    Icon = 'icon',
    ShowName = 'showName',
};

export type TileOptions = {[key in TileOption]?: any};

type EntityTileProps = TileProps & {
    propsMapper: (entity: HaEntity, options?: TileOptions) => React.ReactElement,
    backgroundColorMapper?: (entity: HaEntity) => string | undefined,
}

/** Tile provides basic functionality and look-and-feel to a tile. */
const Tile = (props: EntityTileProps) =>
    <div className='tile' style={{
        backgroundColor: (props.backgroundColorMapper && props.backgroundColorMapper(props.entity)) || 'transparent',
    }}>
        <div className='content'>
            {props.propsMapper(props.entity, props.options)}
        </div>
    </div>

export default Tile;
