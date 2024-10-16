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
    offIcon?: string | icon.Props,
    /** Alternate service to call */
    onClick?: action,
}

type action = {
    domain: string;
    action: string;
}

export class Switch extends Component<Props, {}> implements tile.MappableProps<Props> {
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
            offIcon: options.secondaryIcons?.at(0),
            backgroundColor: entity.state === 'on' ? undefined : '#dddddd'     // TODO inactive color
        };
    }

    onClick(e: ReactMouseEvent) {
        e.preventDefault();

        if (this.props.onClick) {
            authContext.callWebsocketOrWarn(this.context, this.props.onClick.domain, this.props.onClick.action);
            return;
        }

        // Use home assistant domain for generic toggle (works for lights and switches)
        authContext.callWebsocketOrWarn(this.context, 'homeassistant', 'toggle', { entity_id: this.props.entityID.getCanonicalized() });
    }

    render() {
        let iconElement;
        let selectedIcon = this.props.icon;
        if (!this.props.state && this.props.offIcon) {
            selectedIcon = this.props.offIcon;
        }
        if (selectedIcon) {
            if (typeof selectedIcon === 'string') {
                iconElement = icon.buildIcon(selectedIcon);
            } else {
                const color = this.props.state ? selectedIcon.color : this.props.offIcon ? selectedIcon.color : '#000000';
                iconElement = icon.buildIcon(selectedIcon, color);
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
