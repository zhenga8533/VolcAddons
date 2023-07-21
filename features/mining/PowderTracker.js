import settings from "../../settings";
import { BLUE, BOLD, DARK_GREEN, LIGHT_PURPLE, RED, WHITE } from "../../utils/constants";
import { commafy, getTime } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { Stat, data, getPaused, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";

const WitherClass = Java.type('net.minecraft.entity.boss.EntityWither').class;
let doublePowder = false;

// Coin tracking
const powders = {
    "Mithril": new Stat(),
    "Gemstone": new Stat()
}

register("command", () => {
    for (let key in powders)
        powders[key].reset();
}).setName("resetPowder");

// HUD
const powderExample =
`${DARK_GREEN}${BOLD}Mithril Powder: ${WHITE}Hello
${DARK_GREEN}${BOLD}Mithril Rate: ${WHITE}@
${LIGHT_PURPLE}${BOLD}Gemstone Powder: ${WHITE}Banana
${LIGHT_PURPLE}${BOLD}Gemstone Rate: ${WHITE}The
${BLUE}${BOLD}Time Passed: ${WHITE}Bot`;
const powderOverlay = new Overlay("powderTracker", ["Dwarven Mines", "Crystal Hollows"], data.PL, "movePowder", powderExample);


// Check for 2x
registerWhen(register("step", () => {
    withers = World.getAllEntitiesOfType(WitherClass);
    festivity = withers.find(wither => wither.getName().includes("2X POWDER"));
    if (festivity != undefined) doublePowder = true;
}).setFps(1), () => getWorld() == "Crystal Hollows" || getWorld() == "Dwarven Mines");

// Event start
registerWhen(register("chat", (festivity) => {
    if (festivity.includes("2X POWDER")) doublePowder = true;
}).setCriteria("${festivity} STARTED!"), () => (getWorld() == "Crystal Hollows" || getWorld() == "Dwarven Mines") && settings.powderTracker);

// Event end
registerWhen(register("chat", (festivity) => {
    if (festivity.includes("2X POWDER")) doublePowder = false;
}).setCriteria("${festivity} ENDED!"), () => (getWorld() == "Crystal Hollows" || getWorld() == "Dwarven Mines") && settings.powderTracker);
registerWhen(register("worldUnload", () => {
    doublePowder = false
}), () => (getWorld() == "Crystal Hollows" || getWorld() == "Dwarven Mines") && settings.powderTracker);


// Track gemstone powder
registerWhen(register("chat", (amount, type) => { // Chests
    if (getPaused()) return;
    
    let powder = powders[type];
    powder.now += doublePowder ? parseInt(amount) * 2 : parseInt(amount);
    powder.gain = powder.now - powder.start;
    powder.since = 0;
}).setCriteria("You received +${amount} ${type} Powder."),
() => (getWorld() == "Crystal Hollows" || getWorld() == "Dwarven Mines") && settings.powderTracker);

// Update powder data
registerWhen(register("step", () => {
    if (getPaused()) return;

    // Update powder data every second
    for (let key in powders) {
        let powder = powders[key];
        if (powder.since < settings.powderTracker * 60) {
            powder.since += 1;
            powder.time += 1;
            powder.rate = powder.gain / powder.time * 3600;
        }
    }

    // Set HUD
    const timeDisplay = powders.Gemstone.since < settings.powderTracker * 60 ? getTime(powders.Gemstone.time) : `${RED}Inactive`;
    powderOverlay.message = 
`${DARK_GREEN}${BOLD}Mithril Powder: ${WHITE}${commafy(powders.Mithril.gain)} ᠅
${DARK_GREEN}${BOLD}Mithril Rate: ${WHITE}${commafy(powders.Mithril.rate)} ᠅/hr
${LIGHT_PURPLE}${BOLD}Gemstone Powder: ${WHITE}${commafy(powders.Gemstone.gain)} ᠅
${LIGHT_PURPLE}${BOLD}Gemstone Rate: ${WHITE}${commafy(powders.Gemstone.rate)} ᠅/hr
${BLUE}${BOLD}Time Passed: ${WHITE}${timeDisplay}`;
}).setFps(1),
() => (getWorld() == "Crystal Hollows" || getWorld() == "Dwarven Mines") && settings.powderTracker);
