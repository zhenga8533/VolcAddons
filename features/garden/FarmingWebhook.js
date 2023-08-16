import request from "../../../requestV2";
import settings from "../../settings";
import { unformatNumber } from "../../utils/functions";
import { getWorld } from "../../utils/worlds";
import { getBazaar } from "../economy/Economy";
import { getWaifu } from "../general/PartyCommands";

const CROP_DROP = {
    "Wheat": 1.0,
    "Carrots": 3.71,
    "Potato": 3.71,
    "Pumpkin": 1.0,
    "Sugar cane": 2.0,
    "Melon": 4.64,
    "Cactus": 2.0,
    "Cocoa bean": 3.0,
    "Mushroom": 1.0,
    "Nether wart": 3.0,
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

class FarmingStat {
    constructor() {
        this.cropStats = {};
        this.visitorStats = {};
        this.playerStats = {};
        this.resetStats();
    }
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
            "bronze": 0,
            "silver": 0,
            "gpld": 0,
            "interruptions": 0,
            "deaths": 0,
            "afk": 0
        };
    }
}
const farmingStats = new FarmingStat(); 

function sendWebhook() {
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
                        "name": "Harvests",
                        "value": "Wheat: 1\nCarrot: 2\nPotato: 3",
                        "inline": true
                    },
                    {
                        "name": "Coinage",
                        "value": "Wheat: 1k\nCarrot: 2k\nPotato: 3k",
                        "inline": true
                    },
                    {
                        "name": "Milestones",
                        "value": "Wheat: 29\nCarrot: 29\nPotato: 29",
                        "inline": true
                    },
                    {
                        "name": "Visitors",
                        "value": "Arrived: 1\nAccepted: 1\nDeclined: 0",
                        "inline": true
                    },
                    {
                        "name": "Gains",
                        "value": "FXP: +1\nGXP: +15\nCopper: +69\nMoney: -10k",
                        "inline": true
                    },
                    {
                        "name": "Tiers",
                        "value": ":green_square:: 1\n:blue_square:: 0\n:yellow_square:: 0",
                        "inline": true
                    },
                    {
                        "name": "Contests",
                        "value": "Gold: 1\nSilver: 0\nBronze: 0",
                        "inline": true
                    },
                    {
                        "name": "Server Stats",
                        "value": "Interuptions: 0\nDeaths: 0\nAFK: 0s",
                        "inline": true
                    }
                ]
            }]
        }
    });
}

/**
 * Crop Tracking
 */
let afk = 0;
let farmingFortune = 0;
register("step", () => {
    if (getWorld() !== "Garden") return;
    const tablist = TabList.getNames();
    if (tablist === null) return;
    const fortune = tablist.find(line => line.includes("Farming Fortune"));
    if (fortune === undefined) return;
    farmingFortune = parseInt(fortune.substring(fortune.indexOf('☘') + 1));
}).setDelay(10);
register("blockBreak", (block) => {
    const blockName = block.type.getName();
    if (!(blockName in CROP_DROP)) return;
    farmingStats.cropStats[blockName] = farmingStats.cropStats[blockName] ?? [0, 0, 0];
    farmingStats.cropStats[blockName][0] += CROP_DROP[blockName] * farmingFortune/100;
})

/**
 * Visitor Tracking
 */
register("chat", (visitor) => {
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
}).setCriteria("&r&a&r${visitor} &r&ehas arrived on your &r&bGarden&r&e!&r");
register("guiMouseClick", (x, y, button, gui) => {
    // Get clicked item
    const clickedSlot = gui?.getSlotUnderMouse()?.field_75222_d;
    if (clickedSlot === undefined) return;
    const item = Player.getContainer().getStackInSlot(clickedSlot);
    if (item === null || item.getName() !== "§aAccept Offer") return;
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
});

/**
 * Player Tracking
 */
register("worldUnload", () => {
    if (getWorld() === "Garden")
        farmingStats.playerStats.disconnects++;
});
register("chat", () => {
    farmingStats.playerStats.deaths++;
}).setCriteria(" ☠ You ${death}.");

let timePassed = 0;
register("step", () => {
    timePassed++;
    if (timePassed > 3600) {
        sendWebhook();
        farmingStats.resetStats();
        timePassed = 0;
    }

    afk++;
    if (afk >= 10) farmingStats.playerStats.afk++;
}).setDelay(1);
