import settings from "../settings";
import RenderLib from "../../RenderLib/index.js";
import renderBeaconBeam from "../../BeaconBeam";
import { AQUA, GREEN } from "../constants";

import { getBuilds, getCrates } from "./KuudraCrates";
import { getVanquishers } from "./AnnouceMob";
import { getBurrow, getTheory } from "./DianaWaypoint";
import { getInquisitors } from "./AnnouceMob";

let waypoints = [];
let userWaypoints = [];

// What actually does the waypoint rendering
register("renderWorld", () => {
    renderWaypoint(waypoints, 0, 1, 1); // Cyan Waypoint
    renderWaypoint(userWaypoints, 0, 1, 0); // Lime user
    renderWaypoint(getCrates(), 1, 1, 1); // White crates
    renderWaypoint(getBuilds(), 1, 0, 0); // Red Builds
    renderWaypoint(getTheory(), 1, 1, 0); // Yellow theory burrow
    renderWaypoint(getBurrow(), 0, 0.5, 0); // Green burrows
    renderEntities(getVanquishers(), "Vanquisher", 0.5, 0, 0.5); // Purple vanq
    renderEntities(getInquisitors(), "Minos Inquisitor", 1, 0.84, 0) // Gold inq
})

function renderWaypoint(waypoints, r, g, b) {
    if (waypoints.length < 1) return;
    let x = 0;
    let y = 0;
    let z = 0;
    let xSign = 0;
    let zSign = 0;
    let distance = 0;

    waypoints.forEach((waypoint) => {
        x = Math.round(waypoint[1]);
        y = Math.round(waypoint[2]);
        z = Math.round(waypoint[3]);

        distance = Math.sqrt(Math.pow(Player.getX() - x, 2) + Math.pow(Player.getY() - y, 2) + Math.pow(Player.getZ() - z, 2));

        // Makes it so waypoint always renders
        if (distance >= 200) {
            x = Player.getX() + (x - Player.getX()) * (100 / distance);
            y = Player.getY() + (y - Player.getY()) * (100 / distance);
            z = Player.getZ() + (z - Player.getZ()) * (100 / distance);
        }

        // Formats and realins everything
        distance = Math.round(distance) + "m";

        xSign = x == 0 ? 1 : Math.sign(x);
        zSign = z == 0 ? 1 : Math.sign(z);

        RenderLib.drawEspBox(x + 0.5 * xSign, y - 1, z + 0.5 * zSign, 1, 1, r, g, b, 1, true)
        RenderLib.drawInnerEspBox(x + 0.5 * xSign, y - 1, z + 0.5 * zSign, 1, 1, r, g, b, 0.25, true);
        Tessellator.drawString(`${waypoint[0]} §b[${distance}]`, x + 0.5 * xSign, y + 0.5, z + 0.5 * zSign, 0xffffff, true);

        // Aligns the beam correctly based on which quadrant it is in
        if (xSign == 1) xSign = 0;
        if (zSign == 1) zSign = 0;

        renderBeaconBeam(x + xSign, y - 1, z + zSign, r, g, b, 0.5, true);
    }) 
}

function renderEntities(entities, title, r, g, b) {
    if (entities.length == 0) return;

    let x = 0;
    let y = 0;
    let z = 0;
    let width = 0;
    let height = 0;
    let distance = 0;

    entities.forEach(entity => {
        x = entity.getX();
        y = entity.getY();
        z = entity.getZ();
        width = entity.getWidth();
        height = entity.getHeight();

        distance = Math.round(Math.sqrt(Math.pow(Player.getX() - x, 2) + Math.pow(Player.getY() - y, 2) + Math.pow(Player.getZ() - z, 2))) + "m";
        Tessellator.drawString(`${title} §b[${distance}]`, x, y + height + 0.5, z, 0xffffff, true);
        RenderLib.drawEspBox(x, y, z, width, height, r, g, b, 1, true);
    });
}

// Detects coords
register("chat", (player, spacing, x, y, z) => {
    if (!settings.drawWaypoint) return;
    
    // Gets colors and titles in name
    const bracketIndex = player.indexOf('[') - 2;
    if (bracketIndex >= 0)
        player = player.replaceAll('&', '§').substring(bracketIndex, player.length);
    else
        player = player.replaceAll('&', '§');

    // Remove anything after z coords
    const spaceIndex = z.indexOf(' ')
    if (spaceIndex != -1)
        z = z.substring(0, spaceIndex);

    waypoints.push([player, x, y, z]);

    // Delete waypoint after 60s
    setTimeout(() => {if (waypoints[0][0].equals(player)) waypoints.shift() }, 60000);
}).setCriteria("${player}&f${spacing}x: ${x}, y: ${y}, z: ${z}&r");

// Lets user create waypoint
export function createWaypoint(args) {
    if (args[1] == "clear") {
        userWaypoints = [];
        ChatLib.chat(`${GREEN}Successfully cleared waypoints!`);
    } else if (!isNaN(args[2]) && !isNaN(args[3]) && !isNaN(args[4])) {
        userWaypoints.push([args[1], args[2], args[3], args[4]]);
        ChatLib.chat(`${GREEN}Successfully added waypoint [${args[1]}] at [x: ${args[2]}, y: ${args[3]}, z: ${args[4]}]!`);
    } else ChatLib.chat(`${AQUA}Please enter as /va waypoint <name> <x> <y> <z> | /va waypoint clear!`);
}

// Deletes user waypoints on world exit
register("worldUnload", () => {
    userWaypoints = [];
});