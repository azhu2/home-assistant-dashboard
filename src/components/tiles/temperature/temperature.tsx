import { BaseEntityProps } from "../../base";
import { makeEntityTile, TileProps } from "../tile";

type Props = BaseEntityProps & {
    state: number;
}

const Temperature = (props: Props) =>
    <div>{props.state}</div>

const TemperatureTile = (props: TileProps) => makeEntityTile(
    props,
    props =>
        <Temperature
            key={props.entity.entityID.getCanonicalized()}
            entityID={props.entity.entityID}
            friendlyName={props.entity.friendlyName}
            icon={props.icon}
            state={parseFloat(props.entity.state)}
        />
);

export default TemperatureTile;