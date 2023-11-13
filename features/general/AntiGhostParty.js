import settings from "../../utils/settings";
import { getInParty } from "../../utils/party";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";


/**
 * Handles redirection of party commands by intercepting and modifying chat messages.
 *
 * @param {string} message - The chat message to be intercepted and redirected.
 * @param {object} event - The event object representing the chat message event.
 */
const partyCommands = new Set(["accept", "join"]);
let cd = false;
registerWhen(register("messageSent", (message, event) => {
    const args = message.split(' ');
    if (cd || getInParty() || args.length < 3 || (args[0] !== "/p" && args[0] !== "/party") || partyCommands.has(args[1].toLowerCase())) return;
    cd = true;
    delay(() => cd = false, 1000);

    cancel(event);
    ChatLib.command(`p ${args[1]}`);
    delay(() =>  ChatLib.command(`p ${args.splice(2).join(' ')}`), 500);
}), () => settings.antiGhostParty);
