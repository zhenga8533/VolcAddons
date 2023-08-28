import { request } from "../../../axios";
import settings from "../../settings";
import { getGuildName, getPlayerName } from "../../utils/functions";
import { registerWhen } from "../../utils/variables";
import { getWaifu, setWaifu } from "./PartyCommands";


/**
 * Sends a webhook message to discord with message data and timestamp.
 * @param {string} player - The name of the player sending the message.
 * @param {string} msg - The content of the message.
 * @param {string} color - The color code for the embed.
 */
function sendWebhook(player, msg, color) {
    setWaifu();
    request({
        url: settings.chatWebhook,
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "User-Agent": "Mozilla/5.0"
        },
        body: {
            "username": "VolcYapons",
            "avatar_url": getWaifu(),
            "embeds": [{
                "author": {
                    "name": player,
                    "icon_url": `https://www.mc-heads.net/avatar/${player}`
                },
                "color": color,
                "description": msg,
                "timestamp": new Date()
            }]
        }
    });
}

/**
 * Check for public chat messages.
 */
registerWhen(register("chat", (player, color, msg) => {
    print(color);
    if (player.includes("Party") || player.includes("Guild") || !(color === "f" || color === "7")) return;
    sendWebhook(getPlayerName(player.removeFormatting()), msg, 0);
}).setCriteria("&r${player}&${color}: ${msg}&r"), () => settings.chatWebhook !== "" && settings.publicChat);

/**
 * Check for party chat messages.
 */
registerWhen(register("chat", (player, msg) => {
    sendWebhook(getPlayerName(player), msg, 255);
}).setCriteria("Party > ${player}: ${msg}"), () => settings.chatWebhook !== "" && settings.partyChat);

/**
 * Check for guild chat messages.
 */
registerWhen(register("chat", (player, msg) => {
    sendWebhook(getGuildName(player), msg, 32768);
}).setCriteria("Guild > ${player}: ${msg}"), () => settings.chatWebhook !== "" && settings.guildChat);

/**
 * Check for private chat messages.
 */
registerWhen(register("chat", (player, msg) => {
    sendWebhook(getPlayerName(player), msg, 16711935);
}).setCriteria("From ${player}: ${msg}"), () => settings.chatWebhook !== "" && settings.privateChat);
