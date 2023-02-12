import * as color from '../../entities/color';
import './icon.css';

type Props = {
    name: string;
    color?: color.Color;
}

export function Icon(props: Props) {
    const iconColor = props.color ? props.color : new color.Color('#000000');

    return (
        <img className='icon' alt={props.name} src={`https://img.icons8.com/ios/50/${iconColor.rgbString(false)}/${props.name}.png`} />
    );
}
