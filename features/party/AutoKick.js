import { getIsLeader } from "../../utils/party";
import { getPlayerName } from "../../utils/functions/player";
import { registerWhen } from "../../utils/register";
import { delay } from "../../utils/thread";
import { data } from "../../utils/data";


/**
 * Kick users on blacklist.
 */
registerWhen(register("chat", (player) => {
    if (!getIsLeader()) return;
    
    const name = getPlayerName(player).toLowerCase();
    if (data.blacklist.includes(name))
        delay(() => ChatLib.command(`p kick ${name}`));
}).setCriteria("${player} joined the party."), () => data.blacklist.length !== 0);
