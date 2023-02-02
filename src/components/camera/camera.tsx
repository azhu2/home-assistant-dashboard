import { BaseEntityProps } from "../base";

type Props = BaseEntityProps & {
    snapshotURL?: string,
}

function Camera(props: Props) {
    return(
        <div className="camera" id={props.entityID.getCanonicalized()}>
            {props.friendlyName}
            {/* Camera image seems iffy - ratelimiting? Try RTSP instead - see what the card does? */}
            {/* {props.snapshotURL && <img src={props.snapshotURL} height="100px" />} */}
        </div>
    );
}

export default Camera;
