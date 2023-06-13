import settings from "../../settings";
import RenderLib from "../../../RenderLib/index.js";
import renderBeaconBeam from "../../../BeaconBeam";
import { AQUA, ENIGMA_SOULS, GREEN, LOGO, RED, RIFT_NPCS, ZONES } from "../../utils/constants";

import { getBuilds, getCrates } from "../kuudra/KuudraCrates";
import { getVanquishers } from "../misc/AnnouceMob";
import { getBurrow, getTheory } from "../hub/DianaWaypoint";
import { getInquisitors } from "../misc/AnnouceMob";
import { data, getWorld, registerWhen } from "../../utils/variables";
import { getClosest } from "../../utils/functions";

// General Waypoints
let chatWaypoints = [];
let userWaypoints = [];
let formatted = [];

// Rift Waypoint
let enigmaClose = data.enigmaSouls;
let NPCs = [];
let zones = [];

// What actually does the waypoint rendering
register("renderWorld", () => {
    renderWaypoint(formatted);

    renderEntities(getVanquishers(), "Vanquisher", 0.5, 0, 0.5); // Purple vanq
    renderEntities(getInquisitors(), "Minos Inquisitor", 1, 0.84, 0) // Gold inq
    if (settings.enigmaWaypoint && getWorld() == "rift")
        renderSimple(enigmaClose, 0.5, 0, 0.5); // Purple enigma
});

function formatWaypoints(waypoints, r, g, b) {
    if (!waypoints.length) return;
    let x, y, z, distance, xSign, zSign = 0;

    waypoints.forEach((waypoint) => {
        wp = [["", 0, 0, 0], [0, 0, 0], [r, g, b]];
        x = Math.round(waypoint[1]);
        y = Math.round(waypoint[2]);
        z = Math.round(waypoint[3]);
        distance = Math.hypot(Player.getX() - x, Player.getY() - y, Player.getZ() - z);

        // Makes it so waypoint always renders
        if (distance >= 100) {
            x = Player.getX() + (x - Player.getX()) * (100 / distance);
            y = Player.getY() + (y - Player.getY()) * (100 / distance);
            z = Player.getZ() + (z - Player.getZ()) * (100 / distance);
        }

        // Formats and realins everything
        distance = Math.round(distance) + "m";
        xSign = x == 0 ? 1 : Math.sign(x);
        zSign = z == 0 ? 1 : Math.sign(z);
        wp[0] = [`${waypoint[0]} §b[${distance}]`, x + 0.5*xSign, y - 1, z + 0.5*zSign];

        // Aligns the beam correctly based on which quadrant it is in
        if (xSign == 1) xSign = 0;
        if (zSign == 1) zSign = 0;
        wp[1] = [x + xSign, y - 1, z + zSign];

        /* Return Matrix
           [message, x, y ,z]
           [beacon x, y, z]
           [r, g, b]
        */
        formatted.push(wp);
    });
}

register("step", () => {
    formatted = [];
    formatWaypoints(chatWaypoints, 0, 1, 1); // Cyan Waypoint
    formatWaypoints(userWaypoints, 0, 1, 0); // Lime user
    formatWaypoints(getCrates(), 1, 1, 1); // White crates
    formatWaypoints(getBuilds(), 1, 0, 0); // Red Builds
    formatWaypoints(getTheory(), 1, 1, 0); // Yellow theory burrow
    formatWaypoints(getBurrow(), 0, 0.5, 0); // Green burrows
    formatWaypoints(NPCs, 0, 0.2, 0.4); // Navy NPC
    formatWaypoints(zones, 0, 0.5, 0.5); // Teal zone
}).setFps(5);

function renderSimple(waypoints, r, g, b) {
    if (!waypoints.length) return;

    waypoints.forEach((waypoint) => {
        x = waypoint[1];
        y = waypoint[2];
        z = waypoint[3];
    
        RenderLib.drawEspBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 1, true)
        RenderLib.drawInnerEspBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 0.25, true);
        renderBeaconBeam(x, y, z, r, g, b, 0.5, false);
    })
}

function renderWaypoint(waypoints) {
    if (!waypoints.length) return;

    waypoints.forEach((waypoint) => {
        box = waypoint[0];
        beam = waypoint[1];
        rgb = waypoint[2];
    
        RenderLib.drawEspBox(box[1], box[2], box[3], 1, 1, rgb[0], rgb[1], rgb[2], 1, true);
        RenderLib.drawInnerEspBox(box[1], box[2], box[3], 1, 1, rgb[0], rgb[1], rgb[2], 0.25, true);
        Tessellator.drawString(box[0], box[1], box[2] + 1.5, box[3], 0xffffff, true);
        renderBeaconBeam(beam[0], beam[1], beam[2], rgb[0], rgb[1], rgb[2], 0.5, false);
    });
}

function renderEntities(entities, title, r, g, b) {
    if (!entities.length) return;

    entities.forEach(entity => {
        x = entity.getX();
        y = entity.getY();
        z = entity.getZ();
        width = entity.getWidth();
        height = entity.getHeight();

        distance = Math.hypot(Player.getX() - x, Player.getY() - y, Player.getZ() - z).toFixed(0) + "m";
        Tessellator.drawString(`${title} §b[${distance}]`, x, y + height + 0.5, z, 0xffffff, true);
        RenderLib.drawEspBox(x, y, z, width, height, r, g, b, 1, true);
    });
}

// Detects coords
registerWhen(register("chat", (player, spacing, x, y, z) => {
    // Gets colors and titles in name
    const bracketIndex = player.indexOf('[') - 2;
    if (bracketIndex >= 0)
        player = player.replaceAll('&', '§').substring(bracketIndex, player.length);
    else
        player = player.replaceAll('&', '§');

    // Remove anything after z coords
    const spaceIndex = z.indexOf(' ');
    let time = 1000;
    if (spaceIndex != -1) {
        if (z.includes('|'))
            time /= 3;
        z = z.substring(0, spaceIndex);
    }

    chatWaypoints.push([player, x, y, z]);

    // Delete waypoint after 'X' seconds
    setTimeout(() => {if (chatWaypoints[0][0].equals(player)) chatWaypoints.shift() }, settings.drawWaypoint * time);
}).setCriteria("${player}&f${spacing}x: ${x}, y: ${y}, z: ${z}&r"), () => settings.drawWaypoint);

// Lets user create waypoint
export function createWaypoint(args) {
    if (args[1] == "clear") {
        userWaypoints = [];
        NPCs = [];
        zones = [];
        ChatLib.chat(`${LOGO} ${GREEN}Successfully cleared waypoints!`);
    } else if (!isNaN(args[2]) && !isNaN(args[3]) && !isNaN(args[4])) {
        userWaypoints.push([args[1], args[2], args[3], args[4]]);
        ChatLib.chat(`${GREEN}Successfully added waypoint [${args[1]}] at [x: ${args[2]}, y: ${args[3]}, z: ${args[4]}]!`);
    } else ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va waypoint [name] [x] [y] [z] | /va waypoint clear!`);
}

// Enigma Soul Stuff
registerWhen(register("chat", () => {
    // Delete closest soul
    const closest = getClosest(["Player", Player.getX(), Player.getY(), Player.getZ()], data.enigmaSouls);
    if (closest != undefined);
        data.enigmaSouls.splice(data.enigmaSouls.indexOf(closest[0]), 1);
}).setCriteria("SOUL! You unlocked an Enigma Soul!"), () => getWorld() == "rift");

registerWhen(register("step", () => {
    if (getWorld() != "rift") return;

    // Filters to closest souls
    enigmaClose = data.enigmaSouls.filter((enigma) => Math.hypot(Player.getX() - enigma[1], Player.getZ() - enigma[3]) < settings.enigmaWaypoint);
}).setFps(1), () => getWorld() == "rift" && settings.enigmaWaypoint);

export function enigmaEdit(args) {
    switch (args[1]) {
        case "reset":
            data.enigmaSouls = ENIGMA_SOULS;
            break;
        case "clear":
            data.enigmaSouls = [];
            break;
        default:
            ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va enigma <reset, clear>!`);
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

// Deletes user waypoints on world exit
register("worldUnload", () => {
    userWaypoints = [];
});
