import settings from "../../settings";
import { AQUA, ENIGMA_SOULS, GREEN, LOGO, RED, RIFT_NPCS, ZONES } from "../../utils/constants";
import { getClosest } from "../../utils/functions";
import { data, registerWhen } from "../../utils/variables";

// Rift Waypoint
let enigmaClose = data.enigmaSouls;
export function getEnigma() { return enigmaClose };
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
    if (data.world != "rift") return;

    // Filters to closest souls
    enigmaClose = data.enigmaSouls.filter((enigma) => Math.hypot(Player.getX() - enigma[1], Player.getZ() - enigma[3]) < settings.enigmaWaypoint);
}).setFps(1), () => data.world == "rift" && settings.enigmaWaypoint);

export function enigmaEdit(args) {
    switch (args[1]) {
        case "reset":
            data.enigmaSouls = ENIGMA_SOULS;
            ChatLib.chat(`${LOGO} ${GREEN}Succesfully reset enigma waypoint!`);
            break;
        case "clear":
            data.enigmaSouls = [];
            ChatLib.chat(`${LOGO} ${GREEN}Succesfully cleared enigma waypoint!`);
            break;
        case "pop":
            const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], data.enigmaSouls);
            if (closest != undefined)
                data.enigmaSouls.splice(data.enigmaSouls.indexOf(closest[0]), 1);
            ChatLib.chat(`${LOGO} ${GREEN}Succesfully popped closest enigma!`);
            break;
        default:
            ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va enigma <reset, clear, pop>!`);
            break;
    }
}

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