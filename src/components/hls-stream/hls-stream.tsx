import Hls from 'hls.js';
import { Component, createRef, RefObject } from 'react';
import './hls-stream.css';

enum Status {
    Loading = "loading",
    Error = "error",
    Buffering = "buffering",
    Paused = "paused",
    Playing = "playing",
}

type Props = {
    src: string,
    poster?: string,
    reloadElementCallback?: () => void,
}

type State = {
    hls?: Hls;
    status: Status;
    err?: string;
}

const initialState: State = {
    status: Status.Loading,
}

export class HlsStream extends Component<Props, State> {
    videoRef: RefObject<HTMLVideoElement | null>;

    constructor(props: Props) {
        super(props);
        this.state = { ...initialState };
        this.videoRef = createRef();
        this.loadVideo = this.loadVideo.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
    }

    componentDidMount() {
        this.loadVideo();
    }

    loadVideo(): Hls | undefined {
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
            liveSyncDuration: 15,
            liveMaxLatencyDuration: 30,
        });
        this.setState({ ...this.state, hls: hls, status: Status.Loading, err: undefined });
        this.setupEventListeners(this.videoRef.current);

        hls.attachMedia(this.videoRef.current);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            hls.loadSource(this.props.src);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!data.fatal) {
                return;
            }
            /// TODO Call detachMedia on retryable errors with ratelimit
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                switch (data.details) {
                    case Hls.ErrorDetails.MANIFEST_LOAD_ERROR:
                    case Hls.ErrorDetails.LEVEL_LOAD_ERROR:
                        // @ts-ignore data.response is incorrect type
                        if (data.response.code === 404 && this.props.reloadElementCallback) {
                            this.props.reloadElementCallback();
                            console.error(`Received not found starting stream for ${data.url}. Reloading element to pick up new url.`)
                            return;
                        }
                        console.error(`Error starting stream for ${data.url} - ${JSON.stringify(data.response)}. Will retry.`);
                        this.setState({ ...this.state, status: Status.Error, err: 'Error starting stream' });
                        break;
                    case Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT:
                    case Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT:
                        console.error(`Timeout starting stream for ${data.url} - ${data.details}. Will retry.`)
                        this.setState({ ...this.state, status: Status.Error, err: 'Timeout starting stream' });
                        break;
                    default:
                        console.error(`Other stream network error for ${data.url} - ${data.details}. Will retry.`)
                        this.setState({ ...this.state, status: Status.Error, err: 'Stream network error' });
                }
                // Just rebuild the whole stream element?
                setTimeout(() => {
                    console.error(`Refreshing hls stream for ${data.url}.`)
                    hls.destroy();
                    this.loadVideo();
                }, 10000);
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                console.error(`Stream media error for ${this.props.src} - ${data.details}. Will try to recover.`)
                this.setState({ ...this.state, status: Status.Error, err: 'Media error' });
                hls.recoverMediaError();
            } else {
                console.error(`Other stream error for ${this.props.src} - ${data.details}`)
                this.setState({ ...this.state, status: Status.Error, err: 'Error playing stream' });
            }
        });

        return hls;
    }

    setupEventListeners(elem: HTMLVideoElement) {
        elem.onwaiting = () => {
            console.warn("Video paused for buffering");
            this.setState({ ...this.state, status: Status.Buffering });

            elem.oncanplaythrough = () => {
                if (this.state.status == Status.Playing) {
                    return;
                }
                console.warn("Resuming playback");
                elem.play();
            };
        };
        elem.onpause = () => {
            console.warn("Video paused");
            this.setState({ ...this.state, status: Status.Paused });
        }
        elem.onplay = () => {
            this.setState({ ...this.state, status: Status.Playing });
            elem.oncanplaythrough = null;
        }
    }

    componentWillUnmount() {
        if (this.state.hls) {
            this.state.hls.destroy();
            this.setState({ ...this.state, hls: undefined });
        }
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
