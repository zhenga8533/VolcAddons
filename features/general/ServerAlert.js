import settings from "../../settings";
import { BOLD, DARK_RED, WHITE } from "../../utils/constants";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";

let servers = [];


/**
 * Tracks server player is in and replaces joining message if player has been in server in past X minutes.
 *
 * @param {string} server - Hypixel server id.
 * @param {Object} event - Chat message event.
 */
registerWhen(register("chat", (server, event) => {
    if (servers.includes(server)) {
        cancel(event);
        ChatLib.chat(`${DARK_RED}${BOLD}Recent Server: ${WHITE}${server}${DARK_RED}${BOLD}!`);
    } else
        servers.push(server);
}).setCriteria("Sending to server ${server}..."), () => settings.serverAlert);
registerWhen(register("worldUnload", () => {
    delay(() => {
        if (servers.length)
            servers.shift();
    }, settings.serverAlert * 60000);
}), () => settings.serverAlert);
