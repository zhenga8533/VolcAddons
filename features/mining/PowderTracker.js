import location from "../../utils/location";
import settings from "../../utils/settings";
import { AQUA, BLUE, BOLD, DARK_GREEN, GRAY, GREEN, LIGHT_PURPLE, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy, formatTime } from "../../utils/functions/format";
import { Overlay } from "../../utils/overlay";
import { registerWhen } from "../../utils/register";
import { Stat, getPaused } from "../../utils/stat";
import { data } from "../../utils/data";


/**
 * Variables used to track and display current event and powder.
 */
const powders = {
    "Mithril": new Stat(),
    "Gemstone": new Stat(),
    "Glacite": new Stat()
}
const powderExample =
`${DARK_GREEN + BOLD}Mithril: ${WHITE}I ${GRAY}(wake ᠅/hr)
${LIGHT_PURPLE + BOLD}Gemstone: ${WHITE}up ${GRAY}(to ᠅/hr)
${AQUA + BOLD}Glacite: ${WHITE}the ${GRAY}(sounds ᠅/hr)
${BLUE + BOLD}Time: ${RED}Inactive`;
const powderOverlay = new Overlay("powderTracker", data.PL, "movePowder", powderExample, ["Dwarven Mines", "Crystal Hollows"]);

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
    const currentMithril = parseInt(tablist[powderIndex + 1].removeFormatting().trim().split(' ')[1]?.replace(/\D/g, ''));
    const currentGemstone = parseInt(tablist[powderIndex + 2].removeFormatting().trim().split(' ')[1]?.replace(/\D/g, ''));
    if (currentMithril !== undefined) updatePowder(powders.Mithril, currentMithril);
    if (currentGemstone !== undefined) updatePowder(powders.Gemstone, currentGemstone);
    if (location.getWorld() === "Dwarven Mines") {
        const currentGlacite = parseInt(tablist[powderIndex + 3].removeFormatting().trim().split(' ')[1]?.replace(/\D/g, ''));
        if (currentGlacite !== undefined) updatePowder(powders.Glacite, currentGlacite);
    }

    // Get max valid time
    let displayTime = 0;
    Object.keys(powders).forEach(powder => {
        if (powders[powder].time > displayTime && powders[powder].since < settings.powderTracker * 60) displayTime = powders[powder].time;
    });

    // Set HUD
    const timeDisplay = displayTime !== 0 ? formatTime(displayTime) : `${RED}Inactive`;
    powderOverlay.setMessage( 
`${DARK_GREEN + BOLD}Mithril: ${WHITE + commafy(powders.Mithril.getGain()) + GRAY} (${commafy(powders.Mithril.getRate())} ᠅/hr)
${LIGHT_PURPLE + BOLD}Gemstone: ${WHITE + commafy(powders.Gemstone.getGain()) + GRAY} (${commafy(powders.Gemstone.getRate())} ᠅/hr)
${AQUA + BOLD}Glacite: ${WHITE + commafy(powders.Glacite.getGain()) + GRAY} (${commafy(powders.Glacite.getRate())} ᠅/hr)
${BLUE + BOLD}Time: ${WHITE + timeDisplay}`);
}).setFps(1), () => (location.getWorld() === "Crystal Hollows" || location.getWorld() === "Dwarven Mines") && settings.powderTracker !== 0);
