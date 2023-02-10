import { ReactElement } from 'react';
import { HaEntity } from '../../../entities/ha-entity';
import { AuthContext, callWebsocketOrWarn } from '../../../services/context';
import { BaseEntityProps } from '../../base';
import Icon from '../../icon/icon';
import { MappableProps, TileComponent } from '../tile';

type Props = BaseEntityProps & {
    state: string,
}

const stateToIconMap: { [state: string]: ReactElement } = {
    'closed': <Icon name='garage-door' />,
    'open': <Icon name='garage-open' />,
    'opening': <Icon name='open-garage-door' />,
    'closing': <Icon name='close-garage-door' />,
}

class Garage extends TileComponent<Props> {
    context!: React.ContextType<typeof AuthContext>
    static contextType = AuthContext;

    constructor(props: Props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    propsMapper(entity: HaEntity): MappableProps<Props> {
        let backgroundColor;
        switch (entity.state) {
            case 'open':
                backgroundColor = 'transparent';   // TODO tile background color
                break;
            case 'closed':
                backgroundColor = '#dddddd';       // TODO inactive color
                break;
            case 'opening':
            case 'closing':
                backgroundColor = '#cc99ff';       // TODO accent color
        }

        return {
            state: entity.state,
            backgroundColor: backgroundColor,
        };
    }

    onClick() {
        switch (this.props.state) {
            case 'closed':
                callWebsocketOrWarn(this.context, 'cover', 'open_cover', {}, this.props.entityID);
                return;
            case 'open':
                callWebsocketOrWarn(this.context, 'cover', 'close_cover', {}, this.props.entityID);
                return;
        }
        console.warn(`Not opening or closing ${this.props.friendlyName} while in operation`);
    }

    render() {
        return (
            <div className='Garage' id={this.props.entityID.getCanonicalized()} onClick={this.onClick}>
                {stateToIconMap[this.props.state]}
            </div>
        );
    }
}

export default Garage;
