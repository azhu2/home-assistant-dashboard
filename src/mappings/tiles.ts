import React from 'react';
import CameraTile from '../components/tiles/camera/camera';
import GaugeTile from '../components/tiles/gauge/gauge';
import LightTile from '../components/tiles/light/light';
import TemperatureTile from '../components/tiles/temperature/temperature';
import { TileProps } from '../components/tiles/tile';
import { EntityType } from '../entities/ha-entity';

const toTileType:{[type in EntityType]: (props: TileProps) => React.ReactElement} = {
    LIGHT: LightTile,
    CAMERA: CameraTile,
    GAUGE: GaugeTile,
    TEMPERATURE: TemperatureTile,
}

export default toTileType;
