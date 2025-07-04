import { EntityType } from '../types/ha-entity';

/** Maps entities to their type. Only entities in this map are tracked. */
export const entityTypeMap: {[key: string]: EntityType} = {
    'switch.marble_lamp': EntityType.Light,
    'switch.pendant_lamp': EntityType.Light,
    'light.family_room_lights': EntityType.Light,
    'light.family_room_chandelier': EntityType.Light,
    'switch.cat_den': EntityType.Light,
    'switch.kitchen_chandelier': EntityType.Light,
    'switch.kitchen_lights': EntityType.Light,
    'light.master_light': EntityType.Light,
    'switch.front_door_lights': EntityType.Light,
    'switch.outdoor_lights': EntityType.Light,
    'switch.christmas_tree': EntityType.Light,
    'light.standing_lamp': EntityType.Light,
    'light.entry_sconces': EntityType.Light,
    'switch.hallway_light': EntityType.Light,
    'switch.stairway_lights': EntityType.Light,
    'sensor.synology_nas_cpu_utilization_total': EntityType.Gauge,
    'sensor.synology_nas_memory_usage_real': EntityType.Gauge,
    'sensor.udr_cpu_utilization': EntityType.Gauge,
    'sensor.udr_memory_utilization': EntityType.Gauge,
    'sensor.udr_udr_cpu_temperature': EntityType.Gauge,
    'sensor.synology_nas_volume_1_volume_used': EntityType.Gauge,
    'sensor.online_devices': EntityType.Gauge,
    'sensor.1m_download_max': EntityType.Gauge,
    'sensor.1m_upload_max': EntityType.Gauge,
    'sensor.top_download_device': EntityType.Gauge,
    'sensor.top_upload_device': EntityType.Gauge,
    'sensor.udr_port_1_rx': EntityType.Gauge,
    'sensor.udr_port_1_tx': EntityType.Gauge,
    'sensor.udr_port_2_rx': EntityType.Gauge,
    'sensor.udr_port_2_tx': EntityType.Gauge,
    'sensor.udr_port_3_rx': EntityType.Gauge,
    'sensor.udr_port_3_tx': EntityType.Gauge,
    'sensor.udr_port_4_rx': EntityType.Gauge,
    'sensor.udr_port_4_tx': EntityType.Gauge,
    'sensor.udr_port_5_rx': EntityType.Gauge,
    'sensor.udr_port_5_tx': EntityType.Gauge,
    'sensor.desktop_402nh5i_rx': EntityType.Gauge,
    'sensor.desktop_402nh5i_tx': EntityType.Gauge,
    'camera.garage_cam_high': EntityType.Camera,
    'camera.family_room_cam_high': EntityType.Camera,
    'camera.bedroom_cam_high': EntityType.Camera,
    'camera.kitchen_cam_high': EntityType.Camera,
    'camera.office_cam_high': EntityType.Camera,
    'camera.living_room_cam_high_2': EntityType.Camera,
    'camera.driveway_cam_high_2': EntityType.Camera,
    'camera.front_yard_cam_high_3': EntityType.Camera,
    'camera.backyard_cam_high': EntityType.Camera,
    'camera.front_door': EntityType.Camera,
    'climate.office_ac': EntityType.Thermostat,
    'climate.bedroom_ac': EntityType.Thermostat,
    'binary_sensor.office_ac_cooling': EntityType.Gauge,
    'binary_sensor.office_ac_heating': EntityType.Gauge,
    'binary_sensor.bedroom_ac_cooling': EntityType.Gauge,
    'binary_sensor.bedroom_ac_heating': EntityType.Gauge,
    'sensor.office_remote_temperature': EntityType.Gauge,
    'sensor.office_remote_humidity': EntityType.Gauge,
    'sensor.bedroom_remote_temperature': EntityType.Gauge,
    'sensor.bedroom_remote_humidity': EntityType.Gauge,
    'climate.ecobee_thermostat': EntityType.Thermostat,
    'climate.ecobee_thermostat_2': EntityType.Thermostat,
    'binary_sensor.thermostat_heating': EntityType.Gauge,
    'binary_sensor.thermostat_cooling': EntityType.Gauge,
    'sensor.average_temperature': EntityType.Gauge,
    'sensor.living_room_temperature_2': EntityType.Gauge,
    'binary_sensor.living_room_occupancy_2': EntityType.Gauge,
    'sensor.ecobee_humidity': EntityType.Gauge,
    'sensor.ecobee_air_quality_index': EntityType.Gauge,
    'sensor.ecobee_carbon_dioxide': EntityType.Gauge,
    'sensor.ecobee_vocs': EntityType.Gauge,
    'sensor.family_room_temperature_2': EntityType.Gauge,
    'binary_sensor.family_room_occupancy_2': EntityType.Gauge,
    'sensor.master_bedroom_temperature_2': EntityType.Gauge,
    'binary_sensor.master_bedroom_occupancy_2': EntityType.Gauge,
    'sensor.office_temperature_2': EntityType.Gauge,
    'binary_sensor.office_occupancy_2': EntityType.Gauge,
    'sensor.guest_bedroom_temperature_2': EntityType.Gauge,
    'binary_sensor.guest_bedroom_occupancy_2': EntityType.Gauge,
    'binary_sensor.front_door_contact': EntityType.Switch,
    'binary_sensor.backyard_door_contact': EntityType.Switch,
    'binary_sensor.guest_bathroom_window_contact': EntityType.Switch,
    'binary_sensor.guest_bedroom_window_contact': EntityType.Switch,
    'switch.adguard_home_protection': EntityType.Switch,
    'sensor.adguard_home_dns_queries_blocked_ratio': EntityType.Gauge,
    'sensor.adguard_home_average_processing_speed': EntityType.Gauge,
    'sensor.uck_g2_plus_cpu_temperature': EntityType.Gauge,
    'sensor.uck_g2_plus_cpu_utilization': EntityType.Gauge,
    'sensor.uck_g2_plus_memory_utilization': EntityType.Gauge,
    'sensor.uck_g2_plus_storage_utilization': EntityType.Gauge,
    'sensor.unifi_oldest_recording': EntityType.Gauge,
    'cover.garage_door_ratgdo': EntityType.Garage,
    'switch.garage_cam_recording': EntityType.Switch,
    'switch.family_room_cam_recording': EntityType.Switch,
    'switch.bedroom_cam_recording': EntityType.Switch,
    'switch.kitchen_cam_recording': EntityType.Switch,
    'switch.office_cam_recording': EntityType.Switch,
    'switch.living_room_cam_recording': EntityType.Switch,
    'switch.driveway_cam_recording': EntityType.Switch,
    'switch.front_yard_cam_recording': EntityType.Switch,
    'switch.backyard_cam_recording': EntityType.Switch,
    'switch.air_purifier': EntityType.Switch,
    'switch.small_fan': EntityType.Switch,
    'switch.trash_day': EntityType.Switch,
    'select.trash_day': EntityType.Select,
    'switch.lawn_schedule': EntityType.Switch,
    'switch.roses_schedule_2': EntityType.Switch,
    'switch.backyard_primary': EntityType.Switch,
    'switch.backyard_secondary': EntityType.Switch,
    'switch.front_yard_primary': EntityType.Switch,
    'switch.front_yard_secondary': EntityType.Switch,
    'switch.backyard_drip': EntityType.Switch,
    'sensor.time': EntityType.Gauge,
    'sensor.date': EntityType.Gauge,
    'zone.home': EntityType.Gauge,
    'sensor.processor_temperature': EntityType.Gauge,
    'switch.m440i_xdrive_unlocked': EntityType.Switch,
    'sensor.m440i_xdrive_mileage': EntityType.Gauge,
    'sensor.m440i_xdrive_remaining_fuel_percent': EntityType.Gauge,
    'device_tracker.m440i_xdrive': EntityType.Gauge,
    'sensor.2025_chevrolet_corvette_e_ray_odometer': EntityType.Gauge,
    'sensor.2025_chevrolet_corvette_e_ray_fuel_level': EntityType.Gauge,
    'sensor.2025_chevrolet_corvette_e_ray_engine_coolant_temp': EntityType.Gauge,
    'humidifier.living_room': EntityType.Humidifier,
    'sensor.desktop_402nh5i_cpuload': EntityType.Gauge,
    'sensor.desktop_402nh5i_wmicputemp': EntityType.Gauge,
    'sensor.desktop_402nh5i_wmigpuload': EntityType.Gauge,
    'sensor.desktop_402nh5i_wmigputemp': EntityType.Gauge,
    'sensor.desktop_402nh5i_memoryusage': EntityType.Gauge,
    'sensor.desktop_402nh5i_wmifan1': EntityType.Gauge,
    'sensor.desktop_402nh5i_wmifan2': EntityType.Gauge,
    'sensor.desktop_402nh5i_wmifan3': EntityType.Gauge,
    'sensor.desktop_402nh5i_wmifan4': EntityType.Gauge,
    'sensor.desktop_402nh5i_wmifan5': EntityType.Gauge,
    'sensor.desktop_402nh5i_wmifan6': EntityType.Gauge,
    'sensor.desktop_402nh5i_wmigpufan1': EntityType.Gauge,
    'sensor.desktop_402nh5i_wmigpufan2': EntityType.Gauge,
};
