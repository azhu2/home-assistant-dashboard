import React from 'react';
import { HaEntity } from '../../entities/ha-entity';
import './tile.css';

/** Props for a tile representing a single entity. */
export type TileProps = {
    entity: HaEntity,
    options?: TileOptions,
};

export enum TileOption {
    Icon = "icon",
};

export type TileOptions = {[key in TileOption]: any};

type EntityTileProps = TileProps & {
    propsMapper: (entity: HaEntity, options?: TileOptions) => React.ReactElement,
    backgroundColorMapper?: (entity: HaEntity) => string | undefined,
}

const Tile = (props: EntityTileProps) =>
    <div className='tile' style={{
        backgroundColor: props.backgroundColorMapper && props.backgroundColorMapper(props.entity) || 'transparent',
    }}>
        <div className='content'>
            {props.propsMapper(props.entity, props.options)}
        </div>
    </div>

export default Tile;
