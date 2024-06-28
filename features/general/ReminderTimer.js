import { AMOGUS, BOLD, GOLD } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";
import { playSound } from "../../utils/functions/misc";

/**
 * Variable to represent minutes passed for timer.
 */
let minutes = 0;

/**
 * Counts minutes until set timer to send an customizable alert.
 */
registerWhen(
  register("step", () => {
    minutes++;
    if (minutes >= Settings.reminderTime) {
      setTitle(`${GOLD + BOLD + Settings.reminderText}`, "", 10, 50, 10, 99);
      playSound(AMOGUS, 1000);
      minutes = 0;
    }
  }).setDelay(60),
  () => Settings.reminderTime !== 0
);
