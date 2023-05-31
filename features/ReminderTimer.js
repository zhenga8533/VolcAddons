import { AMOGUS, BOLD, GOLD } from "../utils/constants";
import settings from "../settings";

let minutes = 0;

register("step", () => {
    if (settings.reminderTime == 0) return;

    minutes++;
    if (minutes >= settings.reminderTime) {
        Client.Companion.showTitle(`${GOLD}${BOLD}${settings.reminderText}`, "", 10, 50, 10);
        AMOGUS.play();
        minutes = 0;
    }
}).setDelay(60);