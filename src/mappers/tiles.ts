import { ReactElement } from 'react';
import CameraTile from '../components/tiles/camera/camera';
import GarageTile from '../components/tiles/garage/garage';
import GaugeTile from '../components/tiles/gauge/gauge';
import LightTile from '../components/tiles/light/light';
import { TileProps } from '../components/tiles/tile';
import { EntityType } from '../entities/ha-entity';

/** Fetches a default tile for an entity type. */
const toTile:{[type in EntityType]: (props: TileProps) => ReactElement} = {
    light: LightTile,
    camera: CameraTile,
    gauge: GaugeTile,
    garage: GarageTile,
}

export default toTile;
