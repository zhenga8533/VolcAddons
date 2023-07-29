import settings from "../../settings";
import { LOGO, WHITE } from "../../utils/constants";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";


/**
 * Variable used to represent unwanted ringing.
 */
let blockRings = false;

/**
 * Tracks chat for when a caller in blocklist calls and cancels it.
 *
 * @param {string} npc - Name of the caller.
 * @param {Object} event - Chat message event.
 */
registerWhen(register("chat", (npc, event) => {
    if (data.blocklist.includes(npc.toLowerCase())) {
        ChatLib.chat(`${LOGO} ${WHITE}Blocked call from ${npc}!`);

        // Set Value to Block Sounds / Ring a Ding Dings
        blockRings = true;
        delay(() => blockRings = false, 5000);

        // Cancel Text
        cancel(event);
    }
}).setCriteria("✆ ${npc} ✆ "), () => settings.abiphoneBlocker)

/**
 * Blocks the 3 ringing messages from unwanted callers.
 *
 * @param {string} rings - RING RING RING.
 * @param {Object} event - Chat message event.
 */
registerWhen(register("chat", (rings, event) => {
    if (blockRings) cancel(event);
}).setCriteria("✆ ${rings} [PICK UP]"), () => settings.abiphoneBlocker);

/**
 * Cancels ringing sounds from unwatned callers.
 *
 * @param {Object} event - Sound event.
 */
registerWhen(register("soundPlay", (event) => {
    if (blockRings) cancel(event);
}).setCriteria("note.pling"), () => settings.abiphoneBlocker);
