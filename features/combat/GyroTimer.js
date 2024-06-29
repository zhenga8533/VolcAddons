/**
 * ARCHIVED
 */

import { BOLD, DARK_RED, GREEN, RED, RESET } from "../../utils/Constants";
import { data } from "../../utils/Data";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";

/**
 * Variables used to track and display Cells Alignment time.
 */
let align = 0;
let cd = 0;
const gyroExample = `${GREEN + BOLD}Align Timer: ${RESET}LEAK?!`;
const gyroOverlay = new Overlay("gyroTimer", data.GL, "moveGyro", gyroExample);

/**
 * Detects whenever you get affected by "Cell's Alignment".
 */
register("chat", () => {
  align = 6.0;
  cd = 10;
}).setCriteria("You aligned ${message}");
register("chat", () => {
  align = 6.0;
}).setCriteria("${player} casted Cells Alignment on you!");

/**
 * Adjustes the align timer overlay and alerts player whenever align is about to run out.
 */
registerWhen(
  register("tick", () => {
    if (align > 0) {
      if (Settings.gyroAlert && align > 0.5 && align < 1 && cd === 0)
        Client.showTitle(`${DARK_RED + BOLD}USE ALIGN`, "", 0, 25, 5);
      align = (align - 0.05).toFixed(2);
      gyroOverlay.setMessage(`${GREEN + BOLD}Align Timer: ${RESET + align}s`);
    } else gyroOverlay.setMessage(`${GREEN + BOLD}Align Timer: ${RED}NO ALIGN`);

    if (cd > 0) cd = (cd - 0.05).toFixed(2);
  }),
  () => Settings.gyroAlert || Settings.gyroTimer
);
