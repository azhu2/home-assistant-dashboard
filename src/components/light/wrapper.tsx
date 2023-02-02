import { EntityWrapper, WrapperProps } from "../base";
import Light from "./light";

const LightWrapper: EntityWrapper = (props: WrapperProps) =>
    <Light
        key={props.entity.entityID.getCanonicalized()}
        entityID={props.entity.entityID}
        friendlyName={props.entity.friendlyName}
        icon={props.icon}
        state={props.entity.state === 'on'}
        brightness={props.entity.attributes['brightness']}
    />

export default LightWrapper;
