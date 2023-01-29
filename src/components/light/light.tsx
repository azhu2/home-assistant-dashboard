type Props = {
    entityID: string,
    friendlyName?: string,
    state: boolean,
    brightness?: number,
}

function Light(props: Props) {
    return(
        <div className="light" id={props.entityID}>
            {props.friendlyName} | {props.state ? 'on' : 'off'} | {props.brightness ? props.brightness : ''}
        </div>
    );
}

export default Light;
