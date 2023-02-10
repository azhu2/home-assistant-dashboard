import { Component } from 'react';
import { HaEntity } from '../../../entities/ha-entity';
import { AuthContext } from '../../../services/context';
import { BaseEntityProps } from '../../base';
import { MappedProps, MappableProps } from '../tile';
import './camera.css';

type Props = BaseEntityProps & {
    snapshotURL?: string,
}

class Camera extends Component<Props> implements MappableProps<Props>{
    propsMapper(entity: HaEntity): MappedProps<Props> {
        return {
            snapshotURL: entity.attributes['entity_picture'],
        };
    }

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

export default Camera;
