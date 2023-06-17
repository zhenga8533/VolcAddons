import settings from "../../settings";
import { romanToNum } from "../../utils/functions";
import { getIsLeader } from "../../utils/party";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";

let onCD = false;
let invited = 0;

let dungeon = ["MASTER", 7]
registerWhen(register("chat", (type, floor) => {
    if (onCD || !getIsLeader()) return;
    invited = 4;
    dungeon = [type, romanToNum(floor)];

    onCD = true;
    delay(() => onCD = false, 500);
    delay(() => ChatLib.command("warp garden"), 1000);
}).setCriteria("${type} - Floor ${floor}"), () => settings.dungeonRejoin);

registerWhen(register("chat", () => {
    if (invited == 0) return;
    
    invited--;
    if (invited == 0) {
        delay(() => ChatLib.command("p warp"), 4000);
        if (dungeon[0].includes("MASTER"))
            delay(() => ChatLib.command(`joindungeon master_catacombs ${dungeon[1]}`), 9000);
        else
            delay(() => ChatLib.command(`joindungeon catacombs ${dungeon[1]}`), 9000);
    }
}).setCriteria("${player} joined the party."), () => settings.dungeonRejoin);
