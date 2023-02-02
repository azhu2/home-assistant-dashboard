import { Color } from '../../entities/color';
import './icon.css';

type Props = {
    name: string;
    color?: Color;
}

function Icon(props: Props) {
    const color = props.color ? props.color : new Color('#000000');

    return (
        <img className='icon' src={`https://img.icons8.com/ios/50/${color.rgbString(false)}/${props.name}.png`} />
    );
}

export default Icon;
