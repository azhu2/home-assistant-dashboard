import { BaseEntityProps } from "../../base";
import Tile, { TileProps } from '../tile';
import './gauge.css'

type Props = BaseEntityProps & {
    state: string,
    unit?: string,
    showName?: boolean,
}

function Gauge(props: Props) {
    return (
        <div className='gauge' id={props.entityID.getCanonicalized()}>
            {props.showName && <div className='name'>{props.friendlyName}</div>}
            <div className='values'>
                {/* extra div so superscript works with flexbox used to vertical-center values */}
                <div>
                    <span className='value'>{props.state}</span>
                    {props.unit && <span className='unit'>{props.unit || ''}</span>}
                </div>
            </div>
        </div>
    );
}

const GaugeTile = (props: TileProps) =>
    <Tile
        entity={props.entity}
        options={props.options}
        propsMapper={
            (entity, options) =>
                <Gauge
                    key={entity.entityID.getCanonicalized()}
                    entityID={entity.entityID}
                    friendlyName={entity.friendlyName}
                    icon={options?.icon}
                    state={entity.state}
                    unit={entity.attributes['unit_of_measurement']}
                    showName={options?.showName}
                />
        }
    />;

export default GaugeTile;
