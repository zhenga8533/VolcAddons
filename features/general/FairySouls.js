import settings from "../../utils/settings";
import { getClosest } from "../../utils/functions/find";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Variables used to represent soul waypoints.
 */
let fairyClose = data.fairySouls[getWorld()] ?? [];
export function getFairy() { return settings.fairyWaypoint ? fairyClose : [] };

/**
 * Removes closest fairy soul to player once one is unlocked.
 */
registerWhen(register("chat", () => {
    // Delete closest soul
    const souls = data.fairySouls[getWorld()];
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
    if (closest !== undefined && closest[1] < 10) souls.splice(souls.indexOf(closest[0]), 1);
}).setCriteria("SOUL! You found a Fairy Soul!"), () => settings.fairyWaypoint !== 0);

/**
 * Fail safe fairy soul remove in case player clicks on an unregistered soul.
 */
registerWhen(register("chat", () => {
    const souls = data.fairySouls[getWorld()];
    if (souls.length === 0) return;

    // Delete duplicate soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
    if (closest !== undefined && closest[1] < 5) souls.splice(souls.indexOf(closest[0]), 1);
}).setCriteria("You have already found that Fairy Soul!"), () => settings.fairyWaypoint !== 0);

/**
 * Updates fairy soul array closer than set threshold to player.
 */
registerWhen(register("step", () => {
    // Filters to closest souls
    fairyClose = data.fairySouls[getWorld()]?.filter((fairy) => Math.hypot(Player.getX() - fairy[0], Player.getZ() - fairy[2]) < settings.fairyWaypoint) ?? [];
}).setFps(1), () => settings.fairyWaypoint !== 0);
