import { BaseEntityProps } from "../../base";
import { makeEntityTile, TileProps } from '../tile';

type Props = BaseEntityProps & {
    snapshotURL?: string,
}

function Camera(props: Props) {
    return (
        <div className='camera' id={props.entityID.getCanonicalized()}>
            {props.friendlyName}
            {/* Camera image seems iffy - ratelimiting? Try RTSP instead - see what the card does? */}
            {/* {props.snapshotURL && <img src={props.snapshotURL} height='100px' />} */}
        </div>
    );
}

const CameraTile = (props: TileProps) => makeEntityTile(
    props,
    props =>
        <Camera
            key={props.entity.entityID.getCanonicalized()}
            entityID={props.entity.entityID}
            friendlyName={props.entity.friendlyName}
            icon={props.icon}
        // snapshotURL={entity.attributes['entity_picture'] ? `${this.state.baseURL}${entity.attributes['entity_picture']}` : ''}
        />
);

export default CameraTile;
