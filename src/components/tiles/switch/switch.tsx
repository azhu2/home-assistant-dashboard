import { Component, ContextType, MouseEvent as ReactMouseEvent } from 'react';
import * as haEntity from '../../../entities/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as base from '../../base';
import { Icon } from '../../icon/icon';
import * as tile from '../../tile/tile';

type Props = base.BaseEntityProps & {
    /** on(true) or off(false) */
    state: boolean,
}

export class Switch extends Component<Props, {}> implements tile.MappableProps<Props>{
    context!: ContextType<typeof authContext.AuthContext>
    static contextType = authContext.AuthContext;

    constructor(props: Props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    propsMapper(entity: haEntity.Entity): tile.MappedProps<Props> {
        return {
            state: entity.state === 'on',
            backgroundColor: entity.state === 'on' ? undefined : '#dddddd'     // TODO inactive color
        };
    }

    onClick(e: ReactMouseEvent) {
        e.preventDefault();
        // Use home assistant domain for generic toggle (works for lights and switches)
        authContext.callWebsocketOrWarn(this.context, 'homeassistant', 'toggle', { entity_id: this.props.entityID.getCanonicalized() })
    }

    render() {
        const icon = this.props.icon ? this.props.icon : this.props.state ? 'light-on' : 'light-off';

        return (
            <div className={`switch switch-${this.props.state ? 'on' : 'off'}`}
                id={`switch-${this.props.entityID.getCanonicalized()}`}
                onClick={this.onClick}
                onContextMenu={this.onClick}
            >
                <Icon name={icon} />
            </div>
        );
    }
}
