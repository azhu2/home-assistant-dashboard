import Room from '../components/room/room';
import { TileOptions } from '../components/tiles/tile';
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

    const getTile = (entityID: string, options?: TileOptions) => {
        const tile = componentMap.get(entityID)
        const entity = props.entityMap.get(entityID)
        if (!tile || !entity) {
            return;
        }
        return tile({ entity, options });
    }

    return (
        <>
            <Room title='Living Room'>
                {getTile('switch.marble_lamp', {icon: 'table-lights'})}
                {getTile('switch.pendant_lamp', {icon: 'desk-lamp'})}
            </Room>
            <Room title='Family Room'>
                {getTile('light.family_room_lights')}
                {getTile('light.family_room_chandelier', {icon: 'luminaria-led'})}
                {getTile('switch.cat_den', {icon: 'curtain-light'})}
                {getTile('sensor.nest_temperature_sensor_family_room_temperature')}
            </Room>
            <Room title='Kitchen'>
                {getTile('switch.kitchen_lights')}
                {getTile('switch.kitchen_chandelier', {icon: 'chandelier'})}
            </Room>
            <Room title='Master Bedroom'>
                {getTile('light.master_light', {icon: 'chandelier'})}
                {getTile('sensor.master_bedroom_temperature_sensor_temperature')}
            </Room>
            <Room title='Outside'>
                {getTile('switch.front_door_lights', {icon: 'lights'})}
                {getTile('switch.outdoor_lights', {icon: 'external-lights'})}
            </Room>
        </>
    );
}

export default Layout;