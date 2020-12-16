/*
16-Dec-2020     Added hasAttack and hasDamage (copies of systems/dnd53/module/item/sheet.js#ItemSheet5e.hasAttack)

*/

import { MODULE_ID } from "./constants.js";
export function log(force, ...args) {
    if (force || CONFIG[MODULE_ID].debug === true) {
        console.log(MODULE_ID, '|', ...args);
    }
}

export function hasAttack(spell) {
    return ["mwak", "rwak", "msak", "rsak"].includes(spell?.data?.actionType);
}
export function hasDamage(spell) {
    return (spell?.data?.damage?.parts.length > 0);
}


export function getActivationType(activationType) {
    switch (activationType) {
        case 'action':
        case 'bonus':
        case 'reaction':
            return activationType;
        default:
            return 'special';
    }
}
export function getWeaponRelevantAbility(itemData, actorData) {
    if (!('ability' in itemData)) {
        return null;
    }
    const { ability, weaponType, properties } = itemData;
    // Case 1 - defined directly by the itemData
    if (ability) {
        return ability;
    }
    // Case 2 - inferred from actorData
    if (actorData) {
        // Melee weapons - Str or Dex if Finesse (PHB pg. 147)
        if (['simpleM', 'martialM'].includes(weaponType)) {
            if (properties.fin === true) {
                // Finesse weapons
                return actorData.abilities['dex'].mod >= actorData.abilities['str'].mod ? 'dex' : 'str';
            }
            return 'str';
        }
        // Ranged weapons - Dex (PH p.194)
        if (['simpleR', 'martialR'].includes(weaponType)) {
            return 'dex';
        }
        return 'str';
    }
    // Default null
    return null;
}
