import { ReactNode } from 'react';
import './room.css';

type Props = {
    title: string,
    children: ReactNode,
    wrappable?: boolean,
};

export const Room = (props: Props) =>
    <div className='room' id={`room-${props.title.toLowerCase().replaceAll(' ', '_')}`}>
        <div className='room-title'>{props.title}</div>
        <div className={`room-contents${props.wrappable ? ' wrappable' : ''}`}>
            {props.children}
        </div>
    </div>
    ;
