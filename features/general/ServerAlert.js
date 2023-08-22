import settings from "../../settings";
import { BOLD, DARK_RED, WHITE } from "../../utils/constants";
import { getTime } from "../../utils/functions";
import { registerWhen } from "../../utils/variables";


/**
 * Dictionary to track servers and their last join time.
 */
let servers = {};
let currentServer = null;

/**
 * Replaces joining message if player has been in server in past X minutes.
 *
 * @param {string} server - Hypixel server id.
 * @param {Object} event - Chat message event.
 */
registerWhen(register("chat", (server, event) => {
    currentServer = server;
    const currentTime = Date.now();
    const timeDiff = (currentTime - servers[server]) / 1000;
    const timeThreshold = settings.serverAlert * 60;

    if (servers?.[server] !== undefined && timeDiff < timeThreshold) {
        cancel(event);
        ChatLib.chat(`${DARK_RED}${BOLD}Recent Server: ${WHITE}${server}${DARK_RED}${BOLD}!`);
        ChatLib.chat(`${DARK_RED}${BOLD}Last Joined: ${WHITE}${getTime(timeDiff)} ago!`);
    }
}).setCriteria("Sending to server ${server}..."), () => settings.serverAlert !== 0);

/**
 * Clears server entry after X minutes when leaving it.
 */
registerWhen(register("worldUnload", () => {
    if (currentServer === null) return;
    const currentTime = Date.now();
    servers[currentServer] = currentTime;
    const timeThreshold = settings.serverAlert * 60000;

    Object.keys(servers).forEach(server => {
        if (currentTime - servers[server] >= timeThreshold) {
            delete servers[server];
        }
    });
}), () => settings.serverAlert !== 0);
