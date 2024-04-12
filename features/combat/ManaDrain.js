import RenderLib from "../../../RenderLib";
import settings from "../../utils/settings";
import { AQUA, PLAYER_CLASS } from "../../utils/constants";
import { registerWhen } from "../../utils/variables";
import { Hitbox, renderEntities } from "../../utils/waypoints";


/**
 * Register hitbox rendering
 */
let nearby = [];
let render = false;
new Hitbox(() => settings.manaDrain, (pt) => {
    // Mana Blue Hitboxes
    renderEntities(nearby, 0.408, 0.76, 0.96, pt);
});

registerWhen(register("renderOverlay", () => {
    if (!render) return;

    Client.showTitle(`${nearby.length + AQUA} nearby ${nearby.length === 1 ? "player" : "players"}!`, "", 0, 5, 1);
}), () => settings.manaDrain);

registerWhen(register("renderWorld", (pt) => {
    if (!render) return;

    const entity = Player.asPlayerMP().getEntity();
    const x = entity.field_70165_t * pt - entity.field_70142_S * (pt - 1);
    const y = entity.field_70163_u * pt - entity.field_70137_T * (pt - 1);
    const z = entity.field_70161_v * pt - entity.field_70136_U * (pt - 1);
    RenderLib.drawSphere(x, y + 1, z, 5, 20, 20, -90, 0, 0, 1, 1, 0, 0.5, false, false);
}), () => settings.manaDrain);

/**
 * Updates nearby players
 */
registerWhen(register("step", () => {
    const heldName = Player.getHeldItem()?.getName();
    render = heldName !== undefined && (heldName.includes("flux Power Orb") || heldName.endsWith("End Stone Sword"))
    if (!render) {
        nearby = [];
        return;
    }

    const player = Player.asPlayerMP();
    nearby = World.getAllEntitiesOfType(PLAYER_CLASS).filter(other => other.getEntity().func_110143_aJ() !== 20 && player.distanceTo(other) < 5);
}).setFps(2), () => settings.manaDrain);
