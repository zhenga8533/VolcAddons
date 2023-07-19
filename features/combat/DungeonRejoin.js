import settings from "../../settings";
import { romanToNum } from "../../utils/functions";
import { getIsLeader } from "../../utils/party";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";

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

    if (settings.dungeonRejoin == 2 || settings.dungeonRejoin == 3)
        delay(() => ChatLib.command("warp garden"), 1000);
    else {
        if (dungeon[0].includes("Master"))
            delay(() => ChatLib.command(`joindungeon master_catacombs ${dungeon[1]}`), 1000);
        else
            delay(() => ChatLib.command(`joindungeon catacombs ${dungeon[1]}`), 1000);
    }
}).setCriteria("${type} - Floor ${floor}"), () => settings.dungeonRejoin);

function tryWarp(world) {
    if (getWorld() == world) {
        baseDelay = 0
        if (settings.dungeonRejoin == 2) {
            delay(() => ChatLib.command("p warp"), 4000);
            baseDelay += 7000
        }

        if (dungeon[0].includes("Master"))
            delay(() => ChatLib.command(`joindungeon master_catacombs ${dungeon[1]}`), 2000 + baseDelay);
        else
            delay(() => ChatLib.command(`joindungeon catacombs ${dungeon[1]}`), 2000 + baseDelay);
    } else
        delay(() => tryWarp(world), 1000);
}

registerWhen(register("chat", () => {
    if (invited == 0) return;
    
    invited--;
    if (invited == 0) {
        if (settings.dungeonRejoin == 2)
            tryWarp("garden");
        else
            tryWarp(undefined);
    }
}).setCriteria("${player} joined the party."), () => settings.dungeonRejoin == 2 || settings.dungeonRejoin == 3);
