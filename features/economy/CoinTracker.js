import settings from "../../utils/settings";
import { BOLD, GOLD, GREEN, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy, getTime } from "../../utils/functions/format";
import { Overlay } from "../../utils/overlay";
import { Stat, data, getPaused, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Variables used to track and display coin tracker.
 */
const piggy = new Stat();
register("command", () => {
    piggy.reset();
    ChatLib.chat(`${LOGO + GREEN}Successfully reset coin tracker!`);
}).setName("resetCoins");
const coinExample = 
`${GOLD + BOLD}Gained: ${WHITE}COUNTING
${GOLD + BOLD}Time Passed: ${WHITE}ME
${GOLD + BOLD}Rate: ${WHITE}MONEY`;
const coinOverlay = new Overlay("coinTracker", ["all"], () => getWorld() !== undefined, data.ML, "moveCoins", coinExample);

/**
 * Tracks Piggybank in Scoreboard for changes in coins and updates Coins Overlay every second.
 */
registerWhen(register("step", () => {
    // Get cha ching from purse
    let purse = Scoreboard?.getLines()?.find(line => line.getName().includes("Purse:"));
    if (getPaused() || purse === undefined) return;
    purse = parseInt(purse.getName().removeFormatting().split(" ")[1].replace(/\D/g,''));

    // Get starting balance
    if (piggy.since >= settings.coinTracker * 60) {
        piggy.start = purse;
        piggy.time = 1;
    }

    // Calculate changes
    if (purse !== piggy.now && piggy.now) piggy.since = 0;
    piggy.time++;
    piggy.now = purse;
    
    // Update GUI
    const timeDisplay = piggy.since < settings.coinTracker * 60 ? getTime(piggy.time) : `${RED}Inactive`;
    coinOverlay.message = 
`${GOLD + BOLD}Gained: ${WHITE + commafy(piggy.getGain())} ¢
${GOLD + BOLD}Time Passed: ${WHITE + timeDisplay}
${GOLD + BOLD}Rate: ${WHITE + commafy(piggy.getRate())} ¢/hr`;
}).setFps(1), () => settings.coinTracker !== 0);
