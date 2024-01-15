import { getPlayerName } from "../../utils/functions";
import { getIsLeader } from "../../utils/party";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";


/**
 * Kick users on blacklist.
 */
registerWhen(register("chat", (player) => {
    if (!getIsLeader()) return;
    
    player = getPlayerName(player).toLowerCase();
    if (data.blacklist.find(name => {
        name === player;
    }) === undefined) return;

    delay(() => ChatLib.command(`p kick ${player}`));
}).setCriteria("${player} joined the party."), () => data.blacklist.length !== 0);
