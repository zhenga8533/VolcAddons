import { data, getWorld } from "../utils/variables";
import settings from "../settings"
import { BOLD, DARK_RED, GREEN, RED, RESET } from "../utils/constants";
import { Overlay } from "../utils/overlay";

let align = 0;
let cd = 0;

const gyroExample = `${GREEN}${BOLD}Align Timer: ${RESET}LEAK?!`;
const gyroOverlay = new Overlay("gyroTimer", ["kuudra t5", "kuudra f4"], data.GL, "moveAlignTimer", gyroExample);

// Detect Cells Alignment
register("chat", () => {
    if (getWorld() != "kuudra t5" && getWorld() != "kuudra f4") return;

    align = 6.0;
    cd = 10;
}).setCriteria("You aligned ${message}");

register("chat", () => {
    if (getWorld() != "kuudra t5" && getWorld() != "kuudra f4") return;

    align = 6.0;
}).setCriteria("${player} casted Cells Alignment on you!");

register("tick", () => {
    if (getWorld() != "kuudra t5" && getWorld() != "kuudra f4") return;

    if (align != 0) {
        if (settings.gyroAlert && align > 0.5 && align < 1 && cd == 0)
            Client.Companion.showTitle(`${DARK_RED}${BOLD}USE ALIGN`, "", 0, 25, 5);
        align = (align - 0.05).toFixed(2);
        gyroOverlay.message = `${GREEN}${BOLD}Align Timer: ${RESET}${align}s`;
    } else gyroOverlay.message = `${GREEN}${BOLD}Align Timer: ${RED}NO ALIGN`;
    
    if (cd != 0) {
        cd = (cd - 0.05).toFixed(2);
    }
})
