import { GRAY, GREEN, LOGO } from "../../utils/constants";
import settings from "../../utils/settings";
import { registerWhen } from "../../utils/variables";
import { findZone, getWorld } from "../../utils/worlds";


/**
 * Variables used to estimate compass location.
 */
let path = [];
let lastPath = [];
let compass = [];
let zone = undefined;
export function getCompass() { return compass };
register("worldUnload", () => {
    compass = [];
    zone = undefined;
});

/**
 * Finds the intercept location between the dx, dz of two lines.
 * 
 * @param {Number[]} line1 - Line numero uno
 * @param {Number[]} line2 - Line numero dos
 * @returns {Number[]} [x, z] of the intercept (or undefined if parallel)
 */
function findIntersection(line1, line2) {
    const [[x1, , z1], [x2, , z2]] = line1;
    const [[x3, , z3], [x4, , z4]] = line2;

    const determinant = (x1 - x2) * (z3 - z4) - (z1 - z2) * (x3 - x4);
    if (determinant === 0) return undefined;

    // Calc intersection
    const x = ((x1 * z2 - z1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * z4 - z3 * x4)) / determinant;
    const z = ((x1 * z2 - z1 * x2) * (z3 - z4) - (z1 - z2) * (x3 * z4 - z3 * x4)) / determinant;

    return [x, z];
}

/**
 * Uses wishing compass shattered chat message to update path logic.
 */
registerWhen(register("chat", () => {
    if (zone === findZone()) lastPath = path;
    else lastPath = [];

    zone = findZone();
    path = [];
}).setCriteria("Your Wishing Compass shattered into pieces!"), () => getWorld() === "Crystal Hollows" && settings.compassLocator);

/**
 * Uses compass particles to track and estimate compass location.
 */
registerWhen(register("spawnParticle", (particle, type) => {
    if (path.length > 1 || type.toString() !== "VILLAGER_HAPPY") return;

    path.push([particle.getX(), particle.getY(), particle.getZ()]);
    if (path.length > 1 && lastPath.length > 1) {
        // Find x and z of location
        const intersect = findIntersection(path, lastPath);
        if (intersect === undefined) return;

        // Find y of location
        const origin = path[0];
        const distance = Math.hypot(intersect[0] - origin[0], intersect[1] - origin[2]);
        const y = origin[1] + distance * (path[1][1] - origin[1]);

        // Get location name
        const name = zone.startsWith(" ⏣ Mithril") ? "Meido in Abisu" :
            zone.startsWith(" ⏣ Precursor") ? "Mirage Island" :
            zone.startsWith(" ⏣ Goblin") ? "Beard Cutter" :
            zone.startsWith(" ⏣ Jungle") ? "Tarzan's Jarven" :
            zone.startsWith(" ⏣ Magma") ? "Heatran's Cave" : "Important Location";
        compass = [[name, intersect[0], y, intersect[1]]];
        ChatLib.chat(`${LOGO + GREEN}Compass location found!`);

        // Check if paths are too close
        const close = Math.hypot(origin[0] - lastPath[0][0], origin[2] - lastPath[0][2]);
        if (close < 16) ChatLib.chat(`${LOGO + GRAY}Location may be incorrect due to proximity of compass uses...`);
    }
}), () => getWorld() === "Crystal Hollows" && settings.compassLocator);
