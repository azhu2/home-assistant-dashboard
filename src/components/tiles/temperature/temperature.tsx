import { BaseEntityProps } from "../../base";
import Tile, { TileProps } from "../tile";

type Props = BaseEntityProps & {
    state: number;
}

const Temperature = (props: Props) =>
    <div>{props.state}</div>

const TemperatureTile = (props: TileProps) =>
    <Tile
        entity={props.entity}
        icon={props.icon}
        propsMapper={
            (entity, icon) =>
                <Temperature
                    key={entity.entityID.getCanonicalized()}
                    entityID={entity.entityID}
                    friendlyName={entity.friendlyName}
                    icon={icon}
                    state={parseFloat(entity.state)}
                />
        }
    />;

export default TemperatureTile;