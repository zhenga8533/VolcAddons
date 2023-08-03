import settings from "../../settings";
import { AQUA, GREEN, LOGO, RED } from "../../utils/constants";
import { getClosest } from "../../utils/functions";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Variables used to represent soul waypoints.
 */
let enigmaClose = data.enigmaSouls;
export function getEnigma() { return settings.enigmaWaypoint && getWorld() === "The Rift" ? enigmaClose : [] };
export function getCat() { return settings.catWaypoint && getWorld() === "The Rift" ? data.catSouls : [] };

/**
 * Removes closest enigma soul to player once one is unlocked.
 */
registerWhen(register("chat", () => {
    // Delete closest soul
    const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], data.enigmaSouls);
    if (closest != undefined)
        data.enigmaSouls.splice(data.enigmaSouls.indexOf(closest[0]), 1);
}).setCriteria("SOUL! You unlocked an Enigma Soul!"), () => getWorld() === "The Rift");

/**
 * Fail safe enigma soul remove in case player clicks on an unregistered soul.
 */
registerWhen(register("chat", () => {
    if (!data.enigmaSouls.length) return;

    // Delete duplicate soul
    const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], data.enigmaSouls);
    if (closest[1] < 5)
        data.enigmaSouls.splice(data.enigmaSouls.indexOf(closest[0]), 1);
}).setCriteria("You have already found that Enigma Soul!"), () => getWorld() === "The Rift");

/**
 * Updates enigma soul array closer than set threshold to player.
 */
registerWhen(register("step", () => {
    // Filters to closest souls
    enigmaClose = data.enigmaSouls.filter((enigma) => Math.hypot(Player.getX() - enigma[1], Player.getZ() - enigma[3]) < settings.enigmaWaypoint);
}).setFps(1), () => getWorld() === "The Rift" && settings.enigmaWaypoint);

/**
 * Removes closest Montezuma soul piece when player finds one.
 */
registerWhen(register("chat", () => {
    // Delete closest soul
    const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], data.catSouls);
    if (closest != undefined)
        data.catSouls.splice(data.catSouls.indexOf(closest[0]), 1);
}).setCriteria("You found a piece of Montezuma's soul!"), () => getWorld() === "The Rift");

/**
 * Fail safe Montzuma soul piece remove in case player clicks on an unregistered soul.
 */
registerWhen(register("chat", () => {
    if (!data.catSouls.length) return;

    // Delete duplicate soul
    const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], data.catSouls);
    if (closest[1] < 5)
        data.catSouls.splice(data.catSouls.indexOf(closest[0]), 1);
}).setCriteria("You have already found this Montezuma soul piece!"), () => getWorld() === "The Rift");


/**
 * Variables used to represent rift waypoints.
 */
let NPCs = [];
export function getNPCs() { return NPCs };
let zones = [];
export function getZones() { return zones };

/**
 * /va edit command to directly change the waypoint arrays.
 * 
 * @param {string[]} args - Array of player input values.
 * @param {string} type - Type of soul (Enigma/Montezuma).
 * @param {string} soul - Name of the soul.
 * @param {Array[]} base - Original array with all waypoints.
 */
export function soulEdit(args, type, soul, base) {
    switch (args[1]) {
        case "reset":
            data[soul] = base;
            ChatLib.chat(`${LOGO} ${GREEN}Succesfully reset ${type} waypoint!`);
            break;
        case "clear":
            data[soul] = [];
            ChatLib.chat(`${LOGO} ${GREEN}Succesfully cleared ${type} waypoint!`);
            break;
        case "pop":
            if (data[soul].length == 0) {
                ChatLib.chat(`${LOGO} ${RED}There are no ${type} souls to pop!`);
                return;
            } 

            const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], data[soul]);
            if (closest != undefined)
                data[soul].splice(data[soul].indexOf(closest[0]), 1);
            ChatLib.chat(`${LOGO} ${GREEN}Succesfully popped closest ${type}!`);
            break;
        default:
            ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va ${type} <reset, clear, pop>!`);
            break;
    }
}

/**
 * /va edit command to directly change the waypoint arrays.
 *
 * @param {string[]} args - Array of player input values.
 * @param {string} type - Type of waypoint (Zone/NPC).
 * @param {Array[]} base - Original array with all waypoints.
 */
export function riftWaypointEdit(args, type, base) {
    const waypoint = type === "npc" ? NPCs : zones;

    if (args[1] === "clear") {
        if (type === "npc") NPCs = [];
        else zones = [];
        ChatLib.chat(`${LOGO} ${GREEN}Succesfully cleared ${type} waypoint!`);
        return;
    }

    args.shift();
    const name = args.join(' ').toLowerCase();
    
    if (name in base) {
        if (!(base[name][0] instanceof String))
            base[name].forEach(coords => { waypoint.push(coords) });
        else
            waypoint.push(base[name]);
        ChatLib.chat(`${LOGO} ${GREEN}Succesfully loaded [${name}] waypoint!`);
    } else {
        ChatLib.chat(`${LOGO} ${RED}${type} [${name}] not found!`);
        ChatLib.chat(`${LOGO} ${AQUA}Remember to enter as /va ${type} <[name], clear>`);
    }
}


/**
 * Variables used to reprsent and track the 6 effigies.
 */
const EFFIGIES = [
    ["1st Effigy", 150, 73, 95], ["2nd Effigy", 193, 87, 119], ["3rd Effigy", 235, 103, 147],
    ["4th Effigy", 293, 90, 134], ["5th Effigy", 262, 93, 94], ["6th Effigy", 240, 123, 118]
];
let missingEffigies = [];

/**
 * Tracks missing effigies and makes a waypoint to them.
 */
export function getEffigies() { return missingEffigies };
registerWhen(register("step", () => {
    missingEffigies = [];
    let effigies = Scoreboard.getLines().find((line) => line.getName().includes("Effigies"));
    if (effigies === undefined) return;

    effigies = effigies.getName().replace(/[^§7⧯]/g,'').split("§");
    effigies.shift();
    effigies.forEach((effigy, i) => { if (effigy.includes('7')) missingEffigies.push(EFFIGIES[i]) });
}).setFps(1), () => getWorld() === "The Rift" && settings.effigyWaypoint);
