import request from "../../requestV2";
import settings from "../settings";
import { GREEN, LOGO, RED } from "./constants";
import { findFirstRomanNumeral, findWordsInString, removeReforges, romanToNum } from "./functions";
import { registerWhen } from "./variables";


/**
 * Variables used to generate and record lbin auction pricing.
 */
const items = {};
export function getAuction() { return items };
/**
 * Variables used to track important data.
 */
class AttributePiece {
    constructor(godroll1, godroll2) {
        this.godroll = new Set([godroll1, godroll2]);
        this.attributes = {
            "bElite": 1e10,
            "bMana Steal": 1e10,
            "bWarrior": 1e10,
            "bDeadeye": 1e10,
            "bBreeze": 1e10,
            "bDominance": 1e10,
            "bFortitude": 1e10,
            "bLife Regeneration": 1e10,
            "bLifeline": 1e10,
            "bMagic Find": 1e10,
            "bMana Pool": 1e10,
            "bMana Regeneration": 1e10,
            "bVitality": 1e10,
            "Speed": 1e10,
            "bVeteran": 1e10,
            "bBlazing Fortune": 1e10,
            "bFishing Experience": 1e10
        };
    }
}
const attributeItems = {
    "Aurora Helmet": new AttributePiece("Mana Pool", "Mana Regeneration"),
    "Aurora Chestplate": new AttributePiece("Mana Pool", "Mana Regeneration"),
    "Aurora Leggings": new AttributePiece("Mana Pool", "Mana Regeneration"),
    "Aurora Boots": new AttributePiece("Mana Pool", "Mana Regeneration"),
    "Crimson Helmet": new AttributePiece("Magic Find", "Veteran"),
    "Crimson Chestplate": new AttributePiece("Magic Find", "Veteran"),
    "Crimson Leggings": new AttributePiece("Magic Find", "Veteran"),
    "Crimson Boots": new AttributePiece("Magic Find", "Veteran"),
    "Fervor Helmet": new AttributePiece("Life Regeneration", "Vitality"),
    "Fervor Chestplate": new AttributePiece("Life Regeneration", "Vitality"),
    "Fervor Leggings": new AttributePiece("Life Regeneration", "Vitality"),
    "Fervor Boots": new AttributePiece("Life Regeneration", "Vitality"),
    "Hollow Helmet": new AttributePiece("Mana Pool", "Mana Regeneration"),
    "Hollow Chestplate": new AttributePiece("Mana Pool", "Mana Regeneration"),
    "Hollow Leggings": new AttributePiece("Mana Pool", "Mana Regeneration"),
    "Hollow Boots": new AttributePiece("Mana Pool", "Mana Regeneration"),
    "Terror Helmet": new AttributePiece("Dominance", "Vitality"),
    "Terror Chestplate": new AttributePiece("Dominance", "Vitality"),
    "Terror Leggings": new AttributePiece("Dominance", "Vitality"),
    "Terror Boots": new AttributePiece("Dominance", "Vitality"),
    "Molten Necklace": new AttributePiece("Magic Find", "Veteran"),
    "Molten Cloak": new AttributePiece("Magic Find", "Veteran"),
    "Molten Belt": new AttributePiece("Magic Find", "Veteran"),
    "Molten Gauntlet": new AttributePiece("Magic Find", "Veteran"),
    "Attribute Shard": new AttributePiece("Place", "Holder"),
    "Helmet": new AttributePiece("Place", "Holder"),
    "Chestplate": new AttributePiece("Place", "Holder"),
    "Leggings": new AttributePiece("Place", "Holder"),
    "Boots": new AttributePiece("Place", "Holder"),
    "Necklace": new AttributePiece("Place", "Holder"),
    "Cloak": new AttributePiece("Place", "Holder"),
    "Belt": new AttributePiece("Place", "Holder"),
    "Gauntlet": new AttributePiece("Place", "Holder"),
}
export function getAttributeItems() { return attributeItems };

/**
 * Makes a PULL request to get auction data from Hypixel API.
 * 
 * @param {number} page - 0-finalPage of auction API
 */
export function updateAuction(page) {
    request({
        url: `https://api.hypixel.net/skyblock/auctions?page=${page}`,
        json: true
    }).then((response)=>{
        /** Not in use
         *  ChatLib.clearChat(888);
         *  new Message(`${LOGO} ${RED}Auction Looping (${page + 1}/${response.totalPages})`).setChatLineId(888).chat();
         */
        
        response.auctions.forEach(auction => {
            const { category, item_name, bin, item_lore, starting_bid } = auction;
            const item = removeReforges(category, item_name);
            if (!bin) return; // Skip non-bin auctions
          
            // Update lbin
            items[item] = items[item] === undefined ? starting_bid : Math.min(starting_bid, items[item]);
          
            // Attribute tracking
            const attributeItem = attributeItems[item];
            if (attributeItem === undefined) return;

            const attributes = findWordsInString(item_lore, Object.keys(attributeItem.attributes));
            attributes.forEach(attribute => {
                const attributeIndex = item_lore.indexOf(attribute) + attribute.length;
                const subLore = item_lore.substring(attributeIndex, attributeIndex + 4);
                const tier = findFirstRomanNumeral(subLore);
                if (!tier) return;

                const parsedTier = romanToNum(tier);
                const attributeValue = starting_bid / (2 ** (parsedTier - 1));
                attributeItem.attributes[attribute] = Math.min(attributeValue, attributeItem.attributes[attribute]);
        
                // Tracks for item class e.x. Helmet
                const attributeClass = attributeItems[item.split(" ")[1]];
        
                if (attributeClass !== undefined)
                    attributeClass.attributes[attribute] = Math.min(attributeValue, attributeClass.attributes[attribute]);
            });
          
            // Godroll tracking (add relevant logic here)
          });

        if (page + 1 < response.totalPages)
            updateAuction(page + 1);
        /** Not in use
         *  else
         *      ChatLib.chat(`${LOGO} ${GREEN}Auction loop complete!`);
         */
    }).catch((error)=>{
        console.error(error);
    });
}
if (settings.auctionRefresh) updateAuction(0);

/**
 * Calls for an auction house reloop every X minutes.
 */
let minutes = 0
registerWhen(register("step", () => {
    minutes++;

    if (minutes >= settings.auctionRefresh) {
        updateAuction(0);
        minutes = 0;
    }
}).setDelay(60), () => settings.auctionRefresh);
register("command", () => { updateAuction(0) }).setName("updateAuction");
