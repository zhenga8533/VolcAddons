import settings from "../../settings";
import { AQUA, BOLD, DARK_AQUA, DARK_PURPLE, DARK_RED, GOLD, GREEN, RED, WHITE } from "../../utils/constants";
import { commafy, formatNumber, getTime } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";
import { getTier, getWorld } from "../../utils/worlds";
import { getBazaar } from "../economy/Economy";
import { getItemValue } from "../economy/ItemPrice";


/**
 * Variables used to calculate Kuudra chest profit.
 */
const KEY_COST = [[200000, 2], [400000, 6], [750000, 20], [1500000, 60], [3000000, 120]];

/**
 * Variables used to track Kuudra session profit.
 */
let downtime = 300;
let chestOpened = false;
let chestProfit = 0;
let kuudraSession = {
    "profit": 0,
    "chests": 0,
    "average": 0,
    "time": 0,
    "rate": 0
};
register("command", () => {
    downtime = 300;
    kuudraSession = {
        "profit": 0,
        "chests": 0,
        "average": 0,
        "time": 0,
        "rate": 0
    };
    data.kuudraSession = {
        "profit": 0,
        "chests": 0,
        "average": 0,
        "time": 0,
        "rate": 0
    };
}).setName("resetKPT");
register("worldUnload", () => { chestOpened = false });

/**
 * Variables used to represent and render overlay.
 */
const profitExample =
`${GOLD}${BOLD}Profit/Loss: ${GREEN}Vaporean

${AQUA}${BOLD}Primary: ${GREEN}Is
${DARK_AQUA}${BOLD}Secondary: ${GREEN}The
${DARK_PURPLE}${BOLD}Teeth: ${GREEN}Most
${RED}${BOLD}Essence: ${GREEN}Compatible
${DARK_RED}${BOLD}Key: ${RED}Pokemon...`;
const profitOverlay = new Overlay("kuudraProfit", ["Kuudra", "misc"], () => Player.getContainer().getName() === "Paid Chest", data.KL, "moveKP", profitExample);

const coinageExample =
`${DARK_RED}${BOLD}Profit: ${WHITE}And
${DARK_RED}${BOLD}Chests: ${WHITE}He
${DARK_RED}${BOLD}Average: ${WHITE}Asked
${DARK_RED}${BOLD}Time Passed: ${WHITE}The
${DARK_RED}${BOLD}Rate: ${WHITE}Man`;
const coinageOverlay = new Overlay("kuudraProfitTracker", ["Kuudra", "Crimson Isle"], () => downtime < 300, data.ZL, "moveKPT", coinageExample);

/**
 * This function updates the profit tracker and associated metrics based on whether a chest was opened.
 * If a chest was opened, it adds the chest profit to the session's profit, increments the chest count,
 * and calculates the new average profit per chest. If a chest was not opened, it increments the time count.
 * The function then calculates and updates the rate of profit per hour. Finally, it constructs and updates
 * the coinage overlay message with the relevant profit tracking information.
 *
 * @param {boolean} openedChest - Indicates whether a chest was opened (true) or not (false).
 */
function updateProfitTracker(openedChest) {
    if (openedChest) {
        kuudraSession.profit += chestProfit;
        kuudraSession.chests++;
        kuudraSession.average = kuudraSession.profit / kuudraSession.chests;
        
        data.kuudraSession.profit += chestProfit;
        data.kuudraSession.chests++;
        data.kuudraSession.average = data.kuudraSession.profit / data.kuudraSession.chests;
    } else {
        kuudraSession.time++;
        data.kuudraSession.time++;
    }
    kuudraSession.rate = kuudraSession.profit / kuudraSession.time * 3600;
    data.kuudraSession.rate = kuudraSession.profit / kuudraSession.time * 3600;

    const profitView = settings.kuudraProfitTracker == 1 ? data.kuudraSession : kuudraSession;
    coinageOverlay.message =
`${DARK_RED}${BOLD}Profit: ${WHITE}${formatNumber(profitView.profit.toFixed(0))} ¢
${DARK_RED}${BOLD}Chests: ${WHITE}${commafy(profitView.chests)} chests
${DARK_RED}${BOLD}Average: ${WHITE}${formatNumber(profitView.average.toFixed(0))} ¢/chest
${DARK_RED}${BOLD}Time Passed: ${WHITE}${getTime(profitView.time)}
${DARK_RED}${BOLD}Rate: ${WHITE}${formatNumber(profitView.rate.toFixed(0))} ¢/hr`
}

/**
 * This code block contains multiple event handlers that contribute to Kuudra profit tracking.
 * 
 * The first event handler triggers when a specific slot in the "Paid Chest" container is clicked.
 * It checks conditions to determine whether to update the profit tracker and sets `chestOpened` accordingly.
 * 
 * @param {number} x - The x-coordinate of the mouse click.
 * @param {number} y - The y-coordinate of the mouse click.
 * @param {number} button - The mouse button pressed during the interaction.
 * @param {object} gui - The GUI object associated with the interaction.
 */
registerWhen(register("guiMouseClick", (x, y, button, gui) => {
    if (Player.getContainer().getName() !== "Paid Chest" || gui?.getSlotUnderMouse()?.field_75222_d != 31 || chestOpened) return;
    downtime = 0;
    updateProfitTracker(true);
    chestOpened = true;
}), () => getWorld() === "Kuudra" && settings.kuudraProfitTracker);

/**
 * Track time and downtime of runs.
 */
registerWhen(register("step", () => {
    downtime++;
    if (downtime >= 300) return;
    updateProfitTracker(false);
}).setFps(1), () => settings.kuudraProfitTracker);
registerWhen(register("chat", () => {
    downtime = 0;
}).setCriteria("[NPC] Elle: Talk with me to begin!"), () => settings.kuudraProfitTracker);

/**
 * Updates Kuudra chest profit data and overlay on chest open.
 */
registerWhen(register("guiOpened", () => {
    delay(() => {
        const container = Player.getContainer();
        if (container.getName() !== "Paid Chest") return;
        const bazaar = getBazaar();
        const tier = getTier();

        const primary = getItemValue(container.getStackInSlot(11));
        let secondary = container.getStackInSlot(12);
        secondary = bazaar[secondary.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id")]?.[0] || getItemValue(secondary);
        let essence = container.getStackInSlot(14).getNBT().toObject().tag.display.Name;
        essence = parseInt(essence.slice(essence.indexOf('x') + 1)) * bazaar.ESSENCE_CRIMSON[0];
        const teeth = settings.maxChili ? (bazaar.ENCHANTMENT_TABASCO_3[0] - 64*bazaar.CHILI_PEPPER[1])/6 * Math.ceil(tier / 2) : 0;
        const cost = KEY_COST[tier - 1][0] + KEY_COST[tier - 1][1] * Math.min(bazaar.ENCHANTED_RED_SAND[1], bazaar.ENCHANTED_MYCELIUM[1]);
        const value = primary + secondary + essence + teeth;
        chestProfit = value - cost;

        const profitMessage = chestProfit >= 0 ? `${GREEN}+${commafy(chestProfit)}` : `${RED}-${commafy(chestProfit)}`;
        profitOverlay.message = 
`${GOLD}${BOLD}Profit/Loss: ${profitMessage}

${AQUA}${BOLD}Primary: ${GREEN}+${commafy(primary)}
${DARK_AQUA}${BOLD}Secondary: ${GREEN}+${commafy(secondary)}
${DARK_PURPLE}${BOLD}Teeth: ${GREEN}+${commafy(teeth)}
${RED}${BOLD}Essence: ${GREEN}+${commafy(essence)}
${DARK_RED}${BOLD}Key: ${RED}-${commafy(cost)}`;
    }, 250);
}), () => getWorld() === "Kuudra");
