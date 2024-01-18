import { AQUA, PLAYER_CLASS } from "../../utils/constants";
import settings from "../../utils/settings";
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
