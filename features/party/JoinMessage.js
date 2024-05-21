import party from "../../utils/party";
import settings from "../../utils/Settings";
import { getGuildName, getPlayerName } from "../../utils/functions/player";
import { registerWhen } from "../../utils/RegisterTils";
import { delay } from "../../utils/thread";


/**
 * Sends a party chat message when someone joins.
 */
registerWhen(register("chat", (player) => {
    if (settings.partyMessageLeader && !party.getLeader()) return;
    const regex = new RegExp("\\$\\{name\\}", 'g');
    delay(() => ChatLib.command(`pc ${settings.partyMessage.replace(regex, getPlayerName(player))}`), 250);
}).setCriteria("${player} joined the party."), () => settings.partyMessage !== "");

/**
 * Sends a guild chat message when someone joins.
 */
registerWhen(register("chat", (player) => {
    const regex = new RegExp("\\$\\{name\\}", 'g');
    delay(() => ChatLib.command(`gc ${settings.guildMessage.replace(regex, getGuildName(player))}`), 250);
}).setCriteria("${player} joined the guild!"), () => settings.guildMessage !== "");
