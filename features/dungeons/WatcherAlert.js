import settings from "../../settings";
import { AMOGUS } from "../../utils/constants";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";

cd = false;

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
