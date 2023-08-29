import { request } from "../../../axios";
import settings from "../../settings";
import { BLUE, BOLD, DARK_GREEN, GREEN, LIGHT_PURPLE, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy, getTime } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { Stat, data, getPaused, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getWaifu, setWaifu } from "../general/PartyCommands";


/**
 * Variables used to track and display current event and powder.
 */
const powders = {
    "Mithril": new Stat(),
    "Gemstone": new Stat()
}
const powderExample =
`${DARK_GREEN}${BOLD}Mithril Powder: ${WHITE}Hello
${DARK_GREEN}${BOLD}Mithril Rate: ${WHITE}@
${LIGHT_PURPLE}${BOLD}Gemstone Powder: ${WHITE}Banana
${LIGHT_PURPLE}${BOLD}Gemstone Rate: ${WHITE}The
${BLUE}${BOLD}Time Passed: ${WHITE}Bot`;
const powderOverlay = new Overlay("powderTracker", ["Dwarven Mines", "Crystal Hollows"], () => true, data.PL, "movePowder", powderExample);

/**
 * Command to reset powder overlay.
 */
register("command", () => {
    for (let key in powders)
        powders[key].reset();
    ChatLib.chat(`${LOGO} ${GREEN}Successfully reset powder tracker!`);
}).setName("resetPowder");

/**
 * Update the powder tracking values based on the current time.
 * @param {object} powder - The powder object to update.
 * @param {number} current - The current time.
 */
function updatePowder(powder, current) {
    if (powder.now !== current && powder.now !== 0) powder.since = 0;
    if (powder.start === 0) powder.start = current;
    if (current < powder.now) powder.start -= powder.now - current; 
    powder.now = current;
    powder.gain = powder.now - powder.start;

    if (powder.since < settings.powderTracker * 60) {
        powder.since += 1;
        powder.time += 1;
        powder.rate = powder.gain / powder.time * 3600;
    }
}

/**
 * Updates powder overlay every second.
 */
registerWhen(register("step", () => {
    if (getPaused() || (getWorld() !== "Crystal Hollows" && getWorld() !== "Dwarven Mines")) return;
    const tabLines = TabList.getNames();
    const powderIndex = tabLines.findIndex(line => line === "§r§9§l᠅ Powders§r");
    if (powderIndex === -1) return;
    const currentMithril = parseInt(tabLines[powderIndex + 1].removeFormatting().trim().split(' ')[2].replace(/\D/g, ''));
    const currentGemstone = parseInt(tabLines[powderIndex + 2].removeFormatting().trim().split(' ')[2].replace(/\D/g, ''));
    updatePowder(powders.Mithril, currentMithril);
    updatePowder(powders.Gemstone, currentGemstone);

    // Set HUD
    const timeDisplay = powders.Mithril.since < settings.powderTracker * 60 ? getTime(powders.Mithril.time) : 
        powders.Gemstone.since < settings.powderTracker * 60 ? getTime(powders.Gemstone.time) : `${RED}Inactive`;
    powderOverlay.message = 
`${DARK_GREEN}${BOLD}Mithril Powder: ${WHITE}${commafy(powders.Mithril.gain)} ᠅
${DARK_GREEN}${BOLD}Mithril Rate: ${WHITE}${commafy(powders.Mithril.rate)} ᠅/hr
${LIGHT_PURPLE}${BOLD}Gemstone Powder: ${WHITE}${commafy(powders.Gemstone.gain)} ᠅
${LIGHT_PURPLE}${BOLD}Gemstone Rate: ${WHITE}${commafy(powders.Gemstone.rate)} ᠅/hr
${BLUE}${BOLD}Time Passed: ${WHITE}${timeDisplay}`;
}).setFps(1), () => (getWorld() === "Crystal Hollows" || getWorld() === "Dwarven Mines") && settings.powderTracker !==0);

/**
 * 2x Powder Tracking
 */
const event = " ⚑ The 2x Powder event started! This is a passive event! It's happening everywhere in the Crystal Hollows!";
registerWhen(register("chat", () => {
    if (eventSent) return;
    setWaifu();
    let player = Player.getName();
    request({
        url: "https://discord.com/api/webhooks/1146109301379846215/Rm9KUzS9eIEJbJJFeasPpTK32yxhrMZhbpJUveHB5Iimv2XzjmKHy1QOff3-TXfUY6xE",
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
                    "name": player,
                    "icon_url": `https://www.mc-heads.net/avatar/${player}`
                },
                "color": 65535,
                "description": event,
                "timestamp": new Date()
            }]
        }
    });
}).setCriteria("                          2X POWDER STARTED!"), () => settings.powderAlert);
