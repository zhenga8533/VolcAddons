import { data } from "../../utils/Data";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { delay } from "../../utils/ThreadTils";
import { getPlayerName } from "../../utils/functions/player";

/**
 * Variables used to detect disbanded parties in past minute.
 */
let invites = [];

/**
 * Records disbanded parties for 60 seconds for auto join reparty.
 */
registerWhen(
  register("chat", (player) => {
    const name = getPlayerName(player).toLowerCase();

    invites.push(name);
    delay(() => invites.shift(), 60000);
  }).setCriteria("${player} has disbanded the party!"),
  () => Settings.joinRP
);

/**
 * Acceots oarty invite if party was disbanded in last 60 seconds or part of user whitelist.
 */
registerWhen(
  register("chat", (player) => {
    const name = getPlayerName(player).toLowerCase();

    if (Settings.joinWhitelist && data.whitelist.includes(name))
      // Whitelist
      delay(() => ChatLib.command("p accept " + name), 500);
    else if (Settings.joinRP && invites.includes(name))
      // Reparty
      delay(() => ChatLib.command("p accept " + name), 500);
  }).setCriteria(
    "-----------------------------------------------------\n${player} has invited you to join their party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------------------------------"
  ),
  () => Settings.joinRP || Settings.joinWhitelist
);
registerWhen(
  register("chat", (player1, player2) => {
    const name1 = getPlayerName(player1).toLowerCase();
    const name2 = getPlayerName(player2).toLowerCase();
    if (!data.whitelist.includes(name1) && !data.whitelist.includes(name2)) return;

    delay(() => ChatLib.command("p accept " + name1), 500);
  }).setCriteria(
    "-----------------------------------------------------\n${player1} has invited you to join ${player2}'s party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------------------------------"
  ),
  () => Settings.joinWhitelist
);
