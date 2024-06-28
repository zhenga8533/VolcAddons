import { BOLD, DARK_RED, WHITE } from "../../utils/Constants";
import location from "../../utils/Location";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { formatTime } from "../../utils/functions/format";

/**
 * Dictionary to track servers and their last join time.
 */
let servers = {};

/**
 * Replaces joining message if player has been in server in past X minutes.
 */
registerWhen(
  register("chat", (server, event) => {
    if (servers?.[server] === undefined) return;

    const timeDiff = (Date.now() - servers[server]) / 1000;
    cancel(event);
    ChatLib.chat(`${DARK_RED + BOLD}Recent Server: ${WHITE + server + DARK_RED + BOLD}!`);
    ChatLib.chat(`${DARK_RED + BOLD}Last Joined: ${WHITE + formatTime(timeDiff, 2)} ago!`);
  }).setCriteria("Sending to server ${server}..."),
  () => Settings.serverAlert
);

/**
 * Clears server entry after X minutes when leaving it.
 */
registerWhen(
  register("worldUnload", () => {
    const server = location.getServer();
    if (server === undefined) return;
    servers[server] = Date.now();
  }),
  () => Settings.serverAlert
);
