import settings from "../../utils/settings";
import { BOLD, DARK_RED, WHITE } from "../../utils/constants";
import { getTime } from "../../utils/functions";
import { registerWhen } from "../../utils/variables";
import { getServer } from "../../utils/worlds";


/**
 * Dictionary to track servers and their last join time.
 */
let servers = {};

/**
 * Replaces joining message if player has been in server in past X minutes.
 */
registerWhen(register("chat", (server, event) => {
    const currentTime = Date.now();
    const timeDiff = (currentTime - servers[server]) / 1000;
    const timeThreshold = settings.serverAlert * 60;

    if (servers?.[server] !== undefined && timeDiff < timeThreshold) {
        cancel(event);
        ChatLib.chat(`${DARK_RED + BOLD}Recent Server: ${WHITE + server + DARK_RED + BOLD}!`);
        ChatLib.chat(`${DARK_RED + BOLD}Last Joined: ${WHITE + getTime(timeDiff)} ago!`);
    }
}).setCriteria("Sending to server ${server}..."), () => settings.serverAlert !== 0);

/**
 * Clears server entry after X minutes when leaving it.
 */
registerWhen(register("worldUnload", () => {
    const server = getServer();
    if (server === undefined) return;
    const currentTime = Date.now();
    servers[server] = currentTime;
}), () => settings.serverAlert !== 0);
