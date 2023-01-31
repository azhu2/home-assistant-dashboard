import { Color, MAX_COLOR_VALUE } from "../../entities/color";
import './brightness-slider.css';

type Props = {
    value: number,
    expanded: boolean,
    color: Color,
}

function BrightnessSlider(props: Props) {
    return (
        <div className='brightness-slider'>
            <div className='background'>
                <div className='slider' style={{
                    backgroundColor: props.color.rgbString(true),
                    width: `${props.value / MAX_COLOR_VALUE * 100}%`,
                }}></div>
            </div>
        </div>
    )
}

export default BrightnessSlider;
