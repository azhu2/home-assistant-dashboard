import { ReactNode } from 'react';
import './section.css';

type Props = {
    title: string,
    children: ReactNode,
    hideTitle?: boolean,
};

export const Section = (props: Props) =>
    <div className='section' id={`section-${props.title.toLowerCase().replaceAll(' ', '_')}`}>
        {!props.hideTitle && <div className='section-title'>{props.title}</div>}
        <div className='section-contents'>
            {props.children}
        </div>
    </div>
    ;
