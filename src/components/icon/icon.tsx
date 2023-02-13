import * as color from '../../entities/color';
import './icon.css';

type Props = {
    name: string;
    color?: color.Color | string;
}

export function Icon(props: Props) {
    let iconColor = new color.Color('#000000');
    if (props.color) {
        if (typeof props.color === 'string') {
            iconColor = new color.Color(props.color);
        } else {
            iconColor = props.color;
        }
    }

    return (
        <img className='icon' alt={props.name} src={`https://img.icons8.com/ios/50/${iconColor.rgbString(false)}/${props.name}.png`} />
    );
}
