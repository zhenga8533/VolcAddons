import { AMOGUS, BOLD, GOLD } from "../../utils/constants";
import settings from "../../settings";
import { registerWhen } from "../../utils/variables"

let minutes = 0;

registerWhen(register("step", () => {
    minutes++;
    if (minutes >= settings.reminderTime) {
        Client.Companion.showTitle(`${GOLD}${BOLD}${settings.reminderText}`, "", 10, 50, 10);
        AMOGUS.play();
        minutes = 0;
    }
}).setDelay(60), () => settings.reminderTime);
