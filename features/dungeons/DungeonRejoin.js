import settings from "../../settings";
import { AMOGUS } from "../../utils/constants";
import { romanToNum } from "../../utils/functions";
import { getIsLeader } from "../../utils/party";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";

let onCD = false;
let invited = 0;

let dungeon = ["Master", 7];
registerWhen(register("chat", (type, floor) => {
    if (onCD || !getIsLeader()) return;

    onCD = true;
    delay(() => onCD = false, 500);
    floor = romanToNum(floor) % 8;
    dungeon = [type, floor];
    invited = 4;

    delay(() => ChatLib.command("warp garden"), 1000);
}).setCriteria("${type} - Floor ${floor}"), () => settings.dungeonRejoin);

registerWhen(register("chat", () => {
    if (invited == 0) return;
    
    invited--;
    if (invited == 0) {
        delay(() => ChatLib.command("p warp"), 4000);
        if (dungeon[0].includes("Master"))
            delay(() => ChatLib.command(`joindungeon master_catacombs ${dungeon[1]}`), 8000);
        else
            delay(() => ChatLib.command(`joindungeon catacombs ${dungeon[1]}`), 8000);
    }
}).setCriteria("${player} joined the party."), () => settings.dungeonRejoin);

registerWhen(register("chat", () => {
    AMOGUS.play();
}).setCriteria("[BOSS] The Watcher: You have proven yourself. You may pass."), () => true);
