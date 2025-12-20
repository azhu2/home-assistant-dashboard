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
import { InversePercentGauge, NeedleGauge, PercentGauge } from '../components/tiles/gauge/needle-gauge';
import { Light } from '../components/tiles/light/light';
import { Switch } from '../components/tiles/switch/switch';
import { Thermostat } from '../components/tiles/thermostat/thermostat';
import { TirePressure } from '../components/tiles/tire-pressure/tire-pressure';
import * as formatter from '../types/formatter';
import * as haEntity from '../types/ha-entity';
import './layout.css';

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

    const getThermostatTargetSeries = (entityID: string) => {
        const thermostatEntity = getEntityForEntityID(entityID);
        if (!thermostatEntity) {
            return [];
        }
        return thermostatEntity.attributes['target_temp_low'] && thermostatEntity.attributes['target_temp_high'] ?
            [{ label: 'Target', entityID: thermostatEntity.entityID, attribute: 'target_temp_low' },  // Target low
            { label: 'Target', entityID: thermostatEntity.entityID, attribute: 'target_temp_high' }]: // Target high
            [{ label: 'Target', entityID: thermostatEntity.entityID, attribute: 'temperature' }]
    }

    return (
        <div id='dashboard'>
            <div className='title'>{homeEntity?.attributes['friendly_name'] || 'Home'}</div>
            <div className='time'>{timeEntity?.state}</div>

            <div id='tiles'>
                <div className='section-row'>
                    <Section title='Controls'>
                        <Room title='Lights'>
                            {getTile(Light, 'switch.marble_lamp', { tileOptions: { icon: 'table-lights' } })}
                            {getTile(Light, 'switch.standing_lamp', { tileOptions: { icon: 'table-lights' } })}
                            {getTile(Light, 'switch.pendant_lamp', { tileOptions: { icon: 'desk-lamp' } })}
                        </Room>
                        <Room title='Grow Lights'>
                            {getTile(Light, 'switch.bedroom_grow_lights', { tileOptions: { icon: 'curtain-light' } })}
                            {getTile(Light, 'switch.living_room_grow_lights', { tileOptions: { icon: 'ceiling-light' } })}
                            {getTile(Light, 'switch.office_grow_light_1', { tileOptions: { icon: 'led-bulb' } })}
                            {getTile(Light, 'switch.office_grow_light_2', { tileOptions: { icon: 'led-bulb' } })}
                        </Room>
                        <Room title='Garage'>
                            {getTile(Garage, 'cover.garage_door_ratgdo', { tileOptions: { icon: 'garage-closed' } })}
                        </Room>
                        <Room title='BMW'>
                            {getTile(Switch, 'switch.m440i_xdrive_unlocked', { tileOptions: { icon: { name: 'door-ajar', color: '6644aa', filled: true }, secondaryIcons: ['door-lock'] } })}
                            {getTile(Gauge, 'sensor.m440i_xdrive_mileage', { tileOptions: { name: 'Odometer', formatter: formatter.ToThousands } })}
                            {getTile(InversePercentGauge, 'sensor.m440i_xdrive_remaining_fuel_percent', { tileOptions: { name: 'Fuel' } })}
                            {getTile(TirePressure, 'device_tracker.m440i_xdrive', {
                                tileOptions: { name: 'Tires' },
                                secondaryEntityIDs: [
                                    'sensor.m440i_xdrive_front_left_tire_pressure',
                                    'sensor.m440i_xdrive_front_right_tire_pressure',
                                    'sensor.m440i_xdrive_rear_left_tire_pressure',
                                    'sensor.m440i_xdrive_rear_right_tire_pressure',
                                    'sensor.m440i_xdrive_front_left_target_pressure',
                                    'sensor.m440i_xdrive_front_right_target_pressure',
                                    'sensor.m440i_xdrive_rear_left_target_pressure',
                                    'sensor.m440i_xdrive_rear_right_target_pressure',
                                ]
                            })}
                        </Room>
                        <Room title='Corvette'>
                            {getTile(Gauge, 'sensor.2025_chevrolet_corvette_e_ray_odo_read', { tileOptions: { name: 'Odometer', formatter: formatter.ToThousands } })}
                            {getTile(InversePercentGauge, 'sensor.2025_chevrolet_corvette_e_ray_fuel_level', { tileOptions: { name: 'Fuel', formatter: formatter.WithPrecision(0) } })}
                            {getTile(PercentGauge, 'sensor.2025_chevrolet_corvette_e_ray_eol_read', { tileOptions: { name: 'Oil', formatter: formatter.WithPrecision(0) } })}
                            {getTile(TirePressure, 'binary_sensor.2025_chevrolet_corvette_e_ray_command_status_monitor_sensors_polling_status_successful', {
                                tileOptions: { name: 'Tires' },
                                secondaryEntityIDs: [
                                    'sensor.2025_chevrolet_corvette_e_ray_left_front_tire_pressure_psi',
                                    'sensor.2025_chevrolet_corvette_e_ray_right_front_tire_pressure_psi',
                                    'sensor.2025_chevrolet_corvette_e_ray_left_rear_tire_pressure_psi',
                                    'sensor.2025_chevrolet_corvette_e_ray_right_rear_tire_pressure_psi',
                                    'sensor.2025_chevrolet_corvette_e_ray_front_placard_psi',
                                    'sensor.2025_chevrolet_corvette_e_ray_front_placard_psi',
                                    'sensor.2025_chevrolet_corvette_e_ray_rear_placard_psi',
                                    'sensor.2025_chevrolet_corvette_e_ray_rear_placard_psi',
                                ]
                            })}
                        </Room>
                    </Section>
                    <Section title='System'>
                        <Room title='Network'>
                            {getTile(PercentGauge, 'sensor.udr_cpu_utilization', { tileOptions: { name: 'CPU', formatter: formatter.WithPrecision(1) } })}
                            {getTile(PercentGauge, 'sensor.udr_memory_utilization', { tileOptions: { name: 'RAM', formatter: formatter.WithPrecision(1) } })}
                            {getTile(NeedleGauge, 'sensor.udr_udr_cpu_temperature', { tileOptions: { name: 'Temp', formatter: formatter.WithPrecision(1) }, tileProps: { min: 35, max: 90 } })}
                            {getTile(Gauge, 'sensor.online_devices', { tileOptions: { name: true } })}
                            {getTile(HistoryGauge, 'sensor.udr_port_5_rx', { tileOptions: { name: 'Download', formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                            {getTile(HistoryGauge, 'sensor.udr_port_5_tx', { tileOptions: { name: 'Upload', formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                        </Room>
                        <Room title='NVR'>
                            {getTile(PercentGauge, 'sensor.uck_g2_plus_cpu_utilization', { tileOptions: { name: 'CPU', formatter: formatter.WithPrecision(1) } })}
                            {getTile(PercentGauge, 'sensor.uck_g2_plus_memory_utilization', { tileOptions: { name: 'RAM', formatter: formatter.WithPrecision(1) } })}
                            {getTile(NeedleGauge, 'sensor.uck_g2_plus_cpu_temperature', { tileOptions: { name: 'Temp', formatter: formatter.WithPrecision(1) }, tileProps: { min: 35, max: 65 } })}
                            {getTile(HistoryGauge, 'sensor.udr_port_2_tx', { tileOptions: { name: 'Download', formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                            {getTile(HistoryGauge, 'sensor.udr_port_2_rx', { tileOptions: { name: 'Upload', formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                            {getTile(Gauge, 'sensor.unifi_oldest_recording', { tileOptions: {name: true, formatter: formatter.AbbreviateDuration }})}
                        </Room>
                        <Room title='NAS'>
                            {getTile(PercentGauge, 'sensor.synology_nas_cpu_utilization_total', { tileOptions: { name: 'CPU', formatter: formatter.WithPrecision(1) } })}
                            {getTile(PercentGauge, 'sensor.synology_nas_memory_usage_real', { tileOptions: { name: 'RAM', formatter: formatter.WithPrecision(1) } })}
                            {getTile(PercentGauge, 'sensor.synology_nas_volume_1_volume_used', { tileOptions: { name: 'Storage', formatter: formatter.WithPrecision(1) } })}
                            {getTile(NeedleGauge, 'sensor.processor_temperature', { tileOptions: { name: 'Temp', formatter: formatter.WithPrecision(1) }, tileProps: { min: 35, max: 90 } })}
                            {getTile(HistoryGauge, 'sensor.udr_port_1_tx', { tileOptions: { name: 'Download', formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                            {getTile(HistoryGauge, 'sensor.udr_port_1_rx', { tileOptions: { name: 'Upload', formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                        </Room>
                        <Room title='DNS'>
                            {getTile(PercentGauge, 'sensor.adguard_home_dns_queries_blocked_ratio', { tileOptions: { name: 'Blocked Ratio' } })}
                            {getTile(NeedleGauge, 'sensor.adguard_home_average_processing_speed', { tileOptions: { name: 'Latency (24h)' }, tileProps: { min: 0, max: 100 } })}
                            {getTile(Switch, 'switch.adguard_home_protection', { tileOptions: { name: 'Active', icon: { name: 'protect', color: '#55aa55' }, secondaryIcons: [{ name: 'delete-shield', filled: true, color: '#ff0000' }] }, tileProps: { onClick: { domain: 'script', action: 'adguard_home_off_30_min' } } })}
                        </Room>
                        <Room title='PC'>
                            {getTile(PercentGauge, 'sensor.desktop_402nh5i_cpuload', { tileOptions: { name: true } })}
                            {getTile(NeedleGauge, 'sensor.desktop_402nh5i_wmicputemp', { tileOptions: { name: true }, tileProps: { min: 35, max: 95 } })}
                            {getTile(PercentGauge, 'sensor.desktop_402nh5i_wmigpuload', { tileOptions: { name: true } })}
                            {getTile(NeedleGauge, 'sensor.desktop_402nh5i_wmigputemp', { tileOptions: { name: true }, tileProps: { min: 35, max: 95 } })}
                            {getTile(PercentGauge, 'sensor.desktop_402nh5i_memoryusage', { tileOptions: { name: true, formatter: formatter.WithPrecision(1) } })}
                            {getTile(PercentGauge, 'sensor.desktop_402nh5i_wmifan1', { tileOptions: { name: true } })}
                            {getTile(PercentGauge, 'sensor.desktop_402nh5i_wmifan2', { tileOptions: { name: true } })}
                            {getTile(PercentGauge, 'sensor.desktop_402nh5i_wmifan3', { tileOptions: { name: true } })}
                            {getTile(PercentGauge, 'sensor.desktop_402nh5i_wmifan4', { tileOptions: { name: true } })}
                            {getTile(PercentGauge, 'sensor.desktop_402nh5i_wmigpufan1', { tileOptions: { name: true } })}
                            {getTile(HistoryGauge, 'sensor.desktop_402nh5i_tx', { tileOptions: { name: 'Download', formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                            {getTile(HistoryGauge, 'sensor.desktop_402nh5i_rx', { tileOptions: { name: 'Upload', formatter: formatter.WithPrecision(2) }, tileProps: { setBaselineToZero: true } })}
                        </Room>
                    </Section>
                </div>
                <div className='section-row'>
                    <Section title='Climate'>
                        <Room title='Downstairs'>
                            {getTile(Thermostat, 'climate.downstairs_ac_ha')}
                            <div className={`tile tile-temperature-graph`} id='downstairs-temperature-graph' >
                                <div className='content'>
                                    <Graph yAxisGridIncrement={5} xAxisGridIncrement={4 * time.Hour} numBuckets={288}
                                        series={[
                                            ...getThermostatTargetSeries('climate.downstairs_ac_ha'),
                                            { label: 'Downstairs', entityID: new haEntity.EntityID('sensor.downstairs_remote_temperature') },
                                        ]}
                                        annotations={[
                                            { label: 'Heating', entityID: new haEntity.EntityID('binary_sensor.downstairs_ac_heating') },
                                            { label: 'Cooling', entityID: new haEntity.EntityID('binary_sensor.downstairs_ac_cooling') },
                                        ]}
                                    />
                                </div>
                            </div>
                            <div className='gauges'>
                                {getTile(NeedleGauge, 'sensor.downstairs_remote_temperature', { tileOptions: { name: 'Temp', formatter: formatter.WithPrecision(1) }, tileProps: { min: 60, max: 90 } })}
                                {getTile(NeedleGauge, 'sensor.downstairs_remote_humidity', { tileOptions: { name: 'Humidity', formatter: formatter.WithPrecision(0) }, tileProps: { min: 0, max: 100 } })}
                            </div>
                        </Room>
                        <Room title='Office'>
                            {getTile(Thermostat, 'climate.office_ac_ha')}
                            <div className={`tile tile-temperature-graph`} id='office-temperature-graph' >
                                <div className='content'>
                                    <Graph yAxisGridIncrement={5} xAxisGridIncrement={4 * time.Hour} numBuckets={288}
                                        series={[
                                            ...getThermostatTargetSeries('climate.office_ac_ha'),
                                            { label: 'Office', entityID: new haEntity.EntityID('sensor.office_remote_temperature') },
                                        ]}
                                        annotations={[
                                            { label: 'Heating', entityID: new haEntity.EntityID('binary_sensor.office_ac_heating') },
                                            { label: 'Cooling', entityID: new haEntity.EntityID('binary_sensor.office_ac_cooling') },
                                        ]}
                                    />
                                </div>
                            </div>
                            <div className='gauges'>
                                {getTile(NeedleGauge, 'sensor.office_remote_temperature', { tileOptions: { name: 'Temp', formatter: formatter.WithPrecision(1) }, tileProps: { min: 60, max: 90 } })}
                                {getTile(NeedleGauge, 'sensor.office_remote_humidity', { tileOptions: { name: 'Humidity', formatter: formatter.WithPrecision(0) }, tileProps: { min: 0, max: 100 } })}
                            </div>
                        </Room>
                        <Room title='Bedroom'>
                            {getTile(Thermostat, 'climate.bedroom_ac_ha')}
                            <div className={`tile tile-temperature-graph`} id='bedroom-temperature-graph' >
                                <div className='content'>
                                    <Graph yAxisGridIncrement={5} xAxisGridIncrement={4 * time.Hour} numBuckets={288}
                                        series={[
                                            ...getThermostatTargetSeries('climate.bedroom_ac_ha'),
                                            { label: 'Bedroom', entityID: new haEntity.EntityID('sensor.bedroom_remote_temperature') },
                                        ]}
                                        annotations={[
                                            { label: 'Heating', entityID: new haEntity.EntityID('binary_sensor.bedroom_ac_heating') },
                                            { label: 'Cooling', entityID: new haEntity.EntityID('binary_sensor.bedroom_ac_cooling') },
                                        ]}
                                    />
                                </div>
                            </div>
                            <div className='gauges'>
                                {getTile(NeedleGauge, 'sensor.bedroom_remote_temperature', { tileOptions: { name: 'Temp', formatter: formatter.WithPrecision(1) }, tileProps: { min: 60, max: 90 } })}
                                {getTile(NeedleGauge, 'sensor.bedroom_remote_humidity', { tileOptions: { name: 'Humidity', formatter: formatter.WithPrecision(0) }, tileProps: { min: 0, max: 100 } })}
                            </div>
                        </Room>
                    </Section>
                    <Room title='Cameras' wrappable>
                        {getTile(Camera, 'camera.family_room_cam_high', { tileOptions: { name: 'Family Room' }, secondaryEntityIDs: ['switch.family_room_cam_recording'] })}
                        {getTile(Camera, 'camera.office_cam_high', { tileOptions: { name: 'Office' }, secondaryEntityIDs: ['switch.office_cam_recording'] })}
                        {getTile(Camera, 'camera.living_room_cam_high_2', { tileOptions: { name: 'Living Room' }, secondaryEntityIDs: ['switch.living_room_cam_recording'] })}
                        {getTile(Camera, 'camera.kitchen_cam_high', { tileOptions: { name: 'Kitchen' }, secondaryEntityIDs: ['switch.kitchen_cam_recording'] })}
                        {getTile(Camera, 'camera.garage_cam_high', { tileOptions: { name: 'Garage' }, secondaryEntityIDs: ['switch.garage_cam_recording'] })}
                        {getTile(Camera, 'camera.backyard_cam_high', { tileOptions: { name: 'Backyard' }, secondaryEntityIDs: ['switch.backyard_cam_recording'] })}
                    </Room>
                </div>
            </div>
            <div>
                <p><Link to='/settings'>Settings</Link></p>
                <p>TODO Footer: <a href='https://icons8.com/' target='_blank' rel='noreferrer'>Icons by Icons8</a></p>
                <p><a href='https://github.com/azhu2/home-assistant-dashboard/'>Source</a></p>
            </div>
        </div>
    );
}
