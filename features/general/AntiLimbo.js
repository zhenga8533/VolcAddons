import { delay } from "../../utils/thread";

function joinSB() {
    delay(() => {
        ChatLib.command("l");
        delay(() => ChatLib.command("play sb"), 1000)
    }, 1000);
}

register("chat", () => {
    joinSB();
}).setCriteria("An ${error} occurred in your connection, so you were put in the SkyBlock Lobby!");

register("chat", () => {
    joinSB();
}).setCriteria("You were spawned in Limbo.");
