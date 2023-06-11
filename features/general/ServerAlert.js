import settings from "../../settings";
import { BOLD, DARK_RED, WHITE } from "../../utils/constants";
import { registerWhen } from "../../utils/variables"

let servers = [];

registerWhen(register("chat", (server, event) => {
    if (servers.includes(server)) {
        cancel(event);
        ChatLib.chat(`${DARK_RED}${BOLD}Recent Server: ${WHITE}${server}${DARK_RED}${BOLD}!`);
    } else {
        servers.push(server)
        setTimeout(() => { servers.shift() }, settings.serverAlert * 60 * 1000);
    }
}).setCriteria("Sending to server ${server}..."), () => settings.serverAlert);
