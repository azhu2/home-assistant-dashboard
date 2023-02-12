import Hls from 'hls.js';
import { Component, createRef, RefObject } from 'react';
import './hls-stream.css';

type Props = {
    src: string,
    poster?: string;
}

export class HlsStream extends Component<Props, {}> {
    videoRef: RefObject<HTMLVideoElement>;

    constructor(props: Props) {
        super(props);
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
        hls.loadSource(this.props.src);
        hls.attachMedia(this.videoRef.current);
    }

    render() {
        return (
            <video
                ref={this.videoRef}
                className='camera-snapshot'
                poster={this.props.poster}
                autoPlay muted playsInline
            />
        );
    }
}
