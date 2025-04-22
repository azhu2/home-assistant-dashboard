import { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import * as time from '../common/time/time';
import * as base from '../components/base';
import { Graph } from '../components/graph/graph';
import { Room } from '../components/room/room';
import { Section } from '../components/section/section';
import * as tile from '../components/tile/tile';
import { Camera } from '../components/tiles/camera/camera';
import { Garage } from '../components/tiles/garage/garage';
import { Gauge } from '../components/tiles/gauge/gauge';
import { HistoryGauge } from '../components/tiles/gauge/history-gauge';
import { NeedleGauge, PercentGauge, InversePercentGauge } from '../components/tiles/gauge/needle-gauge';
import { DimmableLight, Light } from '../components/tiles/light/light';
import { Switch } from '../components/tiles/switch/switch';
import { Thermostat } from '../components/tiles/thermostat/thermostat';
import * as formatter from '../types/formatter';
import * as haEntity from '../types/ha-entity';
import './layout.css';
import { Humidifier } from '../components/tiles/humidifier/humidifier';

type Props = {
    entityMap: Map<string, haEntity.Entity>
}

type Options = {
    tileOptions?: tile.Options,
    secondaryEntityIDs?: SecondaryEntityIDs,
    tileProps?: tile.TileProps,
}

type SecondaryEntityIDs = string[];

export const Layout = (props: Props) => {
    /** Construct a tile for a given tile type and entity ID. */
    const getTile = <P extends base.BaseEntityProps>(Tile: ComponentType<P>, entityID: string, options?: Options) => {
        const entity = getEntityForEntityID(entityID);
        if (!entity) {
            return;     // TODO Return unavailable tile
        }
        if (options?.secondaryEntityIDs) {
            const secondaryEntities = options.secondaryEntityIDs
                .map(getEntityForEntityID)
                // Weird hack to get typescript to understand we're filtering out undefineds - https://www.benmvp.com/blog/filtering-undefined-elements-from-array-typescript/
                .filter((e): e is haEntity.Entity => !!e);
            options.tileOptions = { ...options.tileOptions, secondaryEntities };
        }
        return tile.wrapTile(entity, options?.tileOptions, options?.tileProps)(Tile);
    }

    const getEntityForEntityID = (entityID: string) => {
        if (props.entityMap.size === 0) {
            return undefined;
        }
        return props.entityMap.get(entityID);
    }

    const homeEntity = getEntityForEntityID('zone.home');
    const timeEntity = getEntityForEntityID('sensor.time');
    const trashDayEntity = getEntityForEntityID('select.trash_day');
    const thermostatEntity = getEntityForEntityID('climate.ecobee_thermostat');
    const targetSeries = thermostatEntity?.attributes['target_temp_low'] && thermostatEntity.attributes['target_temp_high'] ?
        [{ label: 'Target', entityID: new haEntity.EntityID('climate.ecobee_thermostat_2'), attribute: 'target_temp_low' },  // Target low
        { label: 'Target', entityID: new haEntity.EntityID('climate.ecobee_thermostat_2'), attribute: 'target_temp_high' }]: // Target high
        [{ label: 'Target', entityID: new haEntity.EntityID('climate.ecobee_thermostat_2'), attribute: 'temperature' }]


    return (
        <div id='dashboard'>
            <div className='title'>{homeEntity?.attributes['friendly_name'] || 'Home'}</div>
            <div className='time'>{timeEntity?.state}</div>

            <div id='tiles'>
                <div className='section-row'>
                    <Section title='Controls'>
                        <Room title='Lights'>
                            {getTile(Light, 'switch.marble_lamp', { tileOptions: { icon: 'table-lights' } })}
                            {getTile(Light, 'light.standing_lamp', { tileOptions: { icon: 'table-lights' } })}
                            {getTile(Light, 'switch.pendant_lamp', { tileOptions: { icon: 'desk-lamp' } })}
                        </Room>
                        <Room title='Garage'>
                            {getTile(Garage, 'cover.garage_door_ratgdo', { tileOptions: { icon: 'garage-closed' } })}
                            {getTile(Switch, 'device_tracker.m440i_xdrive', { tileOptions: { icon: { name: 'bmw', color: '6644aa', filled: true }, secondaryIcons: ['bmw'] } })}
                            {getTile(Switch, 'switch.m440i_xdrive_unlocked', { tileOptions: { icon: { name: 'door-ajar', color: '6644aa', filled: true }, secondaryIcons: ['door-lock'] } })}
                            {getTile(Gauge, 'sensor.m440i_xdrive_mileage', { tileOptions: { showName: true, formatter: formatter.ToThousands } })}
                            {getTile(InversePercentGauge, 'sensor.m440i_xdrive_remaining_fuel_percent', { tileOptions: { showName: true } })}
                        </Room>
                    </Section>
                    <Section title='System'>
                        <Room title='Network'>
                            {getTile(PercentGauge, 'sensor.udr_cpu_utilization', { tileOptions: { showName: true, formatter: formatter.WithPrecision(1) } })}
                            {getTile(PercentGauge, 'sensor.udr_memory_utilization', { tileOptions: { showName: true, formatter: formatter.WithPrecision(1) } })}
                            {getTile(Gauge, 'sensor.online_devices', { tileOptions: { showName: true } })}
                            {getTile(HistoryGauge, 'sensor.udr_port_5_rx', { tileOptions: { showName: true, formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                            {getTile(HistoryGauge, 'sensor.udr_port_5_tx', { tileOptions: { showName: true, formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                        </Room>
                        <Room title='NVR'>
                            {getTile(PercentGauge, 'sensor.uck_g2_plus_cpu_utilization', { tileOptions: { showName: true, formatter: formatter.WithPrecision(1) } })}
                            {getTile(PercentGauge, 'sensor.uck_g2_plus_memory_utilization', { tileOptions: { showName: true, formatter: formatter.WithPrecision(1) } })}
                            {getTile(NeedleGauge, 'sensor.uck_g2_plus_cpu_temperature', { tileOptions: { showName: true, formatter: formatter.WithPrecision(1) }, tileProps: { min: 90, max: 150 } })}
                            {getTile(HistoryGauge, 'sensor.udr_port_4_rx', { tileOptions: { showName: true, formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                            {getTile(HistoryGauge, 'sensor.udr_port_4_tx', { tileOptions: { showName: true, formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                            {getTile(Gauge, 'sensor.unifi_oldest_recording', { tileOptions: {showName: true, formatter: formatter.AbbreviateDuration }})}
                        </Room>
                        <Room title='NAS'>
                            {getTile(PercentGauge, 'sensor.synology_nas_cpu_utilization_total', { tileOptions: { showName: true, formatter: formatter.WithPrecision(1) } })}
                            {getTile(PercentGauge, 'sensor.synology_nas_memory_usage_real', { tileOptions: { showName: true, formatter: formatter.WithPrecision(1) } })}
                            {getTile(PercentGauge, 'sensor.synology_nas_volume_1_volume_used', { tileOptions: { showName: true, formatter: formatter.WithPrecision(1) } })}
                            {getTile(NeedleGauge, 'sensor.processor_temperature', { tileOptions: { showName: true, formatter: formatter.WithPrecision(1) }, tileProps: { min: 90, max: 200 } })}
                            {getTile(HistoryGauge, 'sensor.udr_port_1_rx', { tileOptions: { showName: true, formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                            {getTile(HistoryGauge, 'sensor.udr_port_1_tx', { tileOptions: { showName: true, formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                        </Room>
                        <Room title='DNS'>
                            {getTile(PercentGauge, 'sensor.adguard_home_dns_queries_blocked_ratio', { tileOptions: { showName: true } })}
                            {getTile(NeedleGauge, 'sensor.adguard_home_average_processing_speed', { tileOptions: { showName: true }, tileProps: { min: 0, max: 100 } })}
                            {getTile(Switch, 'switch.adguard_home_protection', { tileOptions: { showName: true, icon: { name: 'protect', color: '#55aa55' }, secondaryIcons: [{ name: 'delete-shield', filled: true, color: '#ff0000' }] }, tileProps: { onClick: { domain: 'script', action: 'adguard_home_off_30_min' } } })}
                        </Room>
                    </Section>
                </div>
                <div>
                    <Room title='Cameras' wrappable>
                        {getTile(Camera, 'camera.family_room_cam_high', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.family_room_cam_recording'] })}
                        {getTile(Camera, 'camera.office_cam_high', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.office_cam_recording'] })}
                        {getTile(Camera, 'camera.living_room_cam_high_2', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.living_room_cam_recording'] })}
                        {getTile(Camera, 'camera.kitchen_cam_high', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.kitchen_cam_recording'] })}
                        {getTile(Camera, 'camera.bedroom_cam_high', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.bedroom_cam_recording'] })}
                        {getTile(Camera, 'camera.garage_cam_high', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.garage_cam_recording'] })}
                        {getTile(Camera, 'camera.driveway_cam_high_2', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.driveway_cam_recording'] })}
                        {getTile(Camera, 'camera.front_yard_cam_high_3', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.front_yard_cam_recording'] })}
                        {getTile(Camera, 'camera.backyard_cam_high', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.backyard_cam_recording'] })}
                    </Room>
                </div>
            </div>
            <div>
                <p><Link to='/settings'>Settings</Link></p>
                <p>TODO Footer: <a href='https://icons8.com/' target='_blank' rel='noreferrer'>Icons by Icons8</a></p>
            </div>
        </div>
    );
}
