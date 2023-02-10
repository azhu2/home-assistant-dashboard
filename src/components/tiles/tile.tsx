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
    history?: any,
}

/** Stripping all BaseEntityProps by default unless they should be passed to propsMapper. */
type StrippedProps<P extends BaseEntityProps> = Omit<P, keyof BaseEntityProps> & Pick<BaseEntityProps, 'backgroundColor'>;
/** All  */
export type MappedProps<P extends BaseEntityProps> = StrippedProps<P> & AdditionalMappedProps;

export interface MappableProps<P extends BaseEntityProps> {
    propsMapper(entity: HaEntity): MappedProps<P>,
}

/** Takes an entity and options and returns a higher-order component that wraps a component in a Tile and populates its props from the entity and options. */
export const wrapTile = (entity: HaEntity, options?: TileOptions) => <P extends BaseEntityProps>(TileComponent: ComponentType<P>) => {
    type WrapperProps = {
        entity: HaEntity,
        options?: TileOptions,
        mappedProps?: MappedProps<P>,
        tileType: string,
        backgroundColor: string,
    };

    const Tile = (props: WrapperProps) => (
        <div className={`tile tile-${props.tileType}`} style={{ backgroundColor: props.backgroundColor }}>
            {props.options?.showName && <div className='name'>{props.entity.friendlyName}</div>}
            <div className='content'>
                <TileComponent
                    {...props.mappedProps as P}
                    entityID={props.entity.entityID}
                    friendlyName={props.entity.friendlyName}
                    icon={props.options?.icon}
                />
            </div>
        </div>
    );

    // Would love to define an abstract TileComponent that extends React.Component and implements (static) PropsMappable, but, alas, not in Typescript.
    // So we have to type assert here :(
    // let mappedProps: MappedProps<P> | undefined;
    // if (TileComponent.prototype as MappableProps<P>) {
        const mappedProps = (TileComponent.prototype as MappableProps<P>).propsMapper(entity);
    // }

    const tileType = TileComponent.name.toLowerCase();
    let backgroundColor = 'transparent';
    if (mappedProps?.backgroundColor) {
        const colorVar = mappedProps.backgroundColor;
        backgroundColor = colorVar instanceof Color ? colorVar.rgbString(true) : colorVar;
    }

    return (
        <Tile
            entity={entity}
            options={options}
            mappedProps={mappedProps}
            tileType={tileType}
            backgroundColor={backgroundColor}
        />
    );
};

export default wrapTile;
