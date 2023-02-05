import { BaseEntityProps } from '../../base';
import Tile, { TileProps } from '../tile';

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

const CameraTile = (props: TileProps) =>
    <Tile
        entity={props.entity}
        options={props.options}
        propsMapper={
            (entity, options) =>
                <Camera
                    key={entity.entityID.getCanonicalized()}
                    entityID={entity.entityID}
                    friendlyName={entity.friendlyName}
                    icon={options?.icon}
                // snapshotURL={entity.attributes['entity_picture'] ? `${this.state.baseURL}${entity.attributes['entity_picture']}` : ''}
                />
        }
    />;

export default CameraTile;
