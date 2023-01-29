import BaseProps from "../base";

type Props = BaseProps & {
    snapshotURL?: string,
}

function Camera(props: Props) {
    return(
        <div className="canera" id={props.entityID}>
            {props.friendlyName}
            {/* Camera image seems iffy - ratelimiting? Try RTSP instead - see what the card does? */}
            {/* {props.snapshotURL && <img src={props.snapshotURL} height="100px" />} */}
        </div>
    );
}

export default Camera;
