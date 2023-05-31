import { AMOGUS, BOLD, DARK_RED, RESET } from "../utils/constants";
import settings from "../settings";

let player = undefined;
let soundCD = false;

register("tick", () => {
    if (player == undefined) return;

    if (player.func_110143_aJ() / player.func_110138_aP() < settings.healthAlert) {
        Client.Companion.showTitle(`${DARK_RED}${BOLD}WARNING: HEALTH BELOW ${RESET}${Math.round(settings.healthAlert * 100)}%${DARK_RED}!`, "", 0, 25, 5);
        if (!soundCD) {
            AMOGUS.play();
            soundCD = true;
            setTimeout(() => { soundCD = false }, 10000);
        }
    }
})

register("worldLoad", () => {
    setTimeout(() => { player = Player.asPlayerMP().getEntity() }, 6900);
})