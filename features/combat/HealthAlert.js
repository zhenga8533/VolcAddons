import { BOLD, DARK_RED, RESET } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";

/**
 * Variable used to represent player entity.
 */
let player = undefined;

/**
 * Tracks player health and alerts whenever below the chosen threshold.
 */
registerWhen(
  register("step", () => {
    if (player === undefined) return;

    if (player.func_110143_aJ() / player.func_110138_aP() < Settings.healthAlert)
      setTitle(
        `${DARK_RED + BOLD}WARNING: HEALTH BELOW ${RESET + Math.round(Settings.healthAlert * 100)}%${DARK_RED}!`,
        "",
        0,
        25,
        5,
        10
      );
  }).setFps(2),
  () => Settings.healthAlert !== 0
);

/**
 * Reload player entity on every world join.
 */
export function setPlayer() {
  player = Player.asPlayerMP().getEntity();
}
