import { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import * as base from '../components/base';
import { Room } from '../components/room/room';
import * as tile from '../components/tile/tile';
import { Camera } from '../components/tiles/camera/camera';
import { Garage } from '../components/tiles/garage/garage';
import { Gauge } from '../components/tiles/gauge/gauge';
import { Light } from '../components/tiles/light/light';
import * as haEntity from '../entities/ha-entity';
import './layout.css';

type Props = {
    entityMap: Map<string, haEntity.Entity>
}

export const Layout = (props: Props) => {
    /** Construct a tile for a given tile type and entity ID. */
    const getTile = <P extends base.BaseEntityProps>(Tile: ComponentType<P>, entityID: string, options?: tile.Options) => {
        if (props.entityMap.size === 0) {
            return;
        }
        const entity = props.entityMap.get(entityID);
        if (entity) {
            return tile.wrapTile(entity, options)(Tile);
        }
    }

    return (
        <>
            <div>Home Assistant Dashboard</div>
            <Room title='Living Room'>
                {getTile(Light, 'switch.marble_lamp', { icon: 'table-lights' })}
                {getTile(Light, 'switch.pendant_lamp', { icon: 'desk-lamp' })}
                {getTile(Gauge, 'sensor.thermostat_humidity', { showName: true })}
            </Room>
            <Room title='Family Room'>
                {getTile(Light, 'light.family_room_lights', { icon: 'philips-hue-go' })}
                {getTile(Light, 'light.family_room_chandelier', { icon: 'luminaria-led' })}
                {getTile(Light, 'switch.cat_den', { icon: 'animal-shelter' })}
                {getTile(Gauge, 'sensor.nest_temperature_sensor_family_room_temperature', { showName: true })}
            </Room>
            <Room title='Kitchen'>
                {getTile(Light, 'switch.kitchen_lights', { icon: 'philips-hue-go' })}
                {getTile(Light, 'switch.kitchen_chandelier', { icon: 'chandelier' })}
            </Room>
            <Room title='Master Bedroom'>
                {getTile(Light, 'light.master_light', { icon: 'chandelier' })}
                {getTile(Gauge, 'sensor.master_bedroom_temperature_sensor_temperature', { showName: true })}
            </Room>
            <Room title='Outside'>
                {getTile(Garage, 'cover.garage_door')}
                {getTile(Light, 'switch.front_door_lights', { icon: 'lights' })}
                {getTile(Light, 'switch.outdoor_lights', { icon: 'external-lights' })}
            </Room>
            <Room title='Cameras'>
                {getTile(Camera, 'camera.garage_cam_high', { showName: true })}
                {getTile(Camera, 'camera.family_room_cam_high', { showName: true })}
                {getTile(Camera, 'camera.bedroom_cam_high', { showName: true })}
            </Room>
            <Room title='System'>
                {getTile(Gauge, 'sensor.synology_nas_cpu_utilization_total', { showName: true })}
                {getTile(Gauge, 'sensor.synology_nas_memory_usage_real', { showName: true })}
                {getTile(Gauge, 'sensor.udr_memory_utilization', { showName: true })}
                {getTile(Gauge, 'sensor.synology_nas_volume_1_volume_used', { showName: true })}
                {getTile(Gauge, 'sensor.udr_storage_utilization', { showName: true })}
                {getTile(Gauge, 'sensor.online_devices', { showName: true })}
                {getTile(Gauge, 'sensor.1m_download_max', { showName: true })}
                {getTile(Gauge, 'sensor.1m_upload_max', { showName: true })}
                {getTile(Gauge, 'sensor.adguard_home_dns_queries_blocked_ratio', { showName: true })}
            </Room>
            <div>
                <p><Link to='/settings'>Settings</Link></p>
                <p>TODO Footer: <a href='https://icons8.com/' target='_blank' rel='noreferrer'>Icons by Icons8</a></p>
            </div>
        </>
    );
}
