import { Component, ContextType } from 'react';
import * as haEntity from '../../../entities/ha-entity';
import * as authContext from '../../../services/auth-context';
import { AuthContextConsumer } from '../../../services/auth-context';
import * as base from '../../base';
import { HlsStream } from '../../hls-stream/hls-stream';
import * as tile from '../../tile/tile';
import './camera.css';

type Props = base.BaseEntityProps & {
    snapshotURL?: string,
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
    }

    propsMapper(entity: haEntity.Entity): tile.MappedProps<Props> {
        return {
            snapshotURL: entity.attributes['entity_picture'],
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

    render() {
        return (
            <div className='camera' id={this.props.entityID.getCanonicalized()}>
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
