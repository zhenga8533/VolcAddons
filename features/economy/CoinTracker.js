import { BOLD, GOLD, GREEN, LOGO, RED, WHITE } from "../../utils/Constants";
import { data } from "../../utils/Data";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { Stat, getPaused } from "../../utils/Stat";
import { commafy, formatTime } from "../../utils/functions/format";

/**
 * Variables used to track and display coin tracker.
 */
const piggy = new Stat("coin");
register("command", () => {
  piggy.reset();
  ChatLib.chat(`${LOGO + GREEN}Successfully reset coin tracker!`);
}).setName("resetCoins");
const coinExample = `${GOLD + BOLD}Gained: ${WHITE}COUNTING
${GOLD + BOLD}Time: ${WHITE}ME
${GOLD + BOLD}Rate: ${WHITE}MONEY`;
const coinOverlay = new Overlay("coinTracker", data.ML, "moveCoins", coinExample);

/**
 * Reset coin tracker when switching profiles.
 */
registerWhen(
  register("chat", () => {
    piggy.reset();
  }).setCriteria("Switching to profile ${profile}..."),
  () => Settings.coinTracker !== 0
);

/**
 * Tracks Piggybank in Scoreboard for changes in coins and updates Coins Overlay every second.
 */
registerWhen(
  register("step", () => {
    if (!World.isLoaded()) return;
    // Get cha ching from purse
    let purse = Scoreboard?.getLines()?.find((line) => line.getName().includes("Purse:"));
    if (getPaused() || purse === undefined) return;
    purse = parseInt(purse.getName().removeFormatting().split(" ")[1].replace(/\D/g, ""));

    // Get starting balance
    if (piggy.since >= Settings.coinTracker * 60) {
      piggy.start = purse;
      piggy.time = 1;
    }

    // Calculate changes
    if (purse !== piggy.now && piggy.now) piggy.since = 0;
    piggy.time++;
    piggy.now = purse;

    // Update GUI
    const timeDisplay = piggy.since < Settings.coinTracker * 60 ? formatTime(piggy.time) : `${RED}Inactive`;
    coinOverlay.setMessage(
      `${GOLD + BOLD}Gained: ${WHITE + commafy(piggy.getGain())} ¢
${GOLD + BOLD}Time: ${WHITE + timeDisplay}
${GOLD + BOLD}Rate: ${WHITE + commafy(piggy.getRate())} ¢/hr`
    );
  }).setFps(1),
  () => Settings.coinTracker !== 0
);
