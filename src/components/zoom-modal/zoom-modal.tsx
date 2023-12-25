import { PropsWithChildren, useState } from 'react';
import './zoom-modal.css';

export function ZoomModal(props: PropsWithChildren) {
    const [isExpanded, setExpanded] = useState(false);

    return (
        <>
            {isExpanded && <div className='zoom-modal-background' onClick={() => setExpanded(false)}></div>}
            <div className={`zoom-modal-wrapper ${isExpanded && 'expanded'}`} onClick={() => setExpanded(!isExpanded)}>
                <div className='zoom-modal-container'>
                    {props.children}
                </div>
                {isExpanded && <div className='close-message'>Click anywhere to close</div>}
            </div>
        </>
    );
};
