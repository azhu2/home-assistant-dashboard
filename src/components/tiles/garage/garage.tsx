import { Component, ContextType, ReactElement } from 'react';
import * as haEntity from '../../../entities/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as base from '../../base';
import { Icon } from '../../icon/icon';
import * as tile from '../../tile/tile';

type Props = base.BaseEntityProps & {
    state: string,
}

const stateToIconMap: { [state: string]: ReactElement } = {
    'closed': <Icon name='garage-door' />,
    'open': <Icon name='garage-open' />,
    'opening': <Icon name='open-garage-door' />,
    'closing': <Icon name='close-garage-door' />,
}

export class Garage extends Component<Props> implements tile.MappableProps<Props>{
    context!: ContextType<typeof authContext.AuthContext>
    static contextType = authContext.AuthContext;

    constructor(props: Props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    propsMapper(entity: haEntity.Entity): tile.MappedProps<Props> {
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
                authContext.callWebsocketOrWarn(this.context, 'cover', 'open_cover', {}, this.props.entityID);
                return;
            case 'open':
                authContext.callWebsocketOrWarn(this.context, 'cover', 'close_cover', {}, this.props.entityID);
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
