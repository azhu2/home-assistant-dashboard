import { Component } from 'react';
import { Color } from '../../entities/color';
import { HaEntity } from '../../entities/ha-entity';
import { BaseEntityProps } from '../base';
import './tile.css';

/** Additional options for tile customzation. */
export type TileOptions = {
    icon?: string,
    showName?: boolean,
};

export type MappableProps<P> = Omit<P, keyof BaseEntityProps> | Pick<BaseEntityProps, 'backgroundColor'>;

/** A wrapper around React.Component that forces a propsMapper function. */
export abstract class TileComponent<P extends BaseEntityProps, S = {}> extends Component<P, S> {
    /** A mapper for additional (beyond BaseEntityProps) props to map to a specific tile component. */
    abstract propsMapper(entity: HaEntity): MappableProps<P>;
}

/** Takes a tile component, wraps it in a Tile, and populates its props from its entity. */
export const wrapTile = (entity: HaEntity, options?: TileOptions) => <P extends BaseEntityProps, S>(WrappedTile: typeof TileComponent<P, S>) => {
    const mappedProps = WrappedTile.prototype.propsMapper(entity);
    const props = {
        entityID: entity.entityID,
        friendlyName: entity.friendlyName,
        icon: options?.icon,
        ...mappedProps,
    }

    const tileType = WrappedTile.name.toLowerCase();
    let backgroundColor = 'transparent';
    if (mappedProps?.backgroundColor) {
        const colorVar = mappedProps.backgroundColor;
        backgroundColor = colorVar instanceof Color ? colorVar.rgbString(true) : colorVar;
    }

    return (
        <div className={`tile tile-${tileType}`} style={{ backgroundColor }}>
            {options?.showName && <div className='name'>{entity.friendlyName}</div>}
            <div className='content'>
                <WrappedTile
                    {...props as P}
                />
            </div>
        </div>
    );
}

export default wrapTile;
