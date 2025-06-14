import { Component, ReactElement } from 'react';
import * as formatter from '../../../types/formatter';
import * as haEntity from '../../../types/ha-entity';
import * as base from '../../base';
import * as tile from '../../tile/tile';
import './gauge.css';

export type Props = base.BaseEntityProps & {
    state: string | number,
    unit?: string,
    /** Set to make history graph baseline zero instead of minimum value */
    setBaselineToZero?: boolean,
    /** Used for NeedleGauge */
    min?: number,
    /** Used for NeedleGauge */
    max?: number,
    /** Used to invert colors for NeedleGauge */
    invertColors?: boolean,
    /** Extra toggle-able icon */
    toggleIcon?: {
        entity: haEntity.Entity,
        onIcon: ReactElement,
        offIcon: ReactElement,
    },
    formatter: formatter.Formatter<string | number>;
}

type State = {
    unsubFunc?: () => void,
    history?: haEntity.History,
}

export const initialState: State = {
    unsubFunc: undefined,
    history: undefined,
}

export class Gauge extends Component<Props, State> implements tile.MappableProps<Props>{
    constructor(props: Props) {
        super(props);
        this.renderHelper = this.renderHelper.bind(this);
    }

    propsMapper(entity: haEntity.Entity, options: tile.Options): tile.MappedProps<Props> {
        let state: string | number = entity.state;
        if (!Number.isNaN(Number(state))) {
            state = Number(state);
        }
        return {
            state: state,
            unit: entity.attributes['unit_of_measurement'],
            formatter: options?.formatter || formatter.NoOp,
        };
    }

    render() {
        return this.renderHelper();
    }

    renderHelper(background?: ReactElement) {
        return (
            <div className='gauge' id={this.props.entityID.getCanonicalized()}>
                <div className='background'>
                    {background}
                </div>
                {this.props.toggleIcon &&
                    <div className='toggle-icon'>
                        {this.props.toggleIcon.entity.state === 'on' ? this.props.toggleIcon.onIcon : this.props.toggleIcon.offIcon}
                    </div>
                }
                {/* extra div so superscript works with flexbox used to vertical-center values */}
                <div className='value-container'>
                    <span className='value'>{this.props.formatter(this.props.state)}</span>
                    {this.props.unit && <span className='unit'>{this.props.unit || ''}</span>}
                </div>
            </div>
        );
    }
}
