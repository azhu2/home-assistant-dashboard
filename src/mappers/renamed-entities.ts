/** Map of entities to rename */
const renamedEntityMap: {[key: string]: string} = {
    'sensor.synology_nas_cpu_utilization_total': 'NAS CPU',
    'sensor.synology_nas_memory_usage_real': 'NAS RAM',
    'sensor.udr_memory_utilization': 'UDR RAM',
    'sensor.synology_nas_volume_1_volume_used': 'NAS Storage',
    'sensor.udr_storage_utilization': 'UDR Storage',
    'sensor.1m_download_max': 'Downnload',
    'sensor.1m_upload_max': 'Upload',
    'sensor.thermostat_humidity': 'Humidity',
    'sensor.adguard_home_dns_queries_blocked_ratio': 'AdGuard Blocked',
};

export default renamedEntityMap;
