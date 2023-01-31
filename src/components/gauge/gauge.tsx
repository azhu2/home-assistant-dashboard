import BaseEntityProps from "../base";

type Props = BaseEntityProps & {
    state: string,
    unit?: string,
}

function Gauge(props: Props) {
    return(
        <div className="gauge" id={props.entityID.getCanonicalized()}>
            {props.friendlyName} | {props.state} {props.unit || ''}
        </div>
    );
}

export default Gauge;
