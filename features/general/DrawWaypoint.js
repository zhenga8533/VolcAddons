import settings from "../../settings";
import { AQUA, GREEN, LOGO } from "../../utils/constants";
import { getInquisitors, getVanquishers } from "../misc/AnnouceMob";
import { getBurrow, getTheory } from "../hub/DianaWaypoint";
import { getBuilds, getCrates } from "../kuudra/KuudraCrates";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";

import renderBeaconBeam from "../../../BeaconBeam";
import RenderLib from "../../../RenderLib/index.js";
import { getCat, getEffigies, getEnigma, getNPCs, getZones } from "../rift/RiftWaypoints";

// General Waypoints
let chatWaypoints = [];
let userWaypoints = [];
let formatted = [];

// What actually does the waypoint rendering
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
    formatWaypoints(getTheory(), 1, 1, 0); // Yellow theory burrow
    formatWaypoints(getBurrow(), 0, 0.5, 0); // Green burrows
    formatWaypoints(getNPCs(), 0, 0.2, 0.4); // Navy NPC
    formatWaypoints(getZones(), 0, 0.5, 0.5); // Teal zone
    formatWaypoints(getEffigies(), 0.75, 0.75, 0.75) // Silver effigies
}).setFps(4);
register("renderWorld", () => {
    renderWaypoint(formatted);
    renderBeam(getCrates()); // White Crates
    renderBeam(getBuilds()); // Red Builds
    renderEntities(getVanquishers(), "Vanquisher", 0.5, 0, 0.5); // Purple vanq
    renderEntities(getInquisitors(), "Minos Inquisitor", 1, 0.84, 0) // Gold inq
    renderSimple(getEnigma(), 0.5, 0, 0.5); // Purple enigma
    renderSimple(getCat(), 0, 0, 1); // Blue enigma
});


// Different types of rendering
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
function renderBeam(waypoints) {
    if (!waypoints.length) return;

    waypoints.forEach((waypoint) =>renderBeaconBeam(waypoint[0], waypoint[1], waypoint[2], waypoint[3], waypoint[4], waypoint[5], 0.5, false) );
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
    let time = 999;
    if (spaceIndex != -1) {
        if (z.includes('|'))
            time /= 3;
        z = z.substring(0, spaceIndex);
    }
    
    chatWaypoints.push([player, x, y, z]);

    // Delete waypoint after 'X' seconds
    delay(() => { if (chatWaypoints.length) chatWaypoints.shift() }, settings.drawWaypoint * time);
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

// Deletes user waypoints on world exit
register("worldUnload", () => {
    userWaypoints = [];
});
