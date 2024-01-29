import settings from "../../utils/settings";
import { getInParty, getIsLeader, getParty } from "../../utils/party";
import { getPlayerName } from "../../utils/functions/player";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Transfers party back whenever you become leader.
 */
registerWhen(register("chat", (player1, player2) => {
    const name1 = getPlayerName(player1).toLowerCase();
    const name2 = getPlayerName(player2).toLowerCase();

    if (name1 === Player.getName().toLowerCase())
        delay(() => ChatLib.command("p transfer " + name2), 500);
}).setCriteria("The party was transferred to ${player1} by ${player2}"), () => settings.autoTransfer === 1);


/**
 * Auto transfer if in lobby.
 */
let transferred = false;
registerWhen(register("chat", (player1, player2) => {
    if (getWorld() !== undefined && !transferred) return;
    const name1 = getPlayerName(player1).toLowerCase();
    const name2 = getPlayerName(player2).toLowerCase();

    if (name1 === Player.getName().toLowerCase()) delay(() => ChatLib.command("p transfer " + name2), 500);
    transferred = true;
}).setCriteria("The party was transferred to ${player1} by ${player2}"), () => settings.autoTransfer === 2);
registerWhen(register("worldLoad", () => { transferred = false }), () => settings.autoTransfer === 2);
registerWhen(register("chat", () => {
    if (!getIsLeader()) return;
    const party = Array.from(getParty());
    delay(() => ChatLib.command(`p transfer ${party[Math.floor(Math.random() * party.length)]}`), 500);
}).setCriteria("Oops! You are not on SkyBlock so we couldn't warp you!"), () => settings.autoTransfer === 2);

/**
 * Announce to party when kicked
 */
registerWhen(register("chat", () => {
    if (!getInParty()) return;
    delay(() => ChatLib.command(`pc ${settings.kickAnnounce}`), 1000);
}).setCriteria("Oops! You are not on SkyBlock so we couldn't warp you!"), () => settings.kickAnnounce !== "");
registerWhen(register("chat", () => {
    if (!getInParty()) return;
    delay(() => ChatLib.command(`pc ${settings.kickAnnounce}`), 1000);
}).setCriteria("You were kicked while joining that server!"), () => settings.kickAnnounce !== "");
