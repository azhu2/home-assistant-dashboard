import { ComponentType } from 'react';
import { Color } from '../../entities/color';
import { HaEntity } from '../../entities/ha-entity';
import { BaseEntityProps } from '../base';
import './tile.css';

/** Additional options for tile customzation. */
export type TileOptions = {
    icon?: string,
    showName?: boolean,
    fetchHistory?: boolean,
};

type AdditionalMappedProps = {
    history?: any,  // TODO Build struct
}

/** Stripping all BaseEntityProps by default unless they should be passed to propsMapper. */
type StrippedProps<P extends BaseEntityProps> = Omit<P, keyof BaseEntityProps> & Pick<BaseEntityProps, 'backgroundColor'>;
/** All  */
export type MappedProps<P extends BaseEntityProps> = StrippedProps<P> & AdditionalMappedProps;

export interface MappableProps<P extends BaseEntityProps> {
    propsMapper(entity: HaEntity): MappedProps<P>,
}

/** Takes a tile component, wraps it in a Tile, and populates its props from its entity. */
export const wrapTile = (entity: HaEntity, options?: TileOptions) => <P extends BaseEntityProps>(WrappedTile: ComponentType<P>) => {
    // Would love to define an abstract TileComponent that extends React.Component and implements (static) PropsMappable, but, alas, not in Typescript.
    // So we have to type assert here :(
    let mappedProps: MappedProps<P> | undefined;
    if (WrappedTile.prototype as MappableProps<P>) {
        mappedProps = WrappedTile.prototype.propsMapper(entity);
    }

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
        // Would be nice to wrap this in a neat component with entity as a prop, but that runs afouls of
        // "Don't use HOCs inside the render method" (https://reactjs.org/docs/higher-order-components.html#dont-use-hocs-inside-the-render-method)
        // and React will unmount + remount the whole component every update since we're recreated a whole NEW object.
        // Returning a raw JSX.Element doesn't trigger this and the WrappedTile inside only updates its props, never unmounting the whole component.
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
