import settings from "../../utils/settings";
import { getClosest } from "../../utils/functions/find";
import { getInParty, getIsLeader } from "../../utils/party";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { delay } from "../../utils/thread";


/**
 * Shaft Transfer
 */
const TRANSFER_COMMANDS = ["?transfer", "!ptme", "!pt", ".transfer"];

/**
 * Recursively calls party chat transfer commands until player becomes leader.
 * 
 * @param {Number} index - Index in TRANSFER_COMMANDS.
 */
function attemptTransfer(index) {
    delay(() => {
        ChatLib.command(`pc ${TRANSFER_COMMANDS[index]}`);
        if (!getIsLeader() && index < 3) attemptTransfer(index + 1);
    }, 750);
}

registerWhen(register("chat", () => {
    attemptTransfer(0);
}).setCriteria("WOW! You found a Glacite Mineshaft portal!"), () => settings.shaftTransfer && getWorld() === "Dwarven Mines");

/**
 * Corpse Announce
 */
let corpses = [];

registerWhen(register("chat", () => {
    if (!getInParty()) return;
    const x = Math.round(Player.getX());
    const y = Math.round(Player.getY());
    const z = Math.round(Player.getZ());
    if (getClosest([x, y, z], corpses)[1] < 10) return;

    ChatLib.command(`pc x: ${x}, y: ${y}, z: ${z}`);
}).setCriteria("  FROZEN CORPSE LOOT! "), () => settings.corpseAnnounce && getWorld() === "Mineshaft");

registerWhen(register("chat", (_, x, y, z) => {
    corpses.push([x, y, z.split(' ')[0]]);
}).setCriteria("${player}: x: ${x}, y: ${y}, z: ${z}"), () => settings.corpseAnnounce && getWorld() === "Mineshaft");

register("worldUnload", () => {
    corpses = [];
});
