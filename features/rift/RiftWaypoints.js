import location from "../../utils/location";
import settings from "../../utils/settings";
import { GRAY, GREEN, LOGO, RED, WHITE } from "../../utils/constants";
import { getClosest } from "../../utils/functions/find";
import { registerWhen } from "../../utils/register";
import { data } from "../../utils/data";
import { Waypoint } from "../../utils/WaypointUtil";


/**
 * Variables used to represent soul waypoints.
 */
let enigmaClose = data.enigmaSouls;
export function getEnigma() { return settings.enigmaWaypoint && location.getWorld() === "The Rift" ? enigmaClose : [] };
export function getCat() { return settings.catWaypoint && location.getWorld() === "The Rift" ? data.catSouls : [] };

/**
 * Removes closest enigma soul to player once one is unlocked.
 */
registerWhen(register("chat", () => {
    // Delete closest soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], data.enigmaSouls);
    if (closest !== undefined) data.enigmaSouls.splice(data.enigmaSouls.indexOf(closest[0]), 1);
}).setCriteria("SOUL! You unlocked an Enigma Soul!"), () => location.getWorld() === "The Rift");

/**
 * Fail safe enigma soul remove in case player clicks on an unregistered soul.
 */
registerWhen(register("chat", () => {
    if (data.enigmaSouls.length === 0) return;

    // Delete duplicate soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], data.enigmaSouls);
    if (closest !== undefined && closest[1] < 5) data.enigmaSouls.splice(data.enigmaSouls.indexOf(closest[0]), 1);
}).setCriteria("You have already found that Enigma Soul!"), () => location.getWorld() === "The Rift");

/**
 * Updates enigma soul array closer than set threshold to player.
 */
registerWhen(register("step", () => {
    // Filters to closest souls
    enigmaClose = data.enigmaSouls.filter((enigma) => Math.hypot(Player.getX() - enigma[0], Player.getZ() - enigma[2]) < settings.enigmaWaypoint);
}).setFps(1), () => location.getWorld() === "The Rift" && settings.enigmaWaypoint !== 0);

/**
 * Removes closest Montezuma soul piece when player finds one.
 */
registerWhen(register("chat", () => {
    // Delete closest soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], data.catSouls);
    if (closest !== undefined)
        data.catSouls.splice(data.catSouls.indexOf(closest[0]), 1);
}).setCriteria("You found a piece of Montezuma's soul!"), () => location.getWorld() === "The Rift");

/**
 * Fail safe Montzuma soul piece remove in case player clicks on an unregistered soul.
 */
registerWhen(register("chat", () => {
    if (!data.catSouls.length) return;

    // Delete duplicate soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], data.catSouls);
    if (closest[1] < 5)
        data.catSouls.splice(data.catSouls.indexOf(closest[0]), 1);
}).setCriteria("You have already found this Montezuma soul piece!"), () => location.getWorld() === "The Rift");


/**
 * Variables used to reprsent and track the 6 effigies.
 */
const EFFIGIES = [
    ["1st Effigy", 151, 73, 96], ["2nd Effigy", 194, 87, 120], ["3rd Effigy", 236, 104, 148],
    ["4th Effigy", 294, 90, 135], ["5th Effigy", 263, 93, 95], ["6th Effigy", 241, 123, 119]
];
const missingEffigies = new Waypoint([0.75, 0.75, 0.75]);  // Silver effigies

/**
 * Tracks missing effigies and makes a waypoint to them.
 */
registerWhen(register("step", () => {
    missingEffigies.clear();
    let effigies = Scoreboard?.getLines()?.find((line) => line.getName().includes("Effigies"));
    if (effigies === undefined) return;

    effigies = effigies.getName().replace(/[^§7⧯]/g,'').split("§");
    effigies.shift();
    effigies.forEach((effigy, i) => { 
        if (effigy.includes('7')) missingEffigies.push(EFFIGIES[i]);
    });
}).setFps(1), () => location.getWorld() === "The Rift" && settings.effigyWaypoint);
