import { Component } from 'react';
import { HaEntity } from '../../../entities/ha-entity';
import { BaseEntityProps } from '../../base';
import { MappableProps, MappedProps } from '../tile';
import './gauge.css';

type Props = BaseEntityProps & {
    state: string,
    unit?: string,
}

class Gauge extends Component<Props> implements MappableProps<Props>{
    propsMapper(entity: HaEntity): MappedProps<Props> {
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

export default Gauge;
