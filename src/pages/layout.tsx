import Room from '../components/room/room';
import { HaEntity } from '../entities/ha-entity';
import toTileType from '../mappings/tiles';
import './layout.css';

type Props = {
    entityMap: Map<string, HaEntity>
}

const Layout = (props: Props) => {
    const componentMap = new Map(Array.from(props.entityMap).map(
        ([entityID, entity]) => [entityID, toTileType[entity.type]]
    ));

    const getWrapper = (entityID: string, icon?: string) => {
        const wrapper = componentMap.get(entityID)
        const entity = props.entityMap.get(entityID)
        if (!wrapper || !entity) {
            return;
        }
        return wrapper({ entity, icon });
    }

    return (
        <>
            <Room title='Living Room'>
                {getWrapper('switch.marble_lamp', 'table-lights')}
                {getWrapper('switch.pendant_lamp', 'desk-lamp')}
                {getWrapper('sensor.nest_temperature_sensor_family_room_temperature')}
            </Room>
            <Room title='Family Room'>
                {getWrapper('light.family_room_lights')}
                {getWrapper('light.family_room_chandelier', 'luminaria-led')}
                {getWrapper('switch.cat_den', 'curtain-light')}
            </Room>
            <Room title='Kitchen'>
                {getWrapper('switch.kitchen_lights')}
                {getWrapper('switch.kitchen_chandelier', 'chandelier')}
            </Room>
            <Room title='Master Bedroom'>
                {getWrapper('light.master_light', 'chandelier')}
                {getWrapper('sensor.master_bedroom_temperature_sensor_temperature')}
            </Room>
            <Room title='Outside'>
                {getWrapper('switch.front_door_lights', 'lights')}
                {getWrapper('switch.outdoor_lights', 'external-lights')}
            </Room>
        </>
    );
}

export default Layout;