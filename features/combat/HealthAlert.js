import settings from "../../settings";
import { BOLD, DARK_RED, RESET } from "../../utils/constants";
import { registerWhen } from "../../utils/variables";


/**
 * Variable used to represent player entity.
 */
let player = undefined;

/**
 * Tracks player health and alerts whenever below the chosen threshold.
 */
registerWhen(register("step", () => {
    if (player == undefined) return;

    if (player.func_110143_aJ() / player.func_110138_aP() < settings.healthAlert) {
        Client.Companion.showTitle(`${DARK_RED}${BOLD}WARNING: HEALTH BELOW ${RESET}${Math.round(settings.healthAlert * 100)}%${DARK_RED}!`, "", 0, 25, 5);
    }
}).setFps(2), () => settings.healthAlert);

/**
 * Reload player entity on every world join.
 */
export function setPlayer() {
    player = Player.asPlayerMP().getEntity();
};
