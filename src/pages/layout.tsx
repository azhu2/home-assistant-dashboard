import Room from '../components/room/room';
import { HaEntity } from '../entities/ha-entity';
import toWrapperType from '../mappings/wrappers';
import './layout.css';

type Props = {
    entityMap: Map<string, HaEntity>
}

const Layout = (props: Props) => {
    const componentMap = new Map(Array.from(props.entityMap).map(
        ([entityID, entity]) => [entityID, toWrapperType[entity.type]]
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
            </Room>
            <Room title='Outside'>
                {getWrapper('switch.front_door_lights', 'lights')}
                {getWrapper('switch.outdoor_lights', 'external-lights')}
            </Room>
        </>
    );
}

export default Layout;