import { request } from "../../../axios";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import Toggles from "../../utils/Toggles";
import { getGuildName, getPlayerName } from "../../utils/functions/player";

/**
 * Sends a webhook message to discord with message data and timestamp.
 * @param {String} player - The name of the player sending the message.
 * @param {String} msg - The content of the message.
 * @param {String} color - The color code for the embed.
 */
function sendWebhook(player, msg, color) {
  request({
    url: Settings.chatWebhook,
    method: "POST",
    headers: {
      "Content-type": "application/Json",
      "User-Agent": "Mozilla/5.0",
    },
    body: {
      username: "VolcYapons",
      avatar_url: `https://www.mc-heads.net/avatar/${player}`,
      embeds: [
        {
          author: {
            name: player,
            icon_url: `https://www.mc-heads.net/avatar/${player}`,
          },
          color: color,
          description: msg,
          timestamp: new Date(),
        },
      ],
    },
  });
}

/**
 * Check for public chat messages.
 */
registerWhen(
  register("chat", (player, color, msg) => {
    if (player.includes("Party") || player.includes("Guild") || !(color === "f" || color === "7")) return;
    sendWebhook(getPlayerName(player.removeFormatting()), msg, 0);
  }).setCriteria("&r${player}&${color}: ${msg}&r"),
  () => Settings.chatWebhook !== "" && Toggles.publicChat
);

/**
 * Check for party chat messages.
 */
registerWhen(
  register("chat", (player, msg) => {
    sendWebhook(getPlayerName(player), msg, 255);
  }).setCriteria("Party > ${player}: ${msg}"),
  () => Settings.chatWebhook !== "" && Toggles.partyChat
);

/**
 * Check for guild chat messages.
 */
registerWhen(
  register("chat", (player, msg) => {
    sendWebhook(getGuildName(player), msg, 32768);
  }).setCriteria("Guild > ${player}: ${msg}"),
  () => Settings.chatWebhook !== "" && Toggles.guildChat
);

/**
 * Check for private chat messages.
 */
registerWhen(
  register("chat", (player, msg) => {
    sendWebhook(getPlayerName(player), msg, 16711935);
  }).setCriteria("From ${player}: ${msg}"),
  () => Settings.chatWebhook !== "" && Toggles.privateChat
);
