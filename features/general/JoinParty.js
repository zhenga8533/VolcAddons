import settings from "../../settings";
import { getPlayerName } from "../../utils/functions";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";


/**
 * Variables used to detect disbanded parties in past minute.
 */
let invites = [];

/**
 * Records disbanded parties for 60 seconds for auto join reparty.
 *
 * @param {string} player - "[rank] ign".
 */
registerWhen(register("chat", (player) => {
    const name = getPlayerName(player).toLowerCase();

    invites.push(name);
    delay(() => invites.shift(), 60000);
}).setCriteria("${player} has disbanded the party!"), () => settings.joinRP);

/**
 * Acceots oarty invite if party was disbanded in last 60 seconds or part of user whitelist.
 *
 * @param {string} player - "[rank] ign".
 */
registerWhen(register("chat", (player) => {
    const name = getPlayerName(player).toLowerCase();

    if (settings.joinWhitelist && data.whitelist.includes(name))  // Whitelist
        delay(() => ChatLib.command("p join " + name), 500);
    else if (settings.joinRP && invites.includes(name))  // Reparty
        delay(() => ChatLib.command("p join " + name), 500);
}).setCriteria("-----------------------------------------------------\n${player} has invited you to join their party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------------------------------"),
() => settings.joinRP || settings.joinWhitelist);
registerWhen(register("chat", (player1, player2) => {
    const name1 = getPlayerName(player1).toLowerCase();
    const name2 = getPlayerName(player2).toLowerCase();

    if (!data.whitelist.includes(name1) && !data.whitelist.includes(name2)) return;
    
    delay(() => ChatLib.command("p join " + name1), 500);
}).setCriteria("-----------------------------------------------------\n${player1} has invited you to join ${player2}'s party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------------------------------"),
() => settings.joinWhitelist);
