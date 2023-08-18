import settings from "../../settings";
import { getInParty } from "../../utils/party";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";

registerWhen(register("messageSent", (message, event) => {
    const args = message.split(' ');
    if (getInParty() || args.length < 3 || (args[0] !== "/p" && args[0] !== "/party")) return;
    cancel(event);
    ChatLib.command(`p ${args[1]}`);
    delay(() => ChatLib.command(`p ${args.splice(2).join(' ')}`), 500);
}), () => settings.antiGhostParty);