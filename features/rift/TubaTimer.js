import settings from "../../settings";
import { BOLD, DARK_RED, GRAY, RED, RESET } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Variables used to track and display tuba timer.
 */
let tuba = 0;
let type = false;
let cd = 0;
let alerted = false;
const tubaExample = `${GRAY}${BOLD}Tuba Timer: ${RESET}Scooby Snack`;
const tubaOverlay = new Overlay("tubaTimer", ["The Rift"], data.UL, "moveTubaTimer", tubaExample);

/**
 * Tracks action bar for Howl ability and resets tuba timer.
 */
registerWhen(register("actionBar", () => {
    if (cd > 0) return;

    if (type === "WEIRD_TUBA") tuba = 19.8;
    else if (type === "WEIRDER_TUBA") tuba = 29.8;
    cd = 19.8;
    alerted = false;
}).setCriteria("${before}-${x} Mana (Howl)${after}"), () => getWorld() === "The Rift" && (settings.tubaTimer || settings.tubaAlert));

/**
 * Updates tuba overlay every tick and alerst player when ability can be used again.
 */
registerWhen(register("tick", () => {
    // Check Tuba type
    if (!type && Player.getHeldItem() != null) {
        const heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");
        if (heldItem.includes("TUBA")) type = heldItem;
    }

    // Tuba Countdown
    if (cd > 0) cd = (cd - 0.05).toFixed(2);
    if (tuba > 0) {
        if (settings.tubaAlert && !alerted && cd == 0) {
            Client.Companion.showTitle(`${DARK_RED}${BOLD}USE TUBA`, "", 0, 25, 5);
            alerted = true;
        }
        tuba = (tuba - 0.05).toFixed(2);
        tubaOverlay.message = `${GRAY}${BOLD}Tuba Timer: ${RESET}${tuba}s`;
    } else tubaOverlay.message = `${GRAY}${BOLD}Tuba Timer: ${RED}NO TUBA`;
}), () => getWorld() === "The Rift" && (settings.tubaTimer || settings.tubaAlert));
