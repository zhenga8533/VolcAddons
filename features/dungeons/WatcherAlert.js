import settings from "../../settings";
import { AMOGUS } from "../../utils/constants";
import { registerWhen } from "../../utils/variables";

registerWhen(register("chat", () => {
    AMOGUS.play();
}).setCriteria("[BOSS] The Watcher: You have proven yourself. You may pass."), () => settings.watcherAlert);
