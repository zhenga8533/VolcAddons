import settings from "../../settings";
import { getPlayerName } from "../../utils/functions";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";


/**
 * Transfers party back whenever you become leader.
 *
 * @param {string} player1 - Current leader.
 * @param {string} player2 - Previous leader.
 */
registerWhen(register("chat", (player1, player2) => {
    const name1 = getPlayerName(player1).toLowerCase();
    const name2 = getPlayerName(player2).toLowerCase();

    if (name1 == Player.getName().toLowerCase())
        delay(() => ChatLib.command("p transfer " + name2), 500);
}).setCriteria("The party was transferred to ${player1} by ${player2}"), () => settings.autoTransfer);
