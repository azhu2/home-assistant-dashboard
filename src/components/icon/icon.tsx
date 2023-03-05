import * as color from '../../entities/color';
import './icon.css';

export type Props = {
    name: string;
    color?: color.Color | string;
    filled?: boolean;
}

export function buildIcon(props: string | Props, color?: color.Color | string) {
    if (typeof props === 'string') {
        return <Icon name={props} color={color} />
    }
    return <Icon {...props} color={color} />
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
        <img className='icon' alt={props.name} src={`https://img.icons8.com/${props.filled ? 'ios-filled' : 'ios'}/50/${iconColor.rgbString(false)}/${props.name}.png`} />
    );
}
