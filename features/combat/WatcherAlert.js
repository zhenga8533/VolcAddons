import settings from "../../settings";
import { AMOGUS } from "../../utils/constants";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";

cd = false;


/**
 * Tracks chat messages from "The Watcher" to call an emergency meeting whenever he finishes spawning (meant for f11 blood camps).
 * Includes two messages since messages glitch out if mobs are killed too fast.
 */
registerWhen(register("chat", () => {
    if (cd) return;

    AMOGUS.play();
    cd = true;
    delay(() => cd = false, 1000);
}).setCriteria("[BOSS] The Watcher: You have proven yourself. You may pass."), () => settings.watcherAlert);
registerWhen(register("chat", () => {
    if (cd) return;

    AMOGUS.play();
    cd = true;
    delay(() => cd = false, 1000);
}).setCriteria("[BOSS] The Watcher: That will be enough for now."), () => settings.watcherAlert);
