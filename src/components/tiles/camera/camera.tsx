import { Component } from 'react';
import { HaEntity } from '../../../entities/ha-entity';
import { AuthContext } from '../../../services/context';
import { BaseEntityProps } from '../../base';
import HlsStream from '../../hls-stream/hls-stream';
import { MappableProps, MappedProps } from '../../tile/tile';
import './camera.css';

type Props = BaseEntityProps & {
    snapshotURL?: string,
};

type State = {
    streamURL?: string,
};

const initialState: State = {
    streamURL: undefined,
};

class Camera extends Component<Props, State> implements MappableProps<Props>{
    streamURL?: string;

    context!: React.ContextType<typeof AuthContext>
    static contextType = AuthContext;

    constructor(props: Props) {
        super(props);
        this.state = { ...initialState };
        this.setupStream = this.setupStream.bind(this);
    }

    propsMapper(entity: HaEntity): MappedProps<Props> {
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
                <AuthContext.Consumer>
                    {auth => {
                        const { restAPI } = auth;
                        if (restAPI instanceof Error) {
                            return <>Loading...</>;
                        }
                        if (this.props.snapshotURL || this.state.streamURL) {
                            return (
                                    <HlsStream
                                        src={`${restAPI.getBaseURL()}${this.state.streamURL}`}
                                        poster={`${restAPI.getBaseURL()}${this.props.snapshotURL}`}
                                    />
                            );
                        }
                        return <>Loading...</>;
                    }}
                </AuthContext.Consumer>
            </div>
        );
    };
}

export default Camera;
