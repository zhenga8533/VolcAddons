import RenderLib from "../../../RenderLib";
import { AQUA, PLAYER_CLASS } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";
import Waypoint from "../../utils/Waypoint";
import { isPlayer } from "../../utils/functions/player";

/**
 * Register hitbox rendering
 */
const nearWaypoints = new Waypoint([0.41, 0.76, 0.96], 3, true, false, false);

const remderWorld = register("renderWorld", (pt) => {
  const entity = Player.asPlayerMP().getEntity();
  const x = entity.field_70165_t * pt - entity.field_70142_S * (pt - 1);
  const y = entity.field_70163_u * pt - entity.field_70137_T * (pt - 1);
  const z = entity.field_70161_v * pt - entity.field_70136_U * (pt - 1);
  RenderLib.drawSphere(x, y + 1, z, 5, 20, 20, -90, 0, 0, 1, 1, 0, 0.5, false, false);
}).unregister();

/**
 * Updates nearby players
 */
registerWhen(
  register("step", () => {
    nearWaypoints.clear();
    const heldName = Player.getHeldItem()?.getName();

    // Check if player is holding a mana draining item
    const render =
      heldName !== undefined && (heldName.includes("flux Power Orb") || heldName.endsWith("End Stone Sword"));
    if (render) {
      remderWorld.register();
    } else {
      remderWorld.unregister();
      return;
    }

    // Add waypoints for nearby players
    const player = Player.asPlayerMP();
    World.getAllEntitiesOfType(PLAYER_CLASS).forEach((other) => {
      if (isPlayer(other) && player.distanceTo(other) < 5) nearWaypoints.push(["", other]);
    });

    // Show title
    const length = nearWaypoints.getWaypoints().length;
    setTitle(`${length + AQUA} nearby player${length === 1 ? "" : "s"}!`, "", 0, 15, 5, 50);
  }).setFps(2),
  () => Settings.manaDrain
);
