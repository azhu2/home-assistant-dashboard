import { EntityWrapper } from '../components/base';
import CameraWrapper from '../components/camera/wrapper';
import GauageWrapper from '../components/gauge/wrapper';
import LightWrapper from '../components/light/wrapper';
import { EntityType } from '../entities/ha-entity';

const toWrapperType:{[type in EntityType]: EntityWrapper} = {
    LIGHT: LightWrapper,
    CAMERA: CameraWrapper,
    GAUGE: GauageWrapper,
}

export default toWrapperType;
