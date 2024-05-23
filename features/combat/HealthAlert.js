import Settings from "../../utils/Settings";
import { BOLD, DARK_RED, RESET } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";


/**
 * Variable used to represent player entity.
 */
let player = undefined;

/**
 * Tracks player health and alerts whenever below the chosen threshold.
 */
registerWhen(register("step", () => {
    if (player === undefined) return;

    if (player.func_110143_aJ() / player.func_110138_aP() < Settings.healthAlert) {
        Client.showTitle(`${DARK_RED + BOLD}WARNING: HEALTH BELOW ${RESET + Math.round(Settings.healthAlert * 100)}%${DARK_RED}!`, "", 0, 25, 5);
    }
}).setFps(2), () => Settings.healthAlert !== 0);

/**
 * Reload player entity on every world join.
 */
export function setPlayer() {
    player = Player.asPlayerMP().getEntity();
};
