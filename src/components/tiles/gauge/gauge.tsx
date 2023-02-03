import { BaseEntityProps } from "../../base";
import { makeEntityTile, TileProps } from '../tile';

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

const GaugeTile = (props: TileProps) => makeEntityTile(
    props,
    props =>
        <Gauge
            key={props.entity.entityID.getCanonicalized()}
            entityID={props.entity.entityID}
            friendlyName={props.entity.friendlyName}
            icon={props.icon}
            state={props.entity.state}
            unit={props.entity.attributes['unit_of_measurement']}
        />
);

export default GaugeTile;
