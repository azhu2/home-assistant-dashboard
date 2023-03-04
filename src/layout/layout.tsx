import { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import * as base from '../components/base';
import { Room } from '../components/room/room';
import * as tile from '../components/tile/tile';
import { Camera } from '../components/tiles/camera/camera';
import { Garage } from '../components/tiles/garage/garage';
import { Gauge, HistoryGauge, PercentGauage } from '../components/tiles/gauge/gauge';
import { DimmableLight, Light } from '../components/tiles/light/light';
import { Switch } from '../components/tiles/switch/switch';
import * as haEntity from '../entities/ha-entity';
import './layout.css';

type Props = {
    entityMap: Map<string, haEntity.Entity>
}

type SecondaryEntityIDs = string[];

export const Layout = (props: Props) => {
    /** Construct a tile for a given tile type and entity ID. */
    const getTile = <P extends base.BaseEntityProps>(Tile: ComponentType<P>, entityID: string, tileOptions?: tile.Options, secondaryEntityIDs?: SecondaryEntityIDs) => {
        const entity = getEntityForEntityID(entityID);
        if (!entity) {
            return;     // TODO Return unavailable tile
        }
        if (secondaryEntityIDs) {
            const secondaryEntities = secondaryEntityIDs
                .map(getEntityForEntityID)
                // Weird hack to get typescript to understand we're filtering out undefineds - https://www.benmvp.com/blog/filtering-undefined-elements-from-array-typescript/
                .filter((e): e is haEntity.Entity => !!e);
            tileOptions = { ...tileOptions, secondaryEntities };
        }
        return tile.wrapTile(entity, tileOptions)(Tile);
    }

    const getEntityForEntityID = (entityID: string) => {
        if (props.entityMap.size === 0) {
            return undefined;
        }
        return props.entityMap.get(entityID);
    }

    return (
        <>
            <div>Home Assistant Dashboard</div>
            <Room title='Living Room'>
                {getTile(Light, 'switch.marble_lamp', { icon: 'table-lights' })}
                {getTile(Light, 'switch.pendant_lamp', { icon: 'desk-lamp' })}
                {getTile(Light, 'switch.christmas_tree', { icon: 'christmas-tree', hideIfUnavailable: true })}
                {getTile(Switch, 'switch.fan', { icon: 'fan-speed--v2' })}
                {getTile(Gauge, 'sensor.thermostat_humidity', { showName: true })}
            </Room>
            <Room title='Family Room'>
                {getTile(DimmableLight, 'light.family_room_lights', { icon: 'philips-hue-go' })}
                {getTile(DimmableLight, 'light.family_room_chandelier', { icon: 'luminaria-led' })}
                {getTile(Light, 'switch.cat_den', { icon: 'animal-shelter' })}
                {getTile(Gauge, 'sensor.nest_temperature_sensor_family_room_temperature', { showName: true })}
            </Room>
            <Room title='Kitchen'>
                {getTile(Light, 'switch.kitchen_lights', { icon: 'philips-hue-go' })}
                {getTile(Light, 'switch.kitchen_chandelier', { icon: 'chandelier' })}
            </Room>
            <Room title='Master Bedroom'>
                {getTile(DimmableLight, 'light.master_light', { icon: 'chandelier' })}
                {getTile(Switch, 'switch.air_purifier', { icon: 'air-quality', hideIfUnavailable: true })}
                {getTile(Gauge, 'sensor.master_bedroom_temperature_sensor_temperature', { showName: true })}
            </Room>
            <Room title='Outside'>
                {getTile(Garage, 'cover.garage_door')}
                {getTile(Light, 'switch.front_door_lights', { icon: 'lights' })}
                {getTile(Light, 'switch.outdoor_lights', { icon: 'external-lights' })}
                {getTile(Switch, 'switch.trash_day', { icon: 'waste' })}
            </Room>
            <Room title='Cameras'>
                {getTile(Camera, 'camera.garage_cam_high', { showName: true }, ['switch.garage_cam_recording'])}
                {getTile(Camera, 'camera.family_room_cam_high', { showName: true }, ['switch.family_room_cam_recording'])}
                {getTile(Camera, 'camera.bedroom_cam_high', { showName: true }, ['switch.bedroom_cam_recording'])}
            </Room>
            <Room title='Irrigation'>
                {getTile(Switch, 'switch.lawn_schedule', { showName: true, icon: 'grass' })}
                {getTile(Switch, 'switch.roses_schedule_2', { showName: true, icon: 'rose-bouquet' })}
                {getTile(Switch, 'switch.front_yard_primary', { showName: true, icon: 'garden-sprinkler' })}
                {getTile(Switch, 'switch.front_yard_secondary', { showName: true, icon: 'garden-sprinkler' })}
                {getTile(Switch, 'switch.backyard_primary', { showName: true, icon: 'garden-sprinkler' })}
                {getTile(Switch, 'switch.backyard_secondary', { showName: true, icon: 'garden-sprinkler' })}
                {getTile(Switch, 'switch.backyard_drip', { showName: true, icon: 'plant-under-rain' })}
            </Room>
            <Room title='System'>
                {getTile(PercentGauage, 'sensor.synology_nas_cpu_utilization_total', { showName: true })}
                {getTile(PercentGauage, 'sensor.synology_nas_memory_usage_real', { showName: true })}
                {getTile(PercentGauage, 'sensor.udr_memory_utilization', { showName: true })}
                {getTile(PercentGauage, 'sensor.synology_nas_volume_1_volume_used', { showName: true })}
                {getTile(PercentGauage, 'sensor.udr_storage_utilization', { showName: true })}
                {getTile(Gauge, 'sensor.online_devices', { showName: true })}
                {getTile(HistoryGauge, 'sensor.1m_download_max', { showName: true })}
                {getTile(HistoryGauge, 'sensor.1m_upload_max', { showName: true })}
                {getTile(Gauge, 'sensor.adguard_home_dns_queries_blocked_ratio', { showName: true })}
            </Room>
            <div>
                <p><Link to='/settings'>Settings</Link></p>
                <p>TODO Footer: <a href='https://icons8.com/' target='_blank' rel='noreferrer'>Icons by Icons8</a></p>
            </div>
        </>
    );
}
