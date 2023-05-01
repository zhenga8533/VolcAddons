import settings from "../settings"
import { data, getPlayerName } from "../variables"

register("chat", (player) => {
    // Get player name no rank
    const name = getPlayerName(player);

    if (!settings.joinWhitelist || !data.whitelist.includes(name.toLowerCase())) return;

    setTimeout(function () {
        ChatLib.command("p join " + name)
    }, 500);
}).setCriteria("-----------------------------------------------------\n${player} has invited you to join their party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------------------------------");

register("chat", (player1, player2) => {
    // Get player name no rank
    const name1 = getPlayerName(player1).toLowerCase();
    const name2 = getPlayerName(player2).toLowerCase();

    if (!settings.joinWhitelist || !(data.whitelist.includes(name1) || data.whitelist.includes(name2))) return;
    
    setTimeout(function () {
        ChatLib.command("p join " + name1)
    }, 500);
}).setCriteria("-----------------------------------------------------\n${player1} has invited you to join ${player2}'s party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------------------------------");