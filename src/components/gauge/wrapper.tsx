import { EntityWrapper, WrapperProps } from "../base";
import Gauge from "./gauge";

const GauageWrapper: EntityWrapper = (props: WrapperProps) =>
    <Gauge
        key={props.entity.entityID.getCanonicalized()}
        entityID={props.entity.entityID}
        friendlyName={props.entity.friendlyName}
        icon={props.icon}
        state={props.entity.state}
        unit={props.entity.attributes['unit_of_measurement']}
    />

export default GauageWrapper;
