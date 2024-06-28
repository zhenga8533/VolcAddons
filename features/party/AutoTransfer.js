import location from "../../utils/Location";
import party from "../../utils/Party";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { delay } from "../../utils/ThreadTils";
import { getPlayerName } from "../../utils/functions/player";

/**
 * Transfers party back whenever you become leader.
 */
registerWhen(
  register("chat", (player1, player2) => {
    const name1 = getPlayerName(player1).toLowerCase();
    const name2 = getPlayerName(player2).toLowerCase();

    if (name1 === Player.getName().toLowerCase()) delay(() => ChatLib.command("p transfer " + name2), 500);
  }).setCriteria("The party was transferred to ${player1} by ${player2}"),
  () => Settings.autoTransfer === 1
);

/**
 * Auto transfer if in lobby.
 */
let transferred = false;
registerWhen(
  register("chat", (player1, player2) => {
    if (location.getWorld() !== undefined && !transferred) return;
    const name1 = getPlayerName(player1).toLowerCase();
    const name2 = getPlayerName(player2).toLowerCase();

    if (name1 === Player.getName().toLowerCase()) delay(() => ChatLib.command("p transfer " + name2), 500);
    transferred = true;
  }).setCriteria("The party was transferred to ${player1} by ${player2}"),
  () => Settings.autoTransfer === 2
);
registerWhen(
  register("worldLoad", () => {
    transferred = false;
  }),
  () => Settings.autoTransfer === 2
);
registerWhen(
  register("chat", () => {
    if (!party.getLeader()) return;
    const members = Array.from(party.getMembers());
    delay(() => ChatLib.command(`p transfer ${members[Math.floor(Math.random() * members.length)]}`), 500);
  }).setCriteria("Oops! You are not on SkyBlock so we couldn't warp you!"),
  () => Settings.autoTransfer === 2
);

/**
 * Announce to party when kicked
 */
registerWhen(
  register("chat", () => {
    if (!party.getIn()) return;
    delay(() => ChatLib.command(`pc ${Settings.kickAnnounce}`), 1000);
  }).setCriteria("Oops! You are not on SkyBlock so we couldn't warp you!"),
  () => Settings.kickAnnounce !== ""
);
registerWhen(
  register("chat", () => {
    if (!party.getIn()) return;
    delay(() => ChatLib.command(`pc ${Settings.kickAnnounce}`), 1000);
  }).setCriteria("You were kicked while joining that server!"),
  () => Settings.kickAnnounce !== ""
);
