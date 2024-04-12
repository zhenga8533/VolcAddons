import { request } from "../../../axios";
import settings from "../../utils/settings";
import { AQUA, BLUE, BOLD, DARK_GREEN, GREEN, LIGHT_PURPLE, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy, getTime } from "../../utils/functions/format";
import { Overlay } from "../../utils/overlay";
import { Stat, data, getPaused, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getWaifu } from "../party/PartyCommands";


/**
 * Variables used to track and display current event and powder.
 */
const powders = {
    "Mithril": new Stat(),
    "Gemstone": new Stat(),
    "Glacite": new Stat()
}
const powderExample =
`${DARK_GREEN + BOLD}Mithril: ${WHITE}I
${DARK_GREEN + BOLD}Rate: ${WHITE}wake
${LIGHT_PURPLE + BOLD}Gemstone: ${WHITE}up
${LIGHT_PURPLE + BOLD}Rate: ${WHITE}to
${AQUA + BOLD}Glacite: ${WHITE}the
${AQUA + BOLD}Rate: ${WHITE}sounds
${BLUE + BOLD}Time Passed: ${WHITE}of`;
const powderOverlay = new Overlay("powderTracker", ["Dwarven Mines", "Crystal Hollows"], () => true, data.PL, "movePowder", powderExample);

/**
 * Command to reset powder overlay.
 */
register("command", () => {
    for (let key in powders)
        powders[key].reset();
    ChatLib.chat(`${LOGO + GREEN}Successfully reset powder tracker!`);
}).setName("resetPowder");

/**
 * Update the powder tracking values based on the current time.
 * @param {Object} powder - The powder object to update.
 * @param {Number} current - The current time.
 */
function updatePowder(powder, current) {
    if (powder.now !== current && powder.now !== 0) powder.since = 0;
    if (powder.start === 0) powder.start = current;
    if (current < powder.now) powder.start -= powder.now - current; 
    powder.now = current;

    if (powder.since < settings.powderTracker * 60) {
        powder.since += 1;
        powder.time += 1;
    }
}

/**
 * Updates powder overlay every second.
 */
registerWhen(register("step", () => {
    if (getPaused() || !World.isLoaded()) return;
    const tablist = TabList.getNames();
    const powderIndex = tablist.findIndex(line => line === "§r§9§lPowders:§r");
    if (powderIndex === undefined || powderIndex === -1) return;
    const currentMithril = parseInt(tablist[powderIndex + 1].removeFormatting().trim().split(' ')[1].replace(/\D/g, ''));
    const currentGemstone = parseInt(tablist[powderIndex + 2].removeFormatting().trim().split(' ')[1].replace(/\D/g, ''));
    const currentGlacite = parseInt(tablist[powderIndex + 3].removeFormatting().trim().split(' ')[1].replace(/\D/g, ''));
    updatePowder(powders.Mithril, currentMithril);
    updatePowder(powders.Gemstone, currentGemstone);
    updatePowder(powders.Glacite, currentGlacite);

    // Set HUD
    const timeDisplay = powders.Mithril.since < settings.powderTracker * 60 ? getTime(powders.Mithril.time) : 
        powders.Gemstone.since < settings.powderTracker * 60 ? getTime(powders.Gemstone.time) : `${RED}Inactive`;
    powderOverlay.message = 
`${DARK_GREEN + BOLD}Mithril: ${WHITE + commafy(powders.Mithril.getGain())} ᠅
${DARK_GREEN + BOLD}Rate: ${WHITE + commafy(powders.Mithril.getRate())} ᠅/hr
${LIGHT_PURPLE + BOLD}Gemstone: ${WHITE + commafy(powders.Gemstone.getGain())} ᠅
${LIGHT_PURPLE + BOLD}Rate: ${WHITE + commafy(powders.Gemstone.getRate())} ᠅/hr
${AQUA + BOLD}Glacite: ${WHITE + commafy(powders.Glacite.getGain())} ᠅
${AQUA + BOLD}Rate: ${WHITE + commafy(powders.Glacite.getRate())} ᠅/hr
${BLUE + BOLD}Time Passed: ${WHITE + timeDisplay}`;
}).setFps(1), () => (getWorld() === "Crystal Hollows" || getWorld() === "Dwarven Mines") && settings.powderTracker !==0);

/**
 * 2x Powder Tracking => announce to VolcAddons discord webhook
 * 
 * Yes this is obfuscated and no this is not a rat.
 * Yes I know this is not 100% secure,
 * thus I would like to take this chance to kindly ask you to refrain from sending anything malicious to the webhook :)
 * Pretty please with a cherry on top!
 */

registerWhen(register("chat", () => {
    ChatLib.chat(`${getWorld()}: ⚑ The 2x Powder event started!`);
    request({
        url: "https://discord.com/api/webhooks/1146269174042218546/d0qxj2lvk_ogIY3iy5wNLUloOEs6WqAOeJx7Sj0buanHKcmVc2LsSKrvXkKMcuZGXFsl",
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "User-Agent": "Mozilla/5.0"
        },
        body: {
            "username": "VolcCookons",
            "avatar_url": getWaifu(),
            "embeds": [{
                "author": {
                    "name": Player.getName(),
                    "icon_url": `https://www.mc-heads.net/avatar/${Player.getName()}`
                },
                "color": 0,
                "description": `${getWorld()}: ⚑ The 2x Powder event started!`,
                "timestamp": new Date()
            }]
        }
    });
}).setCriteria("                          2X POWDER STARTED!"), () => settings.powderAlert);
