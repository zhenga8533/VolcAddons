import settings from "../../settings";
import { BOLD, GOLD, RED, WHITE } from "../../utils/constants";
import { commafy, getTime } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { Stat, data, getPaused, registerWhen } from "../../utils/variables";


/**
 * Variables used to track and display coin tracker.
 */
const piggy = new Stat();
register("command", () => { piggy.reset() }).setName("resetCoins");
const coinExample = 
`${GOLD}${BOLD}Gained: ${WHITE}COUNTING
${GOLD}${BOLD}Time Passed: ${WHITE}ME
${GOLD}${BOLD}Rate: ${WHITE}MONEY`;
const coinOverlay = new Overlay("coinTracker", ["all"], data.ML, "moveCoins", coinExample);

/**
 * Tracks Piggybank in Scoreboard for changes in coins and updates Coins Overlay every second.
 */
registerWhen(register("step", () => {
    // Get cha ching from purse
    let purse = Scoreboard.getLines().find((line) => line.getName().includes("Purse:"));
    if (getPaused() || purse === undefined) return;
    purse = parseInt(purse.getName().removeFormatting().split(" ")[1].replace(/\D/g,''));

    // Get starting balance
    if (piggy.since >= settings.coinTracker * 60) {
        piggy.start = purse;
        piggy.time = 0;
    }

    // Calculate changes
    if (purse != piggy.now && piggy.now) piggy.since = 0;
    piggy.time++;
    piggy.now = purse;
    piggy.gain = piggy.now - piggy.start;
    piggy.rate = piggy.gain / piggy.time * 3600;
    
    // Update GUI
    const timeDisplay = piggy.since < settings.coinTracker * 60 ? getTime(piggy.time) : `${RED}Inactive`;
    coinOverlay.message = 
`${GOLD}${BOLD}Gained: ${WHITE}${commafy(piggy.gain)} ¢
${GOLD}${BOLD}Time Passed: ${WHITE}${timeDisplay}
${GOLD}${BOLD}Rate: ${WHITE}${commafy(piggy.rate)} ¢/hr`;
}).setFps(1), () => settings.coinTracker);
