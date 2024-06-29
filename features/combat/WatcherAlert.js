import Settings from "../../Settings";
import { AMOGUS, BOLD, GOLD } from "../../utils/Constants";
import { playSound } from "../../utils/functions/misc";
import { registerWhen } from "../../utils/RegisterTils";
import { setTitle } from "../../utils/Title";

/**
 * Tracks chat messages from "The Watcher" to call an emergency meeting whenever he finishes spawning (meant for f11 blood camps).
 * Includes two messages since messages glitch out if mobs are killed too fast.
 */
registerWhen(
  register("chat", () => {
    if (cd) return;
    setTitle(`${GOLD + BOLD}BLOOD COMPLETE!`, "", 0, 25, 5, 70);
    playSound(AMOGUS, 3000);
  }).setCriteria("[BOSS] The Watcher: You have proven yourself. You may pass."),
  () => Settings.watcherAlert
);
registerWhen(
  register("chat", () => {
    if (cd) return;
    setTitle(`${GOLD + BOLD}BLOOD SPAWNED!`, "", 0, 25, 5, 70);
    playSound(AMOGUS, 3000);
  }).setCriteria("[BOSS] The Watcher: That will be enough for now."),
  () => Settings.watcherAlert
);
