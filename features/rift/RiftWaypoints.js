import settings from "../../settings";
import { AQUA, GREEN, LOGO, RED, RIFT_NPCS, ZONES } from "../../utils/constants";
import { getClosest } from "../../utils/functions";
import { data, registerWhen } from "../../utils/variables";

// Rift Waypoint
let enigmaClose = data.enigmaSouls;
export function getEnigma() { return settings.enigmaWaypoint && data.world == "rift" ? enigmaClose : [] };
export function getCat() { return settings.catWaypoint && data.world == "rift" ? data.catSouls : [] };
let NPCs = [];
export function getNPCs() { return NPCs };
let zones = [];
export function getZones() { return zones };

// Enigma Soul Stuff
registerWhen(register("chat", () => {
    // Delete closest soul
    const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], data.enigmaSouls);
    if (closest != undefined)
        data.enigmaSouls.splice(data.enigmaSouls.indexOf(closest[0]), 1);
}).setCriteria("SOUL! You unlocked an Enigma Soul!"), () => data.world == "rift");

registerWhen(register("chat", () => {
    if (!data.enigmaSouls.length) return;

    // Delete duplicate soul
    const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], data.enigmaSouls);
    if (closest[1] < 5)
        data.enigmaSouls.splice(data.enigmaSouls.indexOf(closest[0]), 1);
}).setCriteria("You have already found that Enigma Soul!"), () => data.world == "rift");

registerWhen(register("step", () => {
    // Filters to closest souls
    enigmaClose = data.enigmaSouls.filter((enigma) => Math.hypot(Player.getX() - enigma[1], Player.getZ() - enigma[3]) < settings.enigmaWaypoint);
}).setFps(1), () => data.world == "rift" && settings.enigmaWaypoint);


// Montezuma Soul Stuff
registerWhen(register("chat", () => {
    // Delete closest soul
    const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], data.catSouls);
    if (closest != undefined)
        data.catSouls.splice(data.catSouls.indexOf(closest[0]), 1);
}).setCriteria("You found a piece of Montezuma's soul!"), () => data.world == "rift");

registerWhen(register("chat", () => {
    if (!data.catSouls.length) return;

    // Delete duplicate soul
    const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], data.catSouls);
    if (closest[1] < 5)
        data.catSouls.splice(data.catSouls.indexOf(closest[0]), 1);
}).setCriteria("You have already found this Montezuma soul piece!"), () => data.world == "rift");


// Edit for Enigma + Cat
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


// NPC + Zones
export function NPCEdit(args) {
    if (args[1] == "clear") {
        NPCs = [];
        ChatLib.chat(`${LOGO} ${GREEN}Succesfully cleared NPC waypoint!`);
        return;
    }

    args.shift()
    const name = args.join(' ').toLowerCase();
    
    if (name in RIFT_NPCS) {
        if (!(RIFT_NPCS[name][0] instanceof String))
            RIFT_NPCS[name].forEach(coords => { NPCs.push(coords) });
        else
            NPCs.push(RIFT_NPCS[name]);
        ChatLib.chat(`${LOGO} ${GREEN}Succesfully loaded [${name}] waypoint!`);
    } else {
        ChatLib.chat(`${LOGO} ${RED}NPC [${name}] not found!`);
        ChatLib.chat(`${LOGO} ${AQUA}Remember to enter as /va npc [name] | /va npc clear`);
    }
}

export function zoneEdit(args) {
    if (args[1] == "clear") {
        zones = [];
        ChatLib.chat(`${LOGO} ${GREEN}Succesfully cleared zone waypoint!`);
        return;
    }

    args.shift()
    const name = args.join(' ').toLowerCase();

    if (name in ZONES) {
        zones.push(ZONES[name]);
        ChatLib.chat(`${LOGO} ${GREEN}Succesfully loaded [${name}] waypoint!`);
    } else {
        ChatLib.chat(`${LOGO} ${RED}Zone [${name}] not found!`);
        ChatLib.chat(`${LOGO} ${AQUA}Remember to enter as /va zone [name] | /va zone clear`);
    }
}


// Effigy Waypoints
const EFFIGIES = [
    ["1st Effigy", 150, 73, 95], ["2nd Effigy", 193, 87, 119], ["3rd Effigy", 235, 103, 147],
    ["4th Effigy", 293, 90, 134], ["5th Effigy", 262, 93, 94], ["6th Effigy", 240, 123, 118]
];
let missingEffigies = [];
export function getEffigies() { return missingEffigies };

registerWhen(register("step", () => {
    missingEffigies = [];
    let effigies = Scoreboard.getLines().find((line) => line.getName().includes("Effigies"));
    if (effigies == undefined) return;

    effigies = effigies.getName().replace(/[^§7⧯]/g,'').split("§");
    effigies.shift();
    effigies.forEach((effigy, i) => { if (effigy.includes('7')) missingEffigies.push(EFFIGIES[i]) });
}).setFps(1), () => data.world == "rift" && settings.effigyWaypoint);
