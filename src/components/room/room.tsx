import './room.css';

type Props = {
    title: string,
    children: React.ReactNode,
};

const Room = (props: Props) =>
    <div className='room'>
        <div className='room-title'>{props.title}</div>
        <div className='room-contents'>
            {props.children}
        </div>
    </div>
    ;

export default Room;
