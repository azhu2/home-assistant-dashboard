import { EntityWrapper, WrapperProps } from "../base";
import Camera from "./camera";

const CameraWrapper: EntityWrapper = (props: WrapperProps) =>
    <Camera
        key={props.entity.entityID.getCanonicalized()}
        entityID={props.entity.entityID}
        friendlyName={props.entity.friendlyName}
        icon={props.icon}
        // snapshotURL={entity.attributes['entity_picture'] ? `${this.state.baseURL}${entity.attributes['entity_picture']}` : ''}
    />

export default CameraWrapper;
