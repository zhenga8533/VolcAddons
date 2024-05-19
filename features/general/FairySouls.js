import location from "../../utils/location";
import settings from "../../utils/settings";
import { getClosest } from "../../utils/functions/find";
import { registerWhen } from "../../utils/register";
import { Waypoint } from "../../utils/WaypointUtil";
import { Json } from "../../utils/json";


/**
 * Variables used to represent soul waypoints.
 */
const soulWaypoints = new Waypoint([1, 0.75, 0.8], true);
const fairySouls = new Json("fairySouls.json", true).getData();

/**
 * Removes closest fairy soul to player once one is unlocked.
 */
registerWhen(register("chat", () => {
    const souls = fairySouls[location.getWorld()];
    if (souls.length === 0) return;

    // Delete closest soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
    if (closest !== undefined && closest[1] < 10) souls.splice(souls.indexOf(closest[0]), 1);
}).setCriteria("SOUL! You found a Fairy Soul!"), () => settings.fairyWaypoint !== 0);

/**
 * Fail safe fairy soul remove in case player clicks on an unregistered soul.
 */
registerWhen(register("chat", () => {
    const souls = fairySouls[location.getWorld()];
    if (souls.length === 0) return;

    // Delete duplicate soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
    if (closest !== undefined && closest[1] < 10) souls.splice(souls.indexOf(closest[0]), 1);
}).setCriteria("You have already found that Fairy Soul!"), () => settings.fairyWaypoint !== 0);

/**
 * Updates fairy soul array closer than set threshold to player.
 */
registerWhen(register("step", () => {
    // Filters to closest souls
    soulWaypoints.clear();
    fairySouls[location.getWorld()]?.forEach(fairy => {
        const x = parseFloat(fairy[1]) + 1;
        const y = parseFloat(fairy[2]);
        const z = parseFloat(fairy[3]) + 1;

        if (Math.hypot(Player.getX() - x, Player.getZ() - z) < settings.fairyWaypoint) {
            soulWaypoints.push([x, y, z]);
        }
    });
}).setFps(1), () => settings.fairyWaypoint !== 0);
