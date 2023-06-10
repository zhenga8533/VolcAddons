import settings from "../settings";
import { BOLD, DARK_RED, WHITE } from "../utils/constants";

let servers = [];

register("chat", (server, event) => {
    if (!settings.serverAlert) return;

    if (servers.includes(server)) {
        cancel(event);
        ChatLib.chat(`${DARK_RED}${BOLD}Recent Server: ${WHITE}${server}${DARK_RED}${BOLD}!`);
    } else {
        servers.push(server)
        setTimeout(() => { servers.shift() }, settings.serverAlert * 60 * 1000);
    }
}).setCriteria("Sending to server ${server}...");
