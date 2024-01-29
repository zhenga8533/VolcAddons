import request from "../../../requestV2";
import settings from "../../utils/settings";
import { formatNumber, getTime, unformatNumber } from "../../utils/functions/format";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { getBazaar } from "../economy/Economy";
import { getWaifu } from "../party/PartyCommands";


/**
 * Variables used to represent possible crop drops.
 * "Crop": [average drop, npc, emoji]
 * "Crop Trade": "Crop ID"
 */
const CROP_DROP = {
    "Crops": [1.0, 9, ":bread:"],
    "Carrots": [3.71, 3, ":carrot:"],
    "Potatoes": [3.71, 3, ":potato:"],
    "Pumpkin": [1.0, 10, "jack_o_lantern:"],
    "Sugar cane": [2.0, 4, ":candy:"],
    "Melon": [4.64, 2, ":watermelon:"],
    "Cactus": [2.0, 3, ":cactus:"],
    "Cocoa": [3.0, 3, ":coffee:"],
    "Mushroom": [1.0, 10, ":mushroom:"],
    "Nether Wart": [3.0, 4, ":hotsprings:"],
};
const CROP_TRADES = {
    "ENCHANTED_HAY_BALE": "ENCHANTED_HAY_BLOCK",
    "TIGHTLY-TIED_HAY_BALE": "TIGHTLY_TIED_HAY_BALE",
    "JACK_O'_LANTERN": "JACK_O_LANTERN",
    "ENCHANTED_RED_MUSHROOM_BLOCK": "ENCHANTED_HUGE_MUSHROOM_2",
    "ENCHANTED_BROWN_MUSHROOM_BLOCK": "ENCHANTED_HUGE_MUSHROOM_1",
    "ENCHANTED_COCOA_BEAN": "ENCHANTED_COCOA",
    "ENCHANTED_NETHER_WART": "ENCHANTED_NETHER_STALK",
    "MUTANT_NETHER_WART": "MUTANT_NETHER_STALK",
    "ENCHANTED_RAW_RABBIT": "ENCHANTED_RABBIT"
}

/**
 * Encapsulates farming-related statistics and interactions.
 * Provides methods to reset and manage crop, visitor, and player statistics.
 */
class FarmingStat {
    /**
     * Constructor for FarmingStat.
     * Initializes the cropStats, visitorStats, and playerStats objects.
     */
    constructor() {
        this.cropStats = {};
        this.visitorStats = {};
        this.playerStats = {};
        this.resetStats();
    }

    /**
     * Reset all statistics to their default values.
     * Resets the cropStats, visitorStats, and playerStats objects.
     */
    resetStats() {
        this.cropStats = {};
        this.visitorStats = {
            "arrived": 0,
            "accepted": 0,
            "declined": 0,
            "FarmingXP": 0,
            "GardenExperience": 0,
            "Copper": 0,
            "loss": 0,
            "uncommon": 0,
            "rare": 0,
            "legendary": 0
        };
        this.playerStats = {
            "BRONZE": 0,
            "SILVER": 0,
            "GOLD": 0,
            "interruptions": 0,
            "deaths": 0,
            "downtime": 0
        };
    }
}
const farmingStats = new FarmingStat(); 

/**
 * Send webhook data using POST request.
 */
function sendWebhook() {
    if (!World.isLoaded()) return;

    // Fetch values
    const cropStats = farmingStats.cropStats;
    let cropMessages = ["", "", ""];
    for (crop in cropStats) {
        let cropStat = cropStats[crop];
        cropMessages[0] += `${CROP_DROP[crop][2]}: ${formatNumber(cropStat[0])}\n`;
        cropMessages[1] += `${formatNumber(cropStat[1])}\n`;
        const milestone = TabList?.getNames().find(name => name.includes("Milestone:")).removeFormatting().split(' ').slice(-2);
        cropMessages[2] += `${cropStat[2]} => ${milestone.toString().replace(":,", " (")})\n`;
    }
    
    const visitorStats = farmingStats.visitorStats;
    const playerStats = farmingStats.playerStats;
    
    // Send data to webhook
    request({
        url: settings.gardenWebhook,
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "User-Agent": "Mozilla/5.0"
        },
        body: {
            "username": "Dr. VolcAddons",
            "avatar_url": getWaifu(),
            // "content": "content here",
            "embeds": [{
                "title": "Cultivational Statistical Analysis",
                "color": 16777215,
                "description": "Um, acktually :nerd::point_up_2:",
                "footer": {
                    "text": "by @grapefruited | hate macroers.",
                    "icon_url": "https://i.imgur.com/TCYjlzP.jpg"
                },
                "fields": [
                    {
                        "name": "Crops",
                        "value": cropMessages[0],
                        "inline": true
                    },
                    {
                        "name": "Coinage",
                        "value": cropMessages[1],
                        "inline": true
                    },
                    {
                        "name": "Milestones",
                        "value": cropMessages[2],
                        "inline": true
                    },
                    {
                        "name": "Visitors",
                        "value": `Arrived: ${visitorStats.arrived}\nAccepted: ${visitorStats.accepted}\nRefused: ${visitorStats.declined}`,
                        "inline": true
                    },
                    {
                        "name": "Tiers",
                        "value": `Uncommon: ${visitorStats.uncommon}\nRare: ${visitorStats.rare}\nLegendary: ${visitorStats.legendary}`,
                        "inline": true
                    },
                    {
                        "name": "Gains",
                        "value": `Farming XP: +${visitorStats.FarmingXP}\nGarden XP: +${visitorStats.GardenExperience}\nCopper: +${visitorStats.Copper}\nCost: -${formatNumber(visitorStats.loss)}`,
                        "inline": true
                    },
                    {
                        "name": "Contests",
                        "value": `:third_place:: ${playerStats.BRONZE}\n:second_place:: ${playerStats.SILVER}\n:first_place:: ${playerStats.GOLD}`,
                        "inline": true
                    },
                    {
                        "name": "Server Stats",
                        "value": `Interuptions: ${playerStats.interruptions}\nDeaths: ${playerStats.deaths}\nDowntime: ${getTime(playerStats.downtime)}`,
                        "inline": true
                    }
                ]
            }]
        }
    }).then(() => farmingStats.resetStats());
}

/**
 * Updates the farmingFortune variable from the TabList information.
 * Retrieves Farming Fortune value if the player is in the Garden world.
 */
let downtime = 0;
let farmingFortune = 0;
registerWhen(register("step", () => {
    if (!World.isLoaded()) return;

    const tablist = TabList.getNames();
    const fortune = tablist.find(line => line.includes("Farming Fortune"));
    if (fortune === undefined) return;
    farmingFortune = parseInt(fortune.substring(fortune.indexOf('☘') + 1));
}).setDelay(10), () => getWorld() === "Garden" && settings.gardenWebhook !== "" && settings.webhookTimer !== 0);

/**
 * Updates crop statistics for a harvested crop block.
 * Calculates drop amounts, values, and updates cropStats.
 */
registerWhen(register("blockBreak", (block) => {
    const blockName = block.type.getName();
    if (!(blockName in CROP_DROP)) return;
    farmingStats.cropStats[blockName] = farmingStats.cropStats[blockName] ?? [0, 0, null];
    if (farmingStats.cropStats[blockName][2] === null) {
        const milestone = TabList.getNames().find(name => name.includes("Milestone:")).removeFormatting().split(' ');
        farmingStats.cropStats[blockName][2] = milestone.slice(-2).toString().replace(":,", " (") + ")";
    }
    const dropAmount = CROP_DROP[blockName][0] * farmingFortune/100;
    farmingStats.cropStats[blockName][0] += dropAmount;
    farmingStats.cropStats[blockName][1] += dropAmount * CROP_DROP[blockName][1];
    downtime = 0;
}), () => getWorld() === "Garden" && settings.gardenWebhook !== "" && settings.webhookTimer !== 0);

/**
 * Updates farm visitor statistics based on their arrival.
 * Increments the "arrived" count and categorizes visitors into rarity tiers.
 *
 * @param {Array} visitor - An array representing the visitor, with index 1 indicating rarity.
 */
registerWhen(register("chat", (visitor) => {
    farmingStats.visitorStats.arrived++;
    switch(visitor[1]) {
        case 'a':
            farmingStats.visitorStats.uncommon++;
            break;
        case '9':
            farmingStats.visitorStats.rare++;
            break;
        case '6':
            farmingStats.visitorStats.legendary++;
            break;
    }
}).setCriteria("&r&a&r${visitor} &r&ehas arrived on your &r&bGarden&r&e!&r"),
() => getWorld() === "Garden" && settings.gardenWebhook !== "" && settings.webhookTimer !== 0);

/**
 * Handles mouse click interactions in a GUI related to trade offers.
 * Analyzes clicked items, lore, and interactions to update visitor statistics.
 */
registerWhen(register("guiMouseClick", (x, y, button, gui) => {
    // Get clicked item
    const clickedSlot = gui?.getSlotUnderMouse()?.field_75222_d;
    if (clickedSlot === undefined) return;
    const item = Player.getContainer().getStackInSlot(clickedSlot);
    if (item === null) return;
    downtime = 0;
    const itemName = item.getName();
    if (itemName=== "§cRefuse Offer") {
        farmingStats.visitorStats.declined++;
        return;
    } else if (itemName !== "§aAccept Offer") return;
    const tradeLore = Object.entries(item.getLore());
    if (tradeLore.pop()?.[1] === "§5§o§cMissing items to accept!") return;

    const bazaar = getBazaar();
    let itemsReached = false;
    let rewardsReached = false;

    for ([lineNumber, lineContent] of tradeLore) {
        if (lineContent === "§5§o§7Items Required:") itemsReached = true
        else if (lineContent === "§5§o§7Rewards:") rewardsReached = true;
        else if (lineContent === "§5§o") {
            itemsReached = false;
            rewardsReached = false;
        } else if (itemsReached) {
            let item = lineContent.removeFormatting().trim().split(' ');
            let amount = parseInt(item.pop().replace(/[^0-9]/g, ''));
            let product = item.join('_').toUpperCase();
            let productCost = amount * bazaar?.[CROP_TRADES?.[product] ?? product]?.[0] ?? 0;
            if (!isNaN(productCost)) farmingStats.visitorStats.loss += productCost;
        }
        else if (rewardsReached) {
            let reward = lineContent.removeFormatting().trim().split(' ');
            let amount = unformatNumber(reward.shift());
            let type = reward.join('');
            if (!isNaN(amount)) farmingStats.visitorStats?.[type] += amount;
        }
    }
    farmingStats.visitorStats.accepted++;
}), () => getWorld() === "Garden" && settings.gardenWebhook !== "" && settings.webhookTimer !== 0);

/**
 * Function handling for player statistics.
 */
registerWhen(register("worldUnload", () => {
        farmingStats.playerStats.disconnects++;
}), () => getWorld() === "Garden" && settings.gardenWebhook !== "" && settings.webhookTimer !== 0);
registerWhen(register("chat", () => {
    farmingStats.playerStats.deaths++;
}).setCriteria(" ☠ You ${death}."), () => getWorld() === "Garden" && settings.gardenWebhook && settings.webhookTimer !== 0);
registerWhen(register("chat", (medal, crop) => {
    farmingStats.playerStats[medal]++;
}).setCriteria("[NPC] Jacob: You earned a ${medal} medal in the ${crop} contest!"),
() => getWorld() === "Garden" && settings.gardenWebhook !== "" && settings.webhookTimer !== 0);

/**
 * Manages time-based events and player downtime tracking.
 * Handles webhook sending and updates downtime statistics.
 */
let timePassed = 0;
registerWhen(register("step", () => {
    timePassed++;
    if (timePassed >= settings.webhookTimer * 60) {
        sendWebhook();
        timePassed = 0;
    }

    downtime++;
    if (downtime >= 10) farmingStats.playerStats.downtime++;
}).setDelay(1), () => getWorld() === "Garden" && settings.gardenWebhook !== "" && settings.webhookTimer !== 0);
