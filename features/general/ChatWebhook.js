import { request } from "../../../axios";
import settings from "../../settings";
import { getGuildName, getPlayerName } from "../../utils/functions";
import { registerWhen } from "../../utils/variables";
import { getWaifu, setWaifu } from "./PartyCommands";


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

registerWhen(register("chat", (player, color, msg) => {
    print(color);
    if (player.includes("Party") || player.includes("Guild") || !(color === "f" || color === "7")) return;
    sendWebhook(getPlayerName(player.removeFormatting()), msg, 0);
}).setCriteria("&r${player}&${color}: ${msg}&r"), () => settings.chatWebhook !== "" && settings.publicChat);

registerWhen(register("chat", (player, msg) => {
    sendWebhook(getPlayerName(player), msg, 255);
}).setCriteria("Party > ${player}: ${msg}"), () => settings.chatWebhook !== "" && settings.partyChat);

registerWhen(register("chat", (player, msg) => {
    sendWebhook(getGuildName(player), msg, 32768);
}).setCriteria("Guild > ${player}: ${msg}"), () => settings.chatWebhook !== "" && settings.guildChat);

registerWhen(register("chat", (player, msg) => {
    sendWebhook(getPlayerName(player), msg, 16711935);
}).setCriteria("From ${player}: ${msg}"), () => settings.chatWebhook !== "" && settings.privateChat);
