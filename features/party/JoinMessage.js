import party from "../../utils/Party";
import Settings from "../../utils/Settings";
import { getGuildName, getPlayerName } from "../../utils/functions/player";
import { registerWhen } from "../../utils/RegisterTils";
import { delay } from "../../utils/ThreadTils";


/**
 * Sends a party chat message when someone joins.
 */
registerWhen(register("chat", (player) => {
    if (Settings.partyMessageLeader && !party.getLeader()) return;
    const regex = new RegExp("\\$\\{name\\}", 'g');
    delay(() => ChatLib.command(`pc ${Settings.partyMessage.replace(regex, getPlayerName(player))}`), 250);
}).setCriteria("${player} joined the party."), () => Settings.partyMessage !== "");

/**
 * Sends a guild chat message when someone joins.
 */
registerWhen(register("chat", (player) => {
    const regex = new RegExp("\\$\\{name\\}", 'g');
    delay(() => ChatLib.command(`gc ${Settings.guildMessage.replace(regex, getGuildName(player))}`), 250);
}).setCriteria("${player} joined the guild!"), () => Settings.guildMessage !== "");
