import { Component, ContextType, MouseEvent as ReactMouseEvent } from 'react';
import * as haEntity from '../../../types/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as base from '../../base';
import * as icon from '../../icon/icon';
import { Icon } from '../../icon/icon';
import * as tile from '../../tile/tile';
import './switch.css';

export type Props = base.BaseEntityProps & {
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

    propsMapper(entity: haEntity.Entity, options: tile.Options): tile.MappedProps<Props> {
        return {
            state: entity.state === 'on',
            icon: options.icon,
            backgroundColor: entity.state === 'on' ? undefined : '#dddddd'     // TODO inactive color
        };
    }

    onClick(e: ReactMouseEvent) {
        e.preventDefault();
        // Use home assistant domain for generic toggle (works for lights and switches)
        authContext.callWebsocketOrWarn(this.context, 'homeassistant', 'toggle', { entity_id: this.props.entityID.getCanonicalized() })
    }

    render() {
        let iconElement;
        if (this.props.icon) {
            if (typeof this.props.icon === 'string') {
                iconElement = icon.buildIcon(this.props.icon);
            } else {
                const color = this.props.state ? this.props.icon.color : '#000000';
                iconElement = icon.buildIcon(this.props.icon, color);
            }
        } else {
            const iconName = this.props.state ? 'light-on' : 'light-off';
            iconElement = <Icon name={iconName} />
        }

        return (
            <div className={`switch switch-${this.props.state ? 'on' : 'off'}`}
                id={`switch-${this.props.entityID.getCanonicalized()}`}
                onClick={this.onClick}
                onContextMenu={this.onClick}
            >
                {iconElement}
            </div>
        );
    }
}
