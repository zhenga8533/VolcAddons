import party from "../../utils/party";
import { getPlayerName } from "../../utils/functions/player";
import { registerWhen } from "../../utils/RegisterTils";
import { delay } from "../../utils/ThreadTils";
import { data } from "../../utils/Data";


/**
 * Kick users on blacklist.
 */
registerWhen(register("chat", (player) => {
    if (!party.getLeader()) return;
    
    const name = getPlayerName(player).toLowerCase();
    if (data.blacklist.includes(name))
        delay(() => ChatLib.command(`p kick ${name}`));
}).setCriteria("${player} joined the party."), () => data.blacklist.length !== 0);
