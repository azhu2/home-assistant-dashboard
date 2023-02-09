import Camera from '../components/tiles/camera/camera';
import Garage from '../components/tiles/garage/garage';
import Gauge from '../components/tiles/gauge/gauge';
import Light from '../components/tiles/light/light';
import { EntityType } from '../entities/ha-entity';

const toTile = {
    [EntityType.Camera]: Camera,
    [EntityType.Garage]: Garage,
    [EntityType.Gauge]: Gauge,
    [EntityType.Light]: Light,
};

export default toTile;