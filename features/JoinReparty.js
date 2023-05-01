import settings from "../settings";
import { data, getPlayerName } from "../variables";

let invites = [];

register("chat", (player) => {
    if(!settings.joinRP) return;

    const name = getPlayerName(player).toLowerCase();

    invites.push(name);
    setTimeout(() => { invites.shift() }, 60000);
}).setCriteria("${player} has disbanded the party!");

register("chat", (player) => {
    const name = getPlayerName(player).toLowerCase();

    if (!settings.joinRP || !invites.includes(name)) return;
    if (settings.joinWhitelist && data.whitelist.includes(name)) return;

    setTimeout(function () { ChatLib.command("p join " + name) }, 500);
}).setCriteria("-----------------------------------------------------\n${player} has invited you to join their party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------------------------------");