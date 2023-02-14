import Hls from 'hls.js';
import { Component, createRef, RefObject } from 'react';
import './hls-stream.css';

type Props = {
    src: string,
    poster?: string;
    refreshSourceCallback?: () => void;
}

type State = {
    err?: string,
}

const initialState: State = {
    err: 'Initializing...',
}

export class HlsStream extends Component<Props, State> {
    videoRef: RefObject<HTMLVideoElement>;

    constructor(props: Props) {
        super(props);
        this.state = { ...initialState };
        this.videoRef = createRef();
    }

    componentDidMount() {
        if (!this.videoRef.current) {
            console.error('HlsStream component not rendered yet!');
            return;
        }
        if (!Hls.isSupported()) {
            console.error('HLS stream not supported in this browser!');
            return;
        }
        const hls = new Hls({
            capLevelToPlayerSize: true,
            backBufferLength: 30,
        });
        hls.attachMedia(this.videoRef.current);

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            hls.loadSource(this.props.src);
            this.setState({ ...this.state, err: undefined });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!data.fatal) {
                return;
            }
            /// TODO Call detachMedia on retryable errors with ratelimit
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                switch (data.details) {
                    case Hls.ErrorDetails.MANIFEST_LOAD_ERROR: {
                        console.error(`Error starting stream for ${data.url} - ${JSON.stringify(data.response)}. Will retry.`);
                        this.setState({...this.state, err: 'Error starting stream'});
                        break;
                    }
                    case Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT:
                        console.error(`Timeout starting stream for ${data.url}. Will retry.`)
                        this.setState({...this.state, err: 'Timeout starting stream'});
                        break;
                    default:
                        console.error(`Other stream network error for ${data.url} - ${data.details}. Will retry.`)
                        this.setState({...this.state, err: 'Stream network error'});
                        if (this.props.refreshSourceCallback) {
                            this.props.refreshSourceCallback();
                            hls.detachMedia();
                        }
                }
                hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                console.error(`Stream media error for ${this.props.src} - ${data.details}. Will try to recover.`)
                this.setState({...this.state, err: 'Media error'});
                hls.recoverMediaError();
            } else {
                console.error(`Other stream error for ${this.props.src} - ${data.details}`)
                this.setState({...this.state, err: 'Error playing stream'});
            }
        });
    }

    render() {
        return (
            <>
                <video
                    ref={this.videoRef}
                    className='camera-snapshot'
                    poster={this.props.poster}
                    autoPlay muted playsInline
                />
                {this.state.err &&
                    <div className='hls-stream-err'>
                        {this.state.err}
                    </div>
                }
            </>
        );
    }
}
