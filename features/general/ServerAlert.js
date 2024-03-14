import settings from "../../utils/settings";
import { BOLD, DARK_RED, WHITE } from "../../utils/constants";
import { getTime } from "../../utils/functions/format";
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
    if (servers?.[server] === undefined) return;

    const timeDiff = (Date.now() - servers[server]) / 1000;
    cancel(event);
    ChatLib.chat(`${DARK_RED + BOLD}Recent Server: ${WHITE + server + DARK_RED + BOLD}!`);
    ChatLib.chat(`${DARK_RED + BOLD}Last Joined: ${WHITE + getTime(timeDiff, 2)} ago!`);
}).setCriteria("Sending to server ${server}..."), () => settings.serverAlert);

/**
 * Clears server entry after X minutes when leaving it.
 */
registerWhen(register("worldUnload", () => {
    const server = getServer();
    if (server === undefined) return;
    servers[server] = Date.now();
}), () => settings.serverAlert);
