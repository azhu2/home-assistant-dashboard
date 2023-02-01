import { MouseEvent, useRef } from "react";
import { Color, MAX_COLOR_VALUE } from "../../entities/color";
import './brightness-slider.css';

type Props = {
    value: number,
    isExpanded: boolean,
    color: Color,
    onSetBrightness: (brightness: number) => void,
}

function BrightnessSlider(props: Props) {
    const ref = useRef<HTMLDivElement>(null);

    const color = props.color.rgbString(true);
    const width = `${props.value / MAX_COLOR_VALUE * 100}%`;

    const onMouseUp = (e: MouseEvent) => {
        e.stopPropagation();

        if (!ref.current) {
            console.warn('Tried to move brightness slider before ref available');
            return;
        }
        const boundingRect = ref.current.getBoundingClientRect();
        const pct = (e.clientX - boundingRect.left) / boundingRect.width;
        console.log(boundingRect);
        props.onSetBrightness(pct * 255);
    };

    return (
        <div className='brightness-slider'>
            <div className='mini'>
                <div className='background'>
                    <div className='slider' style={{
                        backgroundColor: color,
                        width: width,
                    }}></div>
                </div>
            </div>
            {props.isExpanded &&
                <div className='expanded' onMouseUp={onMouseUp} onClick={e => e.stopPropagation()} >
                    <div className='background' ref={ref} >
                        <div className='slider' style={{
                            backgroundColor: color,
                            width: width,
                        }}></div>
                    </div>
                </div>
            }
        </div>
    )
}

export default BrightnessSlider;
