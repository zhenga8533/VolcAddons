import renderBeaconBeam from "../../BeaconBeam";
import RenderLib from "../../RenderLib/index.js";
import settings from "./settings";
import { getBuilds, getCrates } from "../features/kuudra/KuudraCrates";
import { getCat, getEffigies, getEnigma, getNPCs, getZones } from "../features/rift/RiftWaypoints";
import { getChatWaypoints, getUserWaypoints } from "../features/general/UserWaypoints";
import { getPowderChests } from "../features/mining/PowderChest";
import { data } from "./variables";
import { getBurrows } from "../features/event/BurrowDetect";
import { getGuess } from "../features/event/MythRitual";
import { getCompass } from "../features/mining/WishingCompass";
import { getFairy } from "../features/general/FairySouls.js";


/**
 * Variables used to organize and render waypoints.
 */
let formattedWaypoints = [];

/**
 * Functions to format waypoints into the above variables to reduce renderOverlay load.
 */
function formatWaypoints(waypoints, r, g, b) {
    let x, y, z, distance, xSign, zSign = 0;

    waypoints.forEach((waypoint) => {
        if (waypoint === null) return;
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
    formatWaypoints(getGuess(), 1, 1, 0); // Yellow diana theory burrow
    formatWaypoints(getBurrows(), 0, 0.5, 0); // Green burrows
    formatWaypoints(getNPCs(), 0, 0.2, 0.4); // Navy NPC
    formatWaypoints(getZones(), 0, 0.5, 0.5); // Teal zone
    formatWaypoints(getEffigies(), 0.75, 0.75, 0.75); // Silver effigies
    formatWaypoints(getCompass(), 0.75, 0.17, 0.41); // Bright Purple Compass
});

/**
 * Various render functions for different types of waypoints (i.e. entities or blocks).
 */
function renderSimple(waypoints, r, g, b, beacon) {
    if (!waypoints.length) return;

    waypoints.forEach(waypoint => {
        const n = waypoint.length;
        const x = waypoint[n - 3];
        const y = waypoint[n - 2];
        const z = waypoint[n - 1];
    
        RenderLib.drawEspBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 1, true);
        RenderLib.drawInnerEspBox(x + 0.5, y, z + 0.5, 1, 1, r, g, b, 0.25, true);
        if (beacon) renderBeaconBeam(x, y, z, r, g, b, 0.5, false);
    });
}
function renderSimpler(entities, r, g, b) {
    if (!entities.length) return;

    entities.forEach(entity => {
        const x = entity.getX();
        const y = entity.getY();
        const z = entity.getZ();
    
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
 * @param {Number} r - 0-1 red value
 * @param {Number} g - 0-1 green value
 * @param {Number} b - 0-1 blue value
 */
export function renderEntities(entities, r, g, b, pt, title, fill = true) {
    entities.forEach(entity => {
        entity = entity?.getEntity() ?? entity;
        const x = entity.field_70165_t * pt - entity.field_70142_S * (pt - 1);
        const y = entity.field_70163_u * pt - entity.field_70137_T * (pt - 1);
        const z = entity.field_70161_v * pt - entity.field_70136_U * (pt - 1);
        const width = entity.field_70130_N;
        const height =  entity.field_70131_O;

        RenderLib.drawEspBox(x, y, z, width, height, r, g, b, 1, data.vision);
        if (fill) RenderLib.drawInnerEspBox(x, y, z, width, height, r, g, b, settings.hitboxColor.alpha/510, data.vision);
        if (title !== undefined && data.vision)
            Tessellator.drawString(`${title} §7[§b${Player.asPlayerMP().distanceTo(entity).toFixed(0)}m§7]`,x, y + height + 1, z, 0xffffff, true);
    });
}

// Registering renderWorld event to render the waypoints and other entities
register("renderWorld", () => {
    renderWaypoint(formattedWaypoints);
    renderBeam(getCrates());
    renderBeam(getBuilds());
    renderSimple(getFairy(), 1, 0.08, 0.58, true); // Pink Fairy Souls
    renderSimple(getEnigma(), 0.5, 0, 0.5, true); // Purple Enigma Souls
    renderSimple(getCat(), 0, 0, 1, true); // Blue Montezuma Fragments
    renderSimpler(getPowderChests(), 1, 0, 1); // Magenta Powder Chests
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
