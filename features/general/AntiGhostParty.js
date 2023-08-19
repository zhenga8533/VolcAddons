import settings from "../../settings";
import { getInParty } from "../../utils/party";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";


/**
 * This function handles redirection of party commands by intercepting and modifying chat messages.
 * If the player is in a party, or if the message doesn't meet criteria for redirection, it's ignored.
 * Otherwise, it cancels the event, reformulates the party command, and issues the modified command.
 * A delay is applied to ensure proper execution sequence.
 *
 * @param {string} message - The chat message to be intercepted and redirected.
 * @param {object} event - The event object representing the chat message event.
 */
registerWhen(register("messageSent", (message, event) => {
    const args = message.split(' ');
    if (getInParty() || args.length < 3 || (args[0] !== "/p" && args[0] !== "/party")) return;
    cancel(event);
    ChatLib.command(`p ${args[1]}`);
    delay(() => ChatLib.command(`p ${args.splice(2).join(' ')}`), 500);
}), () => settings.antiGhostParty);
