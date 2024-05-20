import renderBeaconBeam from "../../BeaconBeam";
import RenderLib from "../../RenderLib/index";
import settings from "./settings";
import { data } from "./data";


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
