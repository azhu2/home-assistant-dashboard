import { Component } from 'react';
import { HaEntity } from '../../entities/ha-entity';
import { BaseEntityProps } from '../base';
import './tile.css';

/** Additional options for tile customzation. */
enum TileOption {
    Icon = 'icon',
    ShowName = 'showName',
};
export type TileOptions = { [key in TileOption]?: any };

/** A wrapper around React.Component that forces a propsMapper function. */
export abstract class TileComponent<P extends BaseEntityProps, S = {}> extends Component<P, S> {
    /** A mapper for additional (beyond BaseEntityProps) props to map to a specific tile component. */
    abstract propsMapper(entity: HaEntity): Omit<P, keyof BaseEntityProps>;
}

/** Takes a tile component, wraps it in a Tile, and populates its props from its entity. */
export const wrapTile = (entity: HaEntity, options?: TileOptions) => <P extends BaseEntityProps, S>(WrappedTile: typeof TileComponent<P, S>) => {
    const props = {
        entityID: entity.entityID,
        friendlyName: entity.friendlyName,
        icon: options?.icon,
        ...WrappedTile.prototype.propsMapper(entity),
    }

    return (
        <div className={`tile tile-${WrappedTile.name.toLowerCase()}`}>
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
