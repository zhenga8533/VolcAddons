import settings from "../../settings";
import { BOLD, DARK_RED, GRAY, RED, RESET } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";

let tuba = 0;
let cd = 0;
let alerted = false;

const tubaExample = `${GRAY}${BOLD}Tuba Timer: ${RESET}Scooby Snack`;
const tubaOverlay = new Overlay("tubaTimer", ["rift"], data.UL, "moveTubaTimer", tubaExample);

// Detect Cells tubament
registerWhen(register("clicked", (x, y, button, state) => {
    if (Player.getHeldItem() == null || !button || !state || cd > 0) return;

    heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");
    if (heldItem == "WEIRD_TUBA") {
        tuba = 20;
        cd = 20;
        alerted = false;
    } else if (heldItem == "WEIRDER_TUBA") {
        tuba = 30;
        cd = 20;
        alerted = false;
    }
}), () => data.world == "rift" && (settings.tubaTimer || settings.tubaAlert));

registerWhen(register("tick", () => {
    if (cd > 0) cd = (cd - 0.05).toFixed(2);
    if (tuba > 0) {
        if (settings.tubaAlert && !alerted && cd == 0) {
            Client.Companion.showTitle(`${DARK_RED}${BOLD}USE TUBA`, "", 0, 25, 5);
            alerted = true;
        }
        tuba = (tuba - 0.05).toFixed(2);
        tubaOverlay.message = `${GRAY}${BOLD}Tuba Timer: ${RESET}${tuba}s`;
    } else tubaOverlay.message = `${GRAY}${BOLD}Tuba Timer: ${RED}NO TUBA`;
}), () => data.world == "rift" && (settings.tubaTimer || settings.tubaAlert));
