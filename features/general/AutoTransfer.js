import settings from "../../utils/settings";
import { getPlayerName } from "../../utils/functions";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getIsLeader } from "../../utils/party";


/**
 * Transfers party back whenever you become leader.
 *
 * @param {string} player1 - Current leader.
 * @param {string} player2 - Previous leader.
 */
registerWhen(register("chat", (player1, player2) => {
    const name1 = getPlayerName(player1).toLowerCase();
    const name2 = getPlayerName(player2).toLowerCase();

    if (name1 === Player.getName().toLowerCase())
        delay(() => ChatLib.command("p transfer " + name2), 500);
}).setCriteria("The party was transferred to ${player1} by ${player2}"), () => settings.autoTransfer === true);


/**
 * Auto transfer if in lobby.
 */
 
register("chat", (player1, player2) => {
    if (getWorld() !== undefined) return;
    const name1 = getPlayerName(player1).toLowerCase();
    const name2 = getPlayerName(player2).toLowerCase();

    if (name1 === Player.getName().toLowerCase())
        delay(() => ChatLib.command("p transfer " + name2), 500);
}).setCriteria("The party was transferred to ${player1} by ${player2}");

register("chat", () => {
    if (getIsLeader() === false) return;

    // transfer
}).setCriteria("Oops! You are not on SkyBlock so we couldn't warp you!");
