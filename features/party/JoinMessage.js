import { getIsLeader } from "../../utils/party";
import settings from "../../utils/settings";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";


/**
 * Sends a party chat message when someone joins.
 */
registerWhen(register("chat", () => {
    if (settings.partyMessageLeader && !getIsLeader()) return;
    delay(() => ChatLib.command(`pc ${settings.partyMessage}`), 100);
}).setCriteria("${player} joined the party."), () => settings.partyMessage !== "");

/**
 * Sends a guild chat message when someone joins.
 */
registerWhen(register("chat", () => {
    delay(() => ChatLib.command(`gc ${settings.guildMessage}`), 100);
}).setCriteria("${player} joined the guild!"), () => settings.guildMessage !== "");
