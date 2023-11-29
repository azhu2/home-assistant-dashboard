import * as haEntity from '../../../types/ha-entity';
import * as tile from '../../tile/tile';
import { Icon } from '../../icon/icon';
import { Gauge } from './gauge';
import * as gauge from './gauge';
import { NeedleGauge } from './needle-gauge';

/** A HistoryGauge with an icon to indicate room occupancy */
export class TempSensorGauge extends Gauge {
    propsMapper(entity: haEntity.Entity, options: tile.Options): tile.MappedProps<gauge.Props> {
        const gaugeProps = super.propsMapper(entity, options);

        let toggleIcon;
        if (options.secondaryEntities && options.secondaryEntities.length > 0) {
            let iconProps = {
                name: 'user-male-circle',
                color: '6644aa',
            };
            toggleIcon = {
                entity: options.secondaryEntities[0],
                onIcon: <Icon {...iconProps} filled={true} />,
                offIcon: <Icon {...iconProps} filled={false} />,
            }
        }

        return {...gaugeProps, toggleIcon};
    }

    render() {
        return (
            <NeedleGauge {...this.props} min={65} max={85} />
        )
    }
}
