import settings from "../settings"
import {data} from "../variables"

// PARTY COMMANDS
register("chat", (rank, player) => {
    if (settings.joinWhitelist && data.whitelist.includes(player.toLowerCase())) {
        setTimeout(function () {
            ChatLib.command("p join " + player)
        }, 500);
    }
}).setCriteria("-----------------------------------------------------\n${rank} ${player} has invited you to join their party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------------------------------");

register("chat", (rank1, player1, rank2, player2) => {
    if (settings.joinWhitelist && (data.whitelist.includes(player1.toLowerCase()) || data.whitelist.includes(player2.toLowerCase()))) {
        setTimeout(function () {
            ChatLib.command("p join " + player1)
        }, 500);
    }
}).setCriteria("-----------------------------------------------------\n${rank1} ${player1} has invited you to join ${rank2} ${player2}'s party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------------------------------");