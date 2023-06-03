import settings from "../settings";
import { getPlayerName } from "../utils/variables";

register("chat", (player1, player2) => {
    if(!settings.autoTransfer) return;

    const name1 = getPlayerName(player1).toLowerCase();
    const name2 = getPlayerName(player2).toLowerCase();

    if (name1 == Player.getName().toLowerCase())
        setTimeout(() => { ChatLib.command("p transfer " + name2) }, 500);
}).setCriteria("The party was transferred to ${player1} by ${player2}");
