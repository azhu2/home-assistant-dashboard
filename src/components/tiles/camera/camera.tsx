import { Component, ContextType } from 'react';
import * as haEntity from '../../../entities/ha-entity';
import * as authContext from '../../../services/auth-context';
import { AuthContextConsumer } from '../../../services/auth-context';
import * as base from '../../base';
import { HlsStream } from '../../hls-stream/hls-stream';
import { Icon } from '../../icon/icon';
import * as tile from '../../tile/tile';
import './camera.css';

type Props = base.BaseEntityProps & {
    /** Snapshot to show while stream loading/offline */
    snapshotURL?: string,
    /** Switch that controls whether saving recordings is on (custom setup for Unifi Protect cameras) */
    recordingSwitch?: haEntity.Entity,
};

type State = {
    streamURL?: string,
};

const initialState: State = {
    streamURL: undefined,
};

export class Camera extends Component<Props, State> implements tile.MappableProps<Props>{
    streamURL?: string;

    context!: ContextType<typeof authContext.AuthContext>
    static contextType = authContext.AuthContext;

    constructor(props: Props) {
        super(props);
        this.state = { ...initialState };
        this.setupStream = this.setupStream.bind(this);
        this.onToggleRecording = this.onToggleRecording.bind(this);
    }

    propsMapper(entity: haEntity.Entity, options: tile.Options): tile.MappedProps<Props> {
        return {
            snapshotURL: entity.attributes['entity_picture'],
            recordingSwitch: options.secondaryEntities && options.secondaryEntities.length > 0 ? options.secondaryEntities[0] : undefined,
        };
    }

    componentDidMount() {
        this.setupStream();
    }

    setupStream() {
        if (this.context) {
            const { websocketAPI } = this.context;
            if (!(websocketAPI instanceof Error)) {
                websocketAPI.getStreamURL(this.props.entityID).then(stream => {
                    this.setState({ ...this.state, streamURL: stream.url });
                });
            }
        }
    }

    onToggleRecording() {
        authContext.callWebsocketOrWarn(this.context, 'switch', 'toggle', {}, this.props.recordingSwitch?.entityID);
    }

    render() {
        return (
            <div className='camera' id={this.props.entityID.getCanonicalized()}>
                {this.props.recordingSwitch &&
                    <button className='toggle' onClick={this.onToggleRecording}>
                        <Icon name='record' color={this.props.recordingSwitch.state === 'on' ? 'ff0000' : 'dddddd'} />
                    </button>
                }
                <AuthContextConsumer>
                    {auth => {
                        const { restAPI } = auth;
                        if (restAPI instanceof Error) {
                            return <>Loading...</>;
                        }
                        if (this.props.snapshotURL && this.state.streamURL) {
                            return (
                                <HlsStream
                                    src={`${restAPI.getBaseURL()}${this.state.streamURL}`}
                                    poster={`${restAPI.getBaseURL()}${this.props.snapshotURL}`}
                                    refreshSourceCallback={this.setupStream}
                                />
                            );
                        } else {
                            return (
                                <>
                                    <img
                                        className='camera-snapshot'
                                        src={`${restAPI.getBaseURL()}${this.props.snapshotURL}`}
                                        alt={this.props.friendlyName}
                                    />
                                    <div>
                                        Stream loading...
                                    </div>
                                </>
                            );
                        }
                    }}
                </AuthContextConsumer>
            </div>
        );
    };
}
