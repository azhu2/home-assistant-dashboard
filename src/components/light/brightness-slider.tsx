import { MouseEvent, useRef } from "react";
import { Color, MAX_COLOR_VALUE } from "../../entities/color";
import './brightness-slider.css';

type Props = {
    value: number,
    isExpanded: boolean,
    color: Color,
}

function BrightnessSlider(props: Props) {
    const ref = useRef<HTMLDivElement>(null);

    const color = props.color.rgbString(true);
    const width = `${props.value / MAX_COLOR_VALUE * 100}%`;

    const onClick = (e: MouseEvent) => {
        e.stopPropagation();
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
                <div className='expanded' onClick={onClick} ref={ref} >
                    <div className='background' >
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
