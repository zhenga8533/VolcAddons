import settings from "../../utils/Settings";
import { AMOGUS, BOLD, GOLD } from "../../utils/Constants";
import { playSound } from "../../utils/functions/misc";
import { registerWhen } from "../../utils/RegisterTils";


/**
 * Variable to represent minutes passed for timer.
 */
let minutes = 0;

/**
 * Counts minutes until set timer to send an customizable alert.
 */
registerWhen(register("step", () => {
    minutes++;
    if (minutes >= settings.reminderTime) {
        Client.showTitle(`${GOLD + BOLD + settings.reminderText}`, "", 10, 50, 10);
        playSound(AMOGUS, 1000);
        minutes = 0;
    }
}).setDelay(60), () => settings.reminderTime !== 0);
