import { ReactNode } from 'react';
import './room.css';

type Props = {
    title: string,
    children: ReactNode,
};

export const Room = (props: Props) =>
    <div className='room' id={`room-${props.title.toLowerCase().replaceAll(' ', '_')}`}>
        <div className='room-title'>{props.title}</div>
        <div className='room-contents'>
            {props.children}
        </div>
    </div>
    ;
