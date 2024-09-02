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
import { NeedleGauge, PercentGauge } from '../components/tiles/gauge/needle-gauge';
import { DimmableLight, Light } from '../components/tiles/light/light';
import { Switch } from '../components/tiles/switch/switch';
import { Thermostat } from '../components/tiles/thermostat/thermostat';
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
                <div>
                    <Section title='Indoors'>
                        <Room title='Living Room'>
                            {getTile(Light, 'light.entry_sconces', { tileOptions: { icon: 'lights' } })}
                            {getTile(Light, 'switch.marble_lamp', { tileOptions: { icon: 'table-lights' } })}
                            {getTile(Light, 'light.standing_lamp', { tileOptions: { icon: 'table-lights' } })}
                            {getTile(Light, 'switch.pendant_lamp', { tileOptions: { icon: 'desk-lamp' } })}
                            {getTile(Light, 'switch.christmas_tree', { tileOptions: { icon: 'christmas-tree', hideIfUnavailable: true } })}
                            {getTile(Switch, 'switch.small_fan', { tileOptions: { icon: 'fan' } })}
                        </Room>
                        <div className='section-row'>
                            <Room title='Family Room'>
                                {getTile(DimmableLight, 'light.family_room_lights', { tileOptions: { icon: 'philips-hue-go' } })}
                                {getTile(DimmableLight, 'light.family_room_chandelier', { tileOptions: { icon: { name: 'luminaria-led', filled: true } } })}
                                {getTile(Light, 'switch.cat_den', { tileOptions: { icon: 'animal-shelter' } })}
                            </Room>
                            <Room title='Kitchen'>
                                {getTile(Light, 'switch.kitchen_lights', { tileOptions: { icon: 'philips-hue-go' } })}
                                {getTile(Light, 'switch.kitchen_chandelier', { tileOptions: { icon: 'chandelier' } })}
                            </Room>
                        </div>
                        <Room title='Guest'>
                            {getTile(Switch, 'binary_sensor.guest_bedroom_window_contact', { tileOptions: { icon: { name: 'shutters', color: '6644aa', filled: true }, secondaryIcons: ['closed-window'] } })}
                            {getTile(Switch, 'binary_sensor.guest_bathroom_window_contact', { tileOptions: { icon: { name: 'open-window', color: '6644aa', filled: true }, secondaryIcons: ['closed-window'] } })}
                        </Room>
                        <Room title='Master'>
                            {getTile(DimmableLight, 'light.master_light', { tileOptions: { icon: 'chandelier' } })}
                        </Room>
                    </Section>
                    <Section title='Climate'>
                        <div className='section-row'>
                            <Room title='Controls'>
                                {getTile(Thermostat, 'climate.ecobee_thermostat_2', { tileOptions: { showName: true } })}
                            </Room>
                            <Room title='Air Quality'>
                                {getTile(HistoryGauge, 'sensor.ecobee_humidity', { tileOptions: { showName: true } })}
                                {getTile(NeedleGauge, 'sensor.ecobee_air_quality_index', { tileOptions: { showName: true }, tileProps: { min: 0, max: 300 } })}
                                {getTile(NeedleGauge, 'sensor.ecobee_carbon_dioxide', { tileOptions: { showName: true }, tileProps: { min: 200, max: 5000 } })}
                                {getTile(NeedleGauge, 'sensor.ecobee_vocs', { tileOptions: { showName: true }, tileProps: { min: 250, max: 10000 } })}
                            </Room>
                        </div>
                        <Room title='Temperatures'>
                            <div className={`tile tile-temperature-graph`} id='temperature-graph' >
                                <div className='content'>
                                    <Graph yAxisGridIncrement={5} xAxisGridIncrement={4 * time.Hour} numBuckets={288} showLegend
                                        series={[
                                            ...targetSeries,
                                            { label: 'Family', entityID: new haEntity.EntityID('sensor.family_room_temperature_2') },
                                            { label: 'Living', entityID: new haEntity.EntityID('sensor.living_room_temperature_2') },
                                            { label: 'Master', entityID: new haEntity.EntityID('sensor.master_bedroom_temperature_2') },
                                            { label: 'Office', entityID: new haEntity.EntityID('sensor.office_temperature_2') },
                                            { label: 'Guest', entityID: new haEntity.EntityID('sensor.guest_bedroom_temperature_2') },
                                            /* Summary series need to be last to be on top since SVG draws in order */
                                            { label: 'Average', entityID: new haEntity.EntityID('climate.ecobee_thermostat_2'), attribute: 'current_temperature' }, // Average
                                        ]}
                                        annotations={[
                                            { label: 'Heating', entityID: new haEntity.EntityID('binary_sensor.thermostat_heating') },
                                            { label: 'Cooling', entityID: new haEntity.EntityID('binary_sensor.thermostat_cooling') },
                                        ]}
                                    />
                                </div>
                            </div>
                        </Room>
                    </Section>
                    <Section title='Outside'>
                        <div className='section-row'>
                            <Room title='Front'>
                                {getTile(Switch, 'binary_sensor.front_door_contact', { tileOptions: { icon: { name: 'door-opened', color: '6644aa', filled: true }, secondaryIcons: ['door-closed'] } })}
                                {getTile(Garage, 'cover.garage_door_ratgdo', { tileOptions: { icon: 'garage-closed' } })}
                                {getTile(Light, 'switch.front_door_lights', { tileOptions: { icon: 'lights' } })}
                                {trashDayEntity && trashDayEntity.state !== 'Not Trash Day' && getTile(Switch, 'switch.trash_day', { tileOptions: { icon: 'waste' } })}
                            </Room>
                            <Room title='Car'>
                                {getTile(Switch, 'device_tracker.m440i_xdrive', { tileOptions: { icon: { name: 'bmw', color: '6644aa', filled: true }, secondaryIcons: ['bmw'] } })}
                                {getTile(Switch, 'switch.m440i_xdrive_unlocked', { tileOptions: { icon: { name: 'door-ajar', color: '6644aa', filled: true }, secondaryIcons: ['door-lock'] } })}
                                {getTile(Gauge, 'sensor.m440i_xdrive_mileage', { tileOptions: { showName: true, formatter: formatter.ToThousands } })}
                                {getTile(PercentGauge, 'sensor.m440i_xdrive_remaining_fuel_percent', { tileOptions: { showName: true } })}
                            </Room>
                        </div>
                        <div className='section-row'>
                            <Room title='Backyard'>
                                    {getTile(Switch, 'binary_sensor.backyard_door_contact', { tileOptions: { icon: { name: 'door-opened', color: '6644aa', filled: true }, secondaryIcons: ['door-closed'] } })}
                                    {getTile(Light, 'switch.outdoor_lights', { tileOptions: { icon: 'external-lights' } })}
                            </Room>
                            <Room title='Irrigation'>
                                {getTile(Switch, 'switch.lawn_schedule', { tileOptions: { showName: true, icon: { name: 'grass', color: '#4444dd' } } })}
                                {getTile(Switch, 'switch.roses_schedule_2', { tileOptions: { showName: true, icon: { name: 'rose-bouquet', color: '#4444dd' } } })}
                                {getTile(Switch, 'switch.front_yard_primary', { tileOptions: { showName: true, icon: { name: 'garden-sprinkler', color: '#4444dd' } } })}
                                {getTile(Switch, 'switch.front_yard_secondary', { tileOptions: { showName: true, icon: { name: 'garden-sprinkler', color: '#4444dd' } } })}
                                {getTile(Switch, 'switch.backyard_primary', { tileOptions: { showName: true, icon: { name: 'garden-sprinkler', color: '#4444dd' } } })}
                                {getTile(Switch, 'switch.backyard_secondary', { tileOptions: { showName: true, icon: { name: 'garden-sprinkler', color: '#4444dd' } } })}
                                {getTile(Switch, 'switch.backyard_drip', { tileOptions: { showName: true, icon: { name: 'plant-under-rain', color: '#4444dd' } } })}
                            </Room>
                        </div>
                    </Section>
                    <Section title='System' hideTitle={true}>
                        <Room title='System'>
                            {getTile(PercentGauge, 'sensor.synology_nas_cpu_utilization_total', { tileOptions: { showName: true } })}
                            {getTile(PercentGauge, 'sensor.synology_nas_memory_usage_real', { tileOptions: { showName: true } })}
                            {getTile(PercentGauge, 'sensor.synology_nas_volume_1_volume_used', { tileOptions: { showName: true } })}
                            {getTile(NeedleGauge, 'sensor.processor_temperature', { tileOptions: { showName: true }, tileProps: { min: 90, max: 200 } })}
                            {getTile(PercentGauge, 'sensor.udr_cpu_utilization', { tileOptions: { showName: true } })}
                            {getTile(PercentGauge, 'sensor.udr_memory_utilization', { tileOptions: { showName: true } })}
                            {getTile(Gauge, 'sensor.online_devices', { tileOptions: { showName: true } })}
                            {getTile(HistoryGauge, 'sensor.1m_download_max', { tileOptions: { showName: true }, tileProps: { setBaselineToZero: true } })}
                            {getTile(HistoryGauge, 'sensor.1m_upload_max', { tileOptions: { showName: true }, tileProps: { setBaselineToZero: true } })}
                            {getTile(Gauge, 'sensor.top_download_device', { tileOptions: { showName: true } })}
                            {getTile(Gauge, 'sensor.top_upload_device', { tileOptions: { showName: true } })}
                        </Room>
                    </Section>
                </div>
                <div>
                    <Section title='Cameras' hideTitle={true}>
                        <Room title='Cameras'>
                            {getTile(Camera, 'camera.family_room_cam_high', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.family_room_cam_recording'] })}
                            {getTile(Camera, 'camera.dining_room_cam_high', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.dining_room_cam_recording'] })}
                            {getTile(Camera, 'camera.living_room_cam_high_2', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.living_room_cam_recording'] })}
                            {getTile(Camera, 'camera.kitchen_cam_high', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.kitchen_cam_recording'] })}
                            {getTile(Camera, 'camera.bedroom_cam_high', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.bedroom_cam_recording'] })}
                            {getTile(Camera, 'camera.garage_cam_high', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.garage_cam_recording'] })}
                            {getTile(Camera, 'camera.driveway_cam_high_2', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.driveway_cam_recording'] })}
                            {getTile(Camera, 'camera.front_yard_cam_high_3', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.front_yard_cam_recording'] })}
                            {getTile(Camera, 'camera.backyard_cam_high', { tileOptions: { showName: true }, secondaryEntityIDs: ['switch.backyard_cam_recording'] })}
                        </Room>
                    </Section>
                </div>
            </div>
            <div>
                <p><Link to='/settings'>Settings</Link></p>
                <p>TODO Footer: <a href='https://icons8.com/' target='_blank' rel='noreferrer'>Icons by Icons8</a></p>
            </div>
        </div>
    );
}
