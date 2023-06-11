import settings from "../../settings";
import { data, getPlayerName, registerWhen } from "../../utils/variables";

let invites = [];

registerWhen(register("chat", (player) => {
    const name = getPlayerName(player).toLowerCase();

    invites.push(name);
    setTimeout(() => { invites.shift() }, 60000);
}).setCriteria("${player} has disbanded the party!"), () => settings.joinRP);

registerWhen(register("chat", (player) => {
    const name = getPlayerName(player).toLowerCase();

    if (settings.joinWhitelist && data.whitelist.includes(name)) // Join whitelist
        setTimeout(() => { ChatLib.command("p join " + name) }, 500);
    else if (settings.joinRP && invites.includes(name)) // Join RP
        setTimeout(() => { ChatLib.command("p join " + name) }, 500);
}).setCriteria("-----------------------------------------------------\n${player} has invited you to join their party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------------------------------"),
() => settings.joinRP || settings.joinWhitelist);

// Join RP instance #2
registerWhen(register("chat", (player1, player2) => {
    const name1 = getPlayerName(player1).toLowerCase();
    const name2 = getPlayerName(player2).toLowerCase();

    if (!data.whitelist.includes(name1) && !data.whitelist.includes(name2)) return;
    
    setTimeout(() => { ChatLib.command("p join " + name1) }, 500);
}).setCriteria("-----------------------------------------------------\n${player1} has invited you to join ${player2}'s party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------------------------------"),
() => settings.joinWhitelist);
