import request from "../../requestV2";
import { GREEN, LOGO, RED } from "./constants";

class AuctionItem {
    constructor() {
        this.attributes = {
            "Attack Speed": "TODO",
            "Combo": "TODO",
            "Elite": "TODO",
            "Ignition": "TODO",
            "Life Recovery": "TODO",
            "Mana Steal": "TODO",
            "Midas Touch": "TODO",
            "Warrior": "TODO",
            "Deadeye": "TODO",
            "Breeze": "TODO",
            "Dominance": "TODO",
            "Fortitude": "TODO",
            "Life Regeneration": "TODO",
            "Lifeline": "TODO",
            "Magic Find": "TODO",
            "Mana Pool": "TODO",
            "Mana Regeneration": "TODO",
            "Vitality": "TODO",
            "Speed": "TODO",
            "Veteran": "TODO",
            "Blazing Fortune": "TODO",
            "Fishing Experience": "TODO"
        };
        this.price = 1e10;
    }
}

const items = {
    "Attribute Shard": new AuctionItem()
}
export function getAuction() { return items };


/**
 * Makes a PULL request to get auction data from Hypixel API.
 */
const uuids = [];
export function updateAuction(page) {
    request({
        url: `https://api.hypixel.net/skyblock/auctions?page=${page}`,
        json: true
    }).then((response)=>{
        // Displays loop number
        ChatLib.clearChat(888);
        new Message(`${LOGO} ${RED}Auction Looping (${page + 1}/${response.totalPages})`).setChatLineId(888).chat();
        
        let recursion = response.auctions.every(auction => {
            // Check for UUID to end looping early
            let uuid = auction.uuid
            if (page == 0) {
                if (uuids.includes(uuid)) {
                    ChatLib.chat(`${LOGO} ${GREEN}Old auction data detected => ending loop!`);
                    return false;
                } else uuids.push(uuid)
            }

            // Update item data
            let item_name = auction.item_name;
            if (auction.bin && items[item_name] != undefined) {
                items[item_name].price = Math.min(auction.starting_bid, items[item_name].price);

                // Attribute Checking (god help me)
                
            }

            return true;
        });

        if (recursion && page + 1 < response.totalPages)
            updateAuction(page + 1);
        else
            ChatLib.chat(`${LOGO} ${GREEN}Auction loop complete!`);
    }).catch((error)=>{
        ChatLib.chat(`${LOGO} ${RED}${error.cause}`);
    });
}
updateAuction(0);
