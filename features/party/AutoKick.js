import { data } from "../../utils/Data";
import party from "../../utils/Party";
import { registerWhen } from "../../utils/RegisterTils";
import { delay } from "../../utils/ThreadTils";
import { getPlayerName } from "../../utils/functions/player";

/**
 * Kick users on blacklist.
 */
registerWhen(
  register("chat", (player) => {
    if (!party.getLeader()) return;

    const name = getPlayerName(player).toLowerCase();
    if (data.blacklist.includes(name)) delay(() => ChatLib.command(`p kick ${name}`));
  }).setCriteria("${player} joined the party."),
  () => data.blacklist.length !== 0
);
