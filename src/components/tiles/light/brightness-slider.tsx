import { MouseEvent, useRef, useState } from 'react';
import * as color from '../../../entities/color';
import './brightness-slider.css';

type Props = {
    brightness: number,
    isExpanded: boolean,
    color: color.Color,
    onSetBrightness: (brightness: number) => void,
}

export function BrightnessSlider(props: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [isDraggingSlider, setIsDraggingSlider] = useState(false);
    const [displayBrightness, setDisplayBrightness] = useState(props.brightness);

    const getSliderWidth = (brightness: number) => `${brightness / color.MAX_COLOR_VALUE * 100}%`

    const onMouseDown = (e: MouseEvent) => {
        e.stopPropagation();
        setIsDraggingSlider(true);
    }

    const onMouseMove = (e: MouseEvent) => {
        if (!isDraggingSlider) {
            return;
        }

        const brightness = getSliderBrightness(e);
        if (brightness) {
            setDisplayBrightness(brightness);
        }
    }

    const onMouseUp = (e: MouseEvent) => {
        e.stopPropagation();
        const brightness = getSliderBrightness(e);
        if (brightness) {
            props.onSetBrightness(brightness);
        }
        setIsDraggingSlider(false);
    };

    const getSliderBrightness = (e: MouseEvent) => {
        if (!ref.current) {
            console.warn('Tried to move brightness slider before ref available');
            return;
        }
        const boundingRect = ref.current.getBoundingClientRect();
        const pct = (e.clientX - boundingRect.left) / boundingRect.width;
        return Math.max(0, Math.min(pct * 255, 255));
    }

    return (
        <div className='brightness-slider'>
            {!props.isExpanded &&
                <div className='mini'>
                    <div className='background'>
                        <div className='slider' style={{
                            backgroundColor: props.color.rgbString(true),
                            width: getSliderWidth(props.brightness),
                        }}></div>
                    </div>
                </div>
            }
            {props.isExpanded &&
                <div className='expanded'
                    onClick={e => e.stopPropagation()}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp} >
                    <div className='slider-box'>
                        <div className='background' ref={ref} >
                            <div className='slider' style={{
                                // Copy of Light.ON_COLOR - TODO: Clean up and make dynamic when dragging
                                backgroundColor: (new color.Color('#BBBB22')).rgbString(true),
                                width: getSliderWidth(displayBrightness),
                            }}></div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}
