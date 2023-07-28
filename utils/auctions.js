import request from "../../requestV2";
import { GREEN, LOGO, RED } from "./constants";
import { findFirstRomanNumeral, findWordsInString, romanToNum } from "./functions";

class AuctionItem {
    constructor() {
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
            // "Speed": 1e10,
            "bVeteran": 1e10,
            "bBlazing Fortune": 1e10,
            "bFishing Experience": 1e10
        };
        this.price = 1e10;
    }
}

const items = {
    "Attribute Shard": new AuctionItem(),
    "Helmet": new AuctionItem(),
    "Chestplate": new AuctionItem(),
    "Leggings": new AuctionItem(),
    "Boots": new AuctionItem(),
    "Belt": new AuctionItem(),
    "Bracelet": new AuctionItem(),
    "Cloak": new AuctionItem(),
    "Necklace": new AuctionItem(),
}
export function getAuction() { return items };


/**
 * Makes a PULL request to get auction data from Hypixel API.
 */
export function updateAuction(page) {
    request({
        url: `https://api.hypixel.net/skyblock/auctions?page=${page}`,
        json: true
    }).then((response)=>{
        // Displays loop number
        ChatLib.clearChat(888);
        new Message(`${LOGO} ${RED}Auction Looping (${page + 1}/${response.totalPages})`).setChatLineId(888).chat();
        
        response.auctions.forEach(auction => {
            // Update item data
            let item_name = auction.item_name;
            let item = items[Object.keys(items).find(base => item_name.includes(base))];
            if (auction.bin && item != undefined) {
                item.price = Math.min(auction.starting_bid, item.price);

                // Attribute Checking
                let lore = auction.item_lore
                let attributes = findWordsInString(lore, Object.keys(item.attributes));
                attributes.forEach(attribute => {
                    let attributeIndex = lore.indexOf(attribute) + attribute.length;
                    let subLore = lore.substring(attributeIndex, attributeIndex + 4);
                    let tier = findFirstRomanNumeral(subLore);
                    if (tier) {
                        tier = romanToNum(tier);
                        item.attributes[attribute] = Math.min(auction.starting_bid / (2 ** (tier - 1)), item.attributes[attribute]);
                    }
                });
            }
        });

        if (page + 1 < response.totalPages)
            updateAuction(page + 1);
        else
            ChatLib.chat(`${LOGO} ${GREEN}Auction loop complete!`);
    }).catch((error)=>{
        ChatLib.chat(`${LOGO} ${RED}${error.cause}`);
    });
}
updateAuction(0);
