import settings from "../../settings";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Check entity distance to player. Hide if too close.
 * 
 * @param {Entity} entity - The entity being checked.
 * @param {Position} pos - The entity's position.
 * @param {number} tick - The current tick.
 * @param {Event} event - The event being handled.
 */
registerWhen(register("renderEntity", (entity, pos, tick, event) => {
    if (entity.distanceTo(Player.asPlayerMP()) < settings.hideEntity) return;
    cancel(event);
}), () => settings.hideEntity !== 0 && (settings.hideWorlds === "" || settings.hideWorlds.split(", ").includes(getWorld())));
