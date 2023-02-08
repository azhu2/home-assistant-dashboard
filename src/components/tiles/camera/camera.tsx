import { Component } from 'react';
import { AuthContext } from '../../../services/context';
import { BaseEntityProps } from '../../base';
import Tile, { TileProps } from '../tile';
import './camera.css';

type Props = BaseEntityProps & {
    snapshotURL?: string,
}

class Camera extends Component<Props> {
    render() {
        return (
            <div className='camera' id={this.props.entityID.getCanonicalized()}>
                <AuthContext.Consumer>
                    {auth => {
                        const { restAPI } = auth;
                        if (!(restAPI instanceof Error) && this.props.snapshotURL) {
                            return (
                                <img
                                    className='camera-snapshot'
                                    src={`${restAPI.getBaseURL()}${this.props.snapshotURL}`}
                                    alt={this.props.friendlyName}
                                />
                            );
                        }
                    }}
                </AuthContext.Consumer>
            </div>
        );
    };
}

const CameraTile = (props: TileProps) =>
    <Tile
        entity={props.entity}
        tileType='camera'
        options={props.options}
        propsMapper={
            (entity, options) =>
                <Camera
                    key={entity.entityID.getCanonicalized()}
                    entityID={entity.entityID}
                    friendlyName={entity.friendlyName}
                    icon={options?.icon}
                    snapshotURL={entity.attributes['entity_picture']}
                />
        }
    />

export default CameraTile;
