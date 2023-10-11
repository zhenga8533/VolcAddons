import renderBeaconBeam from "../../BeaconBeam";
import RenderLib from "../../RenderLib/index.js";
import settings from "./settings";
import { getBurrow, getTheory } from "../features/hub/DianaWaypoint";
import { getBuilds, getCrates } from "../features/kuudra/KuudraCrates";
import { getCat, getEffigies, getEnigma, getNPCs, getZones } from "../features/rift/RiftWaypoints";
import { getChatWaypoints, getUserWaypoints } from "../features/general/UserWaypoints";
import { getPowderChests } from "../features/mining/PowderChest";
import { data } from "./variables";


/**
 * Variables used to organize and render waypoints.
 */
let formattedWaypoints = [];

/**
 * Functions to format waypoints into the above variables to reduce renderOverlay load.
 */
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
        xSign = x === 0 ? 1 : Math.sign(x);
        zSign = z === 0 ? 1 : Math.sign(z);
        wp[0] = [`${waypoint[0]} §b[${distance}]`, x + 0.5*xSign, y - 1, z + 0.5*zSign];

        // Aligns the beam correctly based on which quadrant it is in
        if (xSign === 1) xSign = 0;
        if (zSign === 1) zSign = 0;
        wp[1] = [x + xSign, y - 1, z + zSign];

        /* Return Matrix
           [message, x, y ,z]
           [beacon x, y, z]
           [r, g, b]
        */
        formattedWaypoints.push(wp);
    });
}
register("tick", () => {
    formattedWaypoints = [];
    formatWaypoints(getChatWaypoints(), 0, 1, 1); // Cyan Waypoint
    formatWaypoints(getUserWaypoints(), 0, 1, 0); // Lime user
    formatWaypoints(getTheory(), 1, 1, 0); // Yellow diana theory burrow
    formatWaypoints(getBurrow(), 0, 0.5, 0); // Green burrows
    formatWaypoints(getNPCs(), 0, 0.2, 0.4); // Navy NPC
    formatWaypoints(getZones(), 0, 0.5, 0.5); // Teal zone
    formatWaypoints(getEffigies(), 0.75, 0.75, 0.75) // Silver effigies
});

/**
 * Various render functions for different types of waypoints (i.e. entities or blocks).
 */
function renderSimple(waypoints, r, g, b, beacon) {
    if (!waypoints.length) return;

    waypoints.forEach(waypoint => {
        x = waypoint[1];
        y = waypoint[2];
        z = waypoint[3];
    
        RenderLib.drawEspBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 1, true);
        RenderLib.drawInnerEspBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 0.25, true);
        if (beacon) renderBeaconBeam(x, y, z, r, g, b, 0.5, false);
    });
}
function renderSimpler(entities, r, g, b) {
    if (!entities.length) return;

    entities.forEach(entity => {
        x = entity.getX();
        y = entity.getY();
        z = entity.getZ();
    
        RenderLib.drawEspBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 1, data.vision);
        RenderLib.drawInnerEspBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 0.25, data.vision);
    });
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

    waypoints.forEach((waypoint) => renderBeaconBeam(waypoint[0], waypoint[1], waypoint[2], waypoint[3], waypoint[4], waypoint[5], 0.5, false) );
}
/**
 * 
 * @param {Array} entities - list of entities to draw hitboxes around
 * @param {number} r - 0-1 red value
 * @param {number} g - 0-1 green value
 * @param {number} b - 0-1 blue value
 */
export function renderEntities(entities, r, g, b, pt, title) {
    entities.forEach(entity => {
        entity = entity?.getEntity() ?? entity;
        const x = entity.field_70165_t * pt - entity.field_70142_S * (pt - 1);
        const y = entity.field_70163_u * pt - entity.field_70137_T * (pt - 1);
        const z = entity.field_70161_v * pt - entity.field_70136_U * (pt - 1);
        const width = entity.field_70130_N;
        const height =  entity.field_70131_O;

        RenderLib.drawEspBox(x, y, z, width, height, r, g, b, 1, data.vision);
        RenderLib.drawInnerEspBox(x, y, z, width, height, r, g, b, settings.hitboxColor.alpha/510, data.vision);
        if (title !== undefined && data.vision)
            Tessellator.drawString(`${title} §7[§b${Player.asPlayerMP().distanceTo(entity).toFixed(0)}m§7]`,x, y + height + 1, z, 0xffffff, true);
    });
}
/**
 * 
 * @param {Array} stands - list of entities to draw hitboxes around
 * @param {number} r - 0-1 red value
 * @param {number} g - 0-1 green value
 * @param {number} b - 0-1 blue value
 */
export function renderStands(stands, r, g, b) {
    stands.forEach(stand => {
        stand = stand.getEntity() ?? stand;
        const x = stand.field_70142_S;
        const y = stand.field_70137_T;
        const z = stand.field_70136_U;
        
        RenderLib.drawEspBox(x, y, z, 1, 2, r, g, b, 1, data.vision);
        RenderLib.drawInnerEspBox(x, y, z, 1, 2, r, g, b, 0.25, data.vision);
    });
}

// Registering renderWorld event to render the waypoints and other entities
register("renderWorld", () => {
    renderWaypoint(formattedWaypoints);
    renderBeam(getCrates()); // White Crates
    renderBeam(getBuilds()); // Red Builds
    renderSimple(getEnigma(), 0.5, 0, 0.5, true); // Purple Enigma
    renderSimple(getCat(), 0, 0, 1, true); // Blue Cat
    renderSimpler(getPowderChests(), 1, 0, 1); // Magenta Powder
});


/**
 * Hitbox rendering stuff
 */
const hitboxes = [];

export class Hitbox {
    constructor(condition, render) {
        this.condition = condition;
        this.render = render;
        hitboxes.push(this);
    }
}

register("renderWorld", (pt) => {
    hitboxes.forEach(hitbox => {
        if (hitbox.condition()) hitbox.render(pt);
    });
});
