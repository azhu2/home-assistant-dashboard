import { EntityType } from "../entities/ha-entity";

const typeMapping: {[key: string]: EntityType} = {
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
    'sensor.synology_nas_cpu_utilization_total': EntityType.Gauge,
    'sensor.synology_nas_memory_usage_real': EntityType.Gauge,
    'sensor.udr_memory_utilization': EntityType.Gauge,
    'sensor.synology_nas_volume_1_volume_used': EntityType.Gauge,
    'sensor.udr_storage_utilization': EntityType.Gauge,
    'sensor.online_devices': EntityType.Gauge,
    'sensor.1m_download_max': EntityType.Gauge,
    'sensor.1m_upload_max': EntityType.Gauge,
    'camera.garage_cam_high': EntityType.Camera,
    'camera.family_room_cam_high': EntityType.Camera,
    'camera.bedroom_cam_high': EntityType.Camera,
    // 'camera.front_door': Type.Camera,
    // 'camera.front_yard_camera_2': Type.Camera,
    // 'camera.backyard_cam': Type.Camera,
    // 'camera.living_room_camera_2': Type.Camera,
};

function getType(entityID: string): EntityType | undefined {
    return typeMapping[entityID];
}

export default getType;
