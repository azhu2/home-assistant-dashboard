import { Component, ContextType, MouseEvent as ReactMouseEvent } from 'react';
import * as color from '../../../entities/color';
import * as haEntity from '../../../entities/ha-entity';
import * as authContext from '../../../services/auth-context';
import * as base from '../../base';
import { Icon } from '../../icon/icon';
import * as icon from '../../icon/icon';
import * as tile from '../../tile/tile';

export type Props = base.BaseEntityProps & {
    /** on(true) or off(false) */
    state: boolean,
    color: string | color.Color;
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
            color: options.color || '000000',   // TODO default color
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
            iconElement = icon.buildIcon(this.props.icon);
        } else {
            const iconName = this.props.state ? 'light-on' : 'light-off';
            iconElement = <Icon name={iconName} color={this.props.color} />
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
