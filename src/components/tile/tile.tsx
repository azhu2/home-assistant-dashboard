import { ComponentType } from 'react';
import * as color from '../../types/color';
import * as formatter from '../../types/formatter';
import * as haEntity from '../../types/ha-entity';
import * as base from '../base';
import { Icon } from '../icon/icon';
import * as icon from '../icon/icon';
import './tile.css';

/** Additional options for tile customzation. */
export type Options = {
    icon?: string | icon.Props,
    showName?: boolean,
    /** Secondary entities to provide to a tile props mapper */
    secondaryEntities?: haEntity.Entity[],
    secondaryIcons?: (string | icon.Props)[],
    hideIfUnavailable?: boolean,
    formatter?: formatter.Formatter<any>,
};

/** A free-form set of props to be passed to the tile unchanged */
export type TileProps = {
    [key: string]: any,
};

type AdditionalMappedProps = {
    history?: any,  // TODO Build struct
}

/** Stripping all BaseEntityProps by default unless they should be passed to propsMapper. */
type StrippedProps<P extends base.BaseEntityProps> = Omit<P, keyof base.BaseEntityProps> & Pick<base.BaseEntityProps, 'backgroundColor'> & Pick<Options, 'icon'>;
/** All  */
export type MappedProps<P extends base.BaseEntityProps> = StrippedProps<P> & AdditionalMappedProps;

export interface MappableProps<P extends base.BaseEntityProps> {
    propsMapper(entity: haEntity.Entity, options?: Options): MappedProps<P>,
}

/** Takes a tile component, wraps it in a Tile, and populates its props from its entity. */
export const wrapTile = (entity: haEntity.Entity, options?: Options, tileProps?: TileProps) => <P extends base.BaseEntityProps>(WrappedTile: ComponentType<P>) => {
    const tileType = WrappedTile.name.toLowerCase();
    const entityID = entity.entityID.getCanonicalized().replaceAll(/[._]/g, '-');

    if (entity.state === 'unavailable') {
        if (options?.hideIfUnavailable) {
            return (
                <></>
            )
        }
        let icon;
        if (options?.icon) {
            if (typeof options.icon === 'string') {
                icon = <Icon name={options.icon} color='#cccccc' />;
            } else {
                const iconOopts = { ...options.icon, color: '#cccccc' }
                icon = <Icon {...iconOopts} />
            }
        }
        return (
            <div className={`tile tile-${tileType} tile-${entityID}`} style={{ backgroundColor: '#aaaaaa' }}>
                {options?.showName && <div className='name'>{entity.friendlyName}</div>}
                <div className='content'>
                    {icon}
                    <div className={`${tileType} entity-unavailable`}>
                        Unavailable
                    </div>
                </div>
            </div>
        )
    }

    // Would love to define an abstract TileComponent that extends Component and implements (static) PropsMappable, but, alas, not in Typescript.
    // So we have to type assert here :(
    let mappedProps: MappedProps<P> | undefined;
    if (WrappedTile.prototype as MappableProps<P>) {
        mappedProps = WrappedTile.prototype.propsMapper(entity, options);
    }

    const props = {
        entityID: entity.entityID,
        friendlyName: entity.friendlyName,
        icon: options?.icon,
        ...mappedProps,
        ...tileProps,
    }

    let backgroundColor = 'transparent';
    if (mappedProps?.backgroundColor) {
        const colorVar = mappedProps.backgroundColor;
        backgroundColor = colorVar instanceof color.Color ? colorVar.rgbString(true) : colorVar;
    }

    return (
        // Would be nice to wrap this in a neat component with entity as a prop, but that runs afouls of
        // "Don't use HOCs inside the render method" (https://reactjs.org/docs/higher-order-components.html#dont-use-hocs-inside-the-render-method)
        // and React will unmount + remount the whole component every update since we're recreated a whole NEW object.
        // Returning a raw JSX.Element doesn't trigger this and the WrappedTile inside only updates its props, never unmounting the whole component.
        <div className={`tile tile-${tileType} tile-${entityID}`} style={{ backgroundColor }}>
            {options?.showName && <div className='name'>{entity.friendlyName}</div>}
            <div className='content'>
                <WrappedTile
                    {...props as P}
                />
            </div>
        </div>
    );
}

