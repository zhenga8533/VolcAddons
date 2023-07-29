// Importing functions from different files
import { getBurrow, getTheory } from "../features/hub/DianaWaypoint"; // Importing functions for DianaWaypoint
import { getBuilds, getCrates } from "../features/kuudra/KuudraCrates"; // Importing functions for KuudraCrates
import { getInquisitors, getVanquishers } from "../features/misc/AnnouceMob"; // Importing functions for AnnouceMob
import { getCat, getEffigies, getEnigma, getNPCs, getZones } from "../features/rift/RiftWaypoints"; // Importing functions for RiftWaypoints
import { getChatWaypoints, getUserWaypoints } from "../features/general/UserWaypoints"; // Importing functions for UserWaypoints

// Importing render functions from other files
import renderBeaconBeam from "../../BeaconBeam"; // Importing function for rendering beacon beams
import RenderLib from "../../RenderLib/index.js"; // Importing RenderLib for rendering in the world
import { getVamps } from "../features/rift/VampireSlayer"; // Importing functions for VampireSlayer


// General Waypoints
let formatted = [];

// Function to format waypoints for rendering
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
            z = Player.getZ() + (z - Player.getZ()) * (100 / distance);
        }

        // Formats and realigns everything
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

// Registering tick event to update and format the waypoints
register("tick", () => {
    formatted = [];
    formatWaypoints(getChatWaypoints(), 0, 1, 1); // Cyan Waypoint
    formatWaypoints(getUserWaypoints(), 0, 1, 0); // Lime user
    formatWaypoints(getTheory(), 1, 1, 0); // Yellow diana theory burrow
    formatWaypoints(getBurrow(), 0, 0.5, 0); // Green burrows
    formatWaypoints(getNPCs(), 0, 0.2, 0.4); // Navy NPC
    formatWaypoints(getZones(), 0, 0.5, 0.5); // Teal zone
    formatWaypoints(getEffigies(), 0.75, 0.75, 0.75) // Silver effigies
});

// Registering renderWorld event to render the waypoints and other entities
register("renderWorld", () => {
    renderWaypoint(formatted);
    renderBeam(getCrates()); // White Crates
    renderBeam(getBuilds()); // Red Builds
    renderEntities(getVanquishers(), "Vanquisher", 0.5, 0, 0.5); // Purple vanq
    renderEntities(getInquisitors(), "Minos Inquisitor", 1, 0.84, 0) // Gold inq
    renderStands(getVamps(), "Medium Rare", 1, 0, 0); // Red Vamps
    renderSimple(getEnigma(), 0.5, 0, 0.5); // Purple enigma
    renderSimple(getCat(), 0, 0, 1); // Blue enigma
});

// Helper function to render simple waypoints
function renderSimple(waypoints, r, g, b) {
    if (!waypoints.length) return;

    waypoints.forEach((waypoint) => {
        x = waypoint[1];
        y = waypoint[2];
        z = waypoint[3];
    
        RenderLib.drawEspBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 1, true);
        RenderLib.drawInnerEspBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 0.25, true);
        renderBeaconBeam(x, y, z, r, g, b, 0.5, false);
    });
}

// Helper function to render waypoint with beams
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

// Helper function to render beacon beams
function renderBeam(waypoints) {
    if (!waypoints.length) return;

    waypoints.forEach((waypoint) => renderBeaconBeam(waypoint[0], waypoint[1], waypoint[2], waypoint[3], waypoint[4], waypoint[5], 0.5, false) );
}

// Helper function to render entities (mobs)
function renderEntities(entities, title, r, g, b) {
    if (!entities.length) return;

    entities.forEach(entity => {
        let x = entity.getX();
        let y = entity.getY();
        let z = entity.getZ();
        let width = entity.getWidth();
        let height = entity.getHeight();

        distance = Math.hypot(Player.getX() - x, Player.getY() - y, Player.getZ() - z).toFixed(0) + "m";
        Tessellator.drawString(`${title} §b[${distance}]`, x, y + height + 0.5, z, 0xffffff, true);
        RenderLib.drawEspBox(x, y, z, width, height, r, g, b, 1, true);
        RenderLib.drawInnerEspBox(x, y, z, width, height, r, g, b, 0.25, true);
    });
}

// Helper function to render stands (npcs)
function renderStands(stands, title, r, g, b) {
    if (!stands.length) return;

    stands.forEach(stand => {
        let x = stand.getX();
        let y = stand.getY() - 2;
        let z = stand.getZ();

        distance = Math.hypot(Player.getX() - x, Player.getY() - y, Player.getZ() - z).toFixed(0) + "m";
        Tessellator.drawString(`${title} §b[${distance}]`, x, y + 3.5, z, 0xffffff, false);
        RenderLib.drawEspBox(x, y, z, 1, 2, r, g, b, 1, true);
        RenderLib.drawInnerEspBox(x, y, z, 1, 2, r, g, b, 0.25, true);
    });
}
