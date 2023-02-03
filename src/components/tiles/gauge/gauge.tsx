import { BaseEntityProps } from "../../base";
import Tile, { TileProps } from '../tile';

type Props = BaseEntityProps & {
    state: string,
    unit?: string,
}

function Gauge(props: Props) {
    return (
        <div className='gauge' id={props.entityID.getCanonicalized()}>
            {props.friendlyName} | {props.state} {props.unit || ''}
        </div>
    );
}

const GaugeTile = (props: TileProps) =>
    <Tile
        entity={props.entity}
        icon={props.icon}
        propsMapper={
            (entity, icon) =>
                <Gauge
                    key={entity.entityID.getCanonicalized()}
                    entityID={entity.entityID}
                    friendlyName={entity.friendlyName}
                    icon={icon}
                    state={entity.state}
                    unit={entity.attributes['unit_of_measurement']}
                />
        }
    />;

export default GaugeTile;
