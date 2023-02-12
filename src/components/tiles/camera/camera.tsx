import { Component } from 'react';
import { HaEntity } from '../../../entities/ha-entity';
import { AuthContext } from '../../../services/context';
import { BaseEntityProps } from '../../base';
import { MappedProps, MappableProps } from '../../tile/tile';
import './camera.css';

type Props = BaseEntityProps & {
    streamURL?: string,
}

class Camera extends Component<Props> implements MappableProps<Props>{
    propsMapper(entity: HaEntity): MappedProps<Props> {
        let streamURL: string | undefined;
        const snapshotURL = entity.attributes['entity_picture'];
        if (typeof snapshotURL === "string") {
            /** Undocumented, but camera_proxy_stream gives an snapshot that updates once per second. */
            streamURL = snapshotURL.replace('camera_proxy', 'camera_proxy_stream');
        }
        return {
            streamURL
        };
    }

    render() {
        return (
            <div className='camera' id={this.props.entityID.getCanonicalized()}>
                <AuthContext.Consumer>
                    {auth => {
                        const { restAPI } = auth;
                        if (!(restAPI instanceof Error) && this.props.streamURL) {
                            return (
                                <img
                                    className='camera-snapshot'
                                    src={`${restAPI.getBaseURL()}${this.props.streamURL}`}
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

export default Camera;
