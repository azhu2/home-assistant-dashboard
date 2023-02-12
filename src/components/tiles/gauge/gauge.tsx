import { Component } from 'react';
import * as haEntity from '../../../entities/ha-entity';
import * as base from '../../base';
import * as tile from '../../tile/tile';
import './gauge.css';

type Props = base.BaseEntityProps & {
    state: string,
    unit?: string,
}

export class Gauge extends Component<Props> implements tile.MappableProps<Props>{
    propsMapper(entity: haEntity.Entity): tile.MappedProps<Props> {
        return {
            state: entity.state,
            unit: entity.attributes['unit_of_measurement'],
        };
    }

    render() {
        return (
            <div className='gauge' id={this.props.entityID.getCanonicalized()}>
                {/* extra div so superscript works with flexbox used to vertical-center values */}
                <div>
                    <span className='value'>{this.props.state}</span>
                    {this.props.unit && <span className='unit'>{this.props.unit || ''}</span>}
                </div>
            </div>
        );
    }
}
