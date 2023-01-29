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
};

function getType(entityID: string): Type | undefined {
    return typeMapping[entityID];
}

export default getType;
