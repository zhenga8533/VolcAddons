import request from "../../../requestV2";
import { BLUE, BOLD, DARK_GRAY, DARK_RED, GOLD, GRAY, GREEN, LOGO, RED, WHITE } from "../../utils/constants";
import { formatNumber } from "../../utils/functions/format";
import { decode } from "../../utils/functions/misc";


/**
 * Loops through Auction api for all golden dragons and then calls calcGdrag function.
 * 
 * @param {Number} page - Auction api page number,
 * @param {Number} minLvl - Minimum levle of Golden Dragon to calculate
 */
let gdrags = [];
function findGdrag(page, minLvl) {
    request({
        url: `https://api.hypixel.net/v2/skyblock/auctions?page=${page}`,
        json: true
    }).then(response => {
        ChatLib.clearChat(888);
        new Message(`${LOGO + RED}Auction Looping (${page + 1}/${response.totalPages})`).setChatLineId(888).chat();
        
        response.auctions.forEach(auction => {
            const { uuid, item_name, bin, starting_bid, item_bytes } = auction;
            const level = parseInt(item_name.match(/\[Lvl (\d+)\] Golden Dragon/)?.[1]);
            if (!bin || isNaN(level) || level < 100) return; // Skip non-bin auctions

            // Checks for pet candy.
            const itemData = decode(item_bytes).func_150305_b(0);
            const petInfo = new NBTTagCompound(itemData).getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("petInfo");
            if (JSON.parse(petInfo).candyUsed !== 0) return;
            
            // Add to list
            const levelPrice = (starting_bid - 600_000_000) / (level - 100);
            gdrags.push([uuid, level, levelPrice]);
        });

        if (page + 1 < response.totalPages) findGdrag(page + 1, minLvl);
        else {
            // Sort by level cost
            gdrags.sort((a, b) => a[2] - b[2]);

            ChatLib.chat(`${LOGO + GREEN}Auction loop complete!`);
            if (minLvl != 0) calcGdrag(minLvl);
            ChatLib.chat(`${DARK_GRAY}GDrag values saved, use '/refreshGdrag' to refresh auction data!`);
        }
    }).catch(err => ChatLib.chat(LOGO + DARK_RED + (err.cause ?? err)));
}
register("command", () => {
    gdrags = [];
    findGdrag(0, 0);
}).setName("refreshGdrag", true);

/**
 * Calculates best 5 gdrags in object using level costs.
 * 
 * @param {Number} minLvl - Minimum level of gdrag required to be calculated
 */
export function calcGdrag(minLvl) {
    // Check for gdrags variable
    if (gdrags.length === 0) {
        findGdrag(0, minLvl);
        return;
    }
    const fDrag = gdrags.filter(drag => drag[1] >= minLvl);
    const amount = Math.min(fDrag.length, 10);

    // Clear chat
    let chatID = 8008;
    ChatLib.clearChat([8008]);
    new Message(`\n${LOGO + GOLD + BOLD}Top ${amount} Golden Dragons [${WHITE}lvl ${minLvl}+${GOLD}]:`).setChatLineId(chatID++).chat();

    // And print new values
    for (let i = 0; i < amount; i++) {
        new Message(`${i+1}. `, new TextComponent(`${BLUE + fDrag[i][0]}`)
            .setClick("run_command", `/viewauction ${fDrag[i][0]}`)
            .setHoverValue(`Click to open auction #${i+1}!`),
            `${GRAY} [lvl ${fDrag[i][1]}: ${formatNumber(fDrag[i][2])}]`)
            .setChatLineId(chatID++).chat();
    }
}
