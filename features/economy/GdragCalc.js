import request from "../../../requestV2";
import { BLUE, BOLD, GOLD, GRAY, GREEN, LOGO, RED, WHITE } from "../../utils/constants";
import { formatNumber } from "../../utils/functions";


/**
 * Java NBT tools.
 */
const decoder = java.util.Base64.getDecoder();
const compressor = net.minecraft.nbt.CompressedStreamTools;

/**
 * Variable used to track Golden Dragons.
 * { uuid : [level, cost] }
 */
let gdrags = {};

/**
 * Calculates best 5 gdrags in object using level costs.
 * 
 * @param {number} minLvl - Minimum level of gdrag required to be calculated
 */
export function calcGdrag(minLvl) {
    if (Object.keys(gdrags).length === 0) {
        findGdrag(0, minLvl);
        return;
    }

    // Filter out gdrags with level < minLvl
    const filteredDrags = {};
    for (let gdrag in gdrags) {
        if (gdrags[gdrag][0] >= minLvl && (!filteredDrags.hasOwnProperty(gdrag) || gdrags[gdrag][1] < filteredDrags[gdrag][1]))
        filteredDrags[gdrag] = gdrags[gdrag];
    }

    // Find lowest level costs => { level cost : uuid }
    const levelCosts = {};
    for (let gdrag in filteredDrags) {
        if (gdrag[0] <= 100) continue;
        let levelPrice = (filteredDrags[gdrag][1] - 600_000_000) / (filteredDrags[gdrag][0] - 100);
        levelCosts[levelPrice] = gdrag;
    }

    // Find X lowest
    const sortedCosts = Object.keys(levelCosts).sort((a, b) => a - b).slice(0, 5);
    ChatLib.chat(`${LOGO} ${GOLD}${BOLD}Top ${5} Golden Dragons [${WHITE}lvl ${minLvl}+${GOLD}]:`);
    for (let i = 0; i < 5; i++) {
        let uuid = levelCosts[sortedCosts[i]];
        if (uuid === undefined) return;
        new Message(`${i+1}. `, new TextComponent(`${BLUE}${uuid}`)
            .setClick("run_command", `/viewauction ${uuid}`)
            .setHoverValue(`Click to open auction #${i+1}!`),
            `${GRAY} (CpL: ${formatNumber(sortedCosts[i])})`).chat();
    }
}

/**
 * Loops through Auction api for all golden dragons and then calls calcGdrag function.
 * 
 * @param {number} page - Auction api page number,
 * @param {number} minLvl - Minimum levle of Golden Dragon to calculate
 */
function findGdrag(page, minLvl) {
    request({
        url: `https://api.hypixel.net/skyblock/auctions?page=${page}`,
        json: true
    }).then((response)=>{
        ChatLib.clearChat(888);
        new Message(`${LOGO} ${RED}Auction Looping (${page + 1}/${response.totalPages})`).setChatLineId(888).chat();
        
        response.auctions.forEach(auction => {
            const { uuid, item_name, bin, starting_bid, item_bytes } = auction;
            const args = /^\[Lvl (\d+)] Golden Dragon$/.exec(item_name);
            const level = args?.[1];
            if (!bin || level === undefined) return; // Skip non-bin auctions

            // Credit to https://www.chattriggers.com/modules/v/SBInvSee for NBT data
            // Checks for pet candy.
            const bytearray = decoder.decode(item_bytes);
            const inputstream = new java.io.ByteArrayInputStream(bytearray);
            const nbt = compressor.func_74796_a(inputstream);
            const itemData = nbt.func_150295_c("i", 10).func_150305_b(0);
            const petInfo = new NBTTagCompound(itemData).getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("petInfo");
            if (JSON.parse(petInfo).candyUsed !== 0) return;
            
            gdrags[uuid] = [parseInt(level), starting_bid];
        });

        if (page + 1 < response.totalPages) findGdrag(page + 1, minLvl);
        else {
            ChatLib.chat(`${LOGO} ${GREEN}Auction loop complete!`);
            ChatLib.chat(`${GRAY}GDrag values saved, use \`/refreshGdrag\` to refresh data.`);
            if (minLvl != 0) calcGdrag(minLvl);
        }
    }).catch((error)=>{
        console.error(error);
    });
}

register("command", () => {
    gdrags = {};
    findGdrag(0, 0);
}).setName("refreshGdrag", true);
