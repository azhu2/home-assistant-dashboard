import BaseProps from "../base";

type Props = BaseProps & {
    state: boolean,
    brightness?: number,
}

function Light(props: Props) {
    return(
        <div className="light" id={props.entityID}>
            {props.friendlyName} | {props.state ? 'on' : 'off'} {props.brightness || ''}
        </div>
    );
}

export default Light;
