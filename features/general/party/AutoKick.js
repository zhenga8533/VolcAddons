import { getPlayerName } from "../../../utils/functions";
import { delay } from "../../../utils/thread";
import { data, registerWhen } from "../../../utils/variables";


registerWhen(register("chat", (player) => {
    player = getPlayerName(player).toLowerCase();
    if (data.blacklist.find(name => {
        name === player;
    }) === undefined) return;

    delay(() => ChatLib.command(`p kick ${player}`));
}).setCriteria("${player} joined the party."), () => data.blacklist.length !== 0);