import Type from "../entities/type";

const typeMapping: {[key: string]: Type} = {
    'switch.marble_lamp': Type.Light,
    'switch.pendant_lamp': Type.Light,
    'light.family_room_lights': Type.Light,
    'light.family_room_chandelier': Type.Light,
    'switch.cat_den': Type.Light,
    'switch.kitchen_chandelier': Type.Light,
    'switch.kitchen_lights': Type.Light,
    'light.master_light': Type.Light,
    'switch.front_door_lights': Type.Light,
    'switch.outdoor_lights': Type.Light,
    'sensor.synology_nas_cpu_utilization_total': Type.Gauge,
    'sensor.synology_nas_memory_usage_real': Type.Gauge,
    'sensor.udr_memory_utilization': Type.Gauge,
    'sensor.synology_nas_volume_1_volume_used': Type.Gauge,
    'sensor.udr_storage_utilization': Type.Gauge,
    'sensor.online_devices': Type.Gauge,
    'sensor.1m_download_max': Type.Gauge,
    'sensor.1m_upload_max': Type.Gauge,
    'camera.garage_cam_high': Type.Camera,
    'camera.family_room_cam_high': Type.Camera,
    'camera.bedroom_cam_high': Type.Camera,
    // 'camera.front_door': Type.Camera,
    // 'camera.front_yard_camera_2': Type.Camera,
    // 'camera.backyard_cam': Type.Camera,
    // 'camera.living_room_camera_2': Type.Camera,
};

function getType(entityID: string): Type | undefined {
    return typeMapping[entityID];
}

export default getType;
