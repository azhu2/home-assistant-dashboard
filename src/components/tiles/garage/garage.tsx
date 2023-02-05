import { ReactElement, useContext } from 'react';
import { AuthContext, callWebsocketOrWarn } from '../../../services/context';
import { BaseEntityProps } from '../../base';
import Icon from '../../icon/icon';
import Tile, { TileProps } from '../tile';

type Props = BaseEntityProps & {
    state: string,
}

const stateToIconMap: { [state: string]: ReactElement } = {
    'closed': <Icon name='garage-door' />,
    'open': <Icon name='garage-open' />,
    'opening': <Icon name='open-garage-door' />,
    'closing': <Icon name='close-garage-door' />,
}

function Garage(props: Props) {
    const authContext = useContext(AuthContext);

    const onClick = () => {
        switch (props.state) {
            case 'closed':
                callWebsocketOrWarn(authContext, 'cover', 'open_cover', {}, props.entityID);
                return;
            case 'open':
                callWebsocketOrWarn(authContext, 'cover', 'close_cover', {}, props.entityID);
                return;
        }
        console.warn(`Not opening or closing ${props.friendlyName} while in operation`);
    }

    return (
        <div className='Garage' id={props.entityID.getCanonicalized()} onClick={onClick}>
            {stateToIconMap[props.state]}
        </div>
    );
}

const GarageTile = (props: TileProps) =>
    <Tile
        entity={props.entity}
        options={props.options}
        propsMapper={
            (entity) =>
                <Garage
                    key={entity.entityID.getCanonicalized()}
                    entityID={entity.entityID}
                    friendlyName={entity.friendlyName}
                    state={entity.state}
                />
        }
        backgroundColorMapper={
            entity => {
                switch (entity.state) {
                    case 'open':
                        return 'transparent';   // TODO tile background color
                    case 'closed':
                        return '#dddddd';       // TODO inactive color
                    case 'opening':
                    case 'closing':
                        return '#cc99ff';       // TODO accent color
                }
                return undefined;
            }
        }
    />;

export default GarageTile;
