import request from "../../../requestV2";
import { AQUA, BOLD, DARK_AQUA, DARK_GRAY, GOLD, GRAY, GREEN, ITALIC, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy, convertToTitleCase, decode, formatNumber } from "../../utils/functions";
import { getAuction } from "./Economy";


/**
 * Loops through Auction api for any item with attributes and then recalls getAttributes
 * 
 * @param {number} page - Auction api page number,
 * @param {Array[String]} command - User inputted command arguments
 */
let attributesBin = {};
function findAttributes(page, command) {
    request({
        url: `https://api.hypixel.net/v2/skyblock/auctions?page=${page}`,
        json: true
    }).then((response)=>{
        const KUUDRA_PIECES = new Set(["FERVOR", "AURORA", "TERROR", "CRIMSON", "HOLLOW", "MOLTEN"]);
        ChatLib.clearChat(444);
        new Message(`${LOGO + RED}Auction Looping (${page + 1}/${response.totalPages})`).setChatLineId(444).chat();

        response.auctions.forEach(auction => {
            // Get item data
            const { uuid, bin, starting_bid, item_bytes } = auction;
            if (!bin) return;
            const item_data = new NBTTagCompound(decode(item_bytes)).getCompoundTag("tag").getCompoundTag("ExtraAttributes");
            let id = item_data.getString("id");
            const attributes = item_data.getCompoundTag("attributes").toObject();
            const keys = Object.keys(attributes);
            if (keys.length === 0) return;

            // Set item in map (kuudra set differently)
            const ids = id.split('_');
            id = KUUDRA_PIECES.has(ids[0]) ? ids[1] : id;
            if (!(id in attributesBin)) attributesBin[id] = {};
            const category = attributesBin[id];

            // Add attribute costs
            keys.forEach(key => {
                const tier = attributes[key];
                const value = starting_bid / (2 ** (tier - 1));
                if (key in category) category[key].push([uuid, value, tier]);
                else category[key] = [[uuid, value, tier]];
            });
        });

        if (page + 1 < response.totalPages) findAttributes(page + 1, command);
        else {
            // Sort values
            Object.keys(attributesBin).forEach(id => {
                Object.keys(attributesBin[id]).forEach(attribute => {
                    attributesBin[id][attribute].sort((a, b) => a[1] - b[1]);
                });
            });

            ChatLib.chat(`${LOGO + GREEN}Auction loop complete!`);
            if (command !== undefined) getAttributes(command);
            ChatLib.chat(`${DARK_GRAY}Attribute values saved, use '/refreshAttr' to refresh auction data!`);
        }
    }).catch((error)=>{
        console.error(error);
    });
}
register("command", () => {
    attributesBin = {};
    findAttributes(0, undefined);
}).setName("refreshAttr", true).setAliases("refreshAttributes", "refreshAttribute");

/**
 * Displays prices of attributes for shards, armor, and equipment pieces sent by the player.
 *
 * @param {string[]} args - Arguments from player input values.
 */
const worthless = [];
export function getAttributes(args) {
    const validCategories = new Set([
        "shard", "shards", 
        "helmet", "chestplate", "leggings", "boots", 
        "necklace", "cloak", "belt", "bracelet"
    ]);

    // args
    const category = args[1]?.toLowerCase();
    let piece = args[2]?.toLowerCase();
    const attribute = args[3]?.toLowerCase();
    const auction = getAuction();

    if (validCategories.has(category)) {  // Attribute 
        const item = args[1].includes("shard") ? "ATTRIBUTE_SHARD" : category.toUpperCase();
        const tier = args[2] !== undefined && !isNaN(args[2]) ? parseInt(args[2]) : 1;
        const attributes = auction[item]?.attributes || {};

        ChatLib.chat(`${LOGO + DARK_AQUA + BOLD + convertToTitleCase(item)} Attribute Prices (t${tier})`);

        Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
            const adjustedValue = attributeValue * (2 ** (tier - 1));
            if (adjustedValue !== 0) {
                ChatLib.chat(`-${AQUA + convertToTitleCase(attributeName)}: ${WHITE + commafy(adjustedValue)}`);
            }
        });
    } else if (category === "lbin" || category === "upgrade") {
        // Load attribute values on first run
        if (Object.keys(attributesBin).length === 0) {
            findAttributes(0, args);
            return;
        }

        // Check if valid attribute
        piece = piece?.toUpperCase();
        if (!(piece in attributesBin)) {
            ChatLib.chat(`\n${LOGO + RED}Error: Invalid argument "${piece}"!`);
            ChatLib.chat(`${DARK_GRAY}Remember to input as an item id seperated by underscores or a Kuudra piece category (i.e Chestplate or Necklace)!`);
            return;
        }
        const attributeBin = attributesBin[piece];
        if (!(attribute in attributeBin)) {
            ChatLib.chat(`\n${LOGO + RED}Error: Invalid argument "${attribute}"!`);
            ChatLib.chat(`${DARK_GRAY}Remember to input as an attribute seperated by underscores!`);
            return;
        }

        // Set correct bin and values
        const min = isNaN(args[4]) ? 1 : parseInt(args[4]);
        const bin = attributeBin[attribute].filter(piece => piece[2] >= min);
        const amount = isNaN(args[5]) ? Math.min(10, bin.length) : Math.min(parseInt(args[5]), bin.length);

        // Clear chat
        let chatID = 8008;
        ChatLib.clearChat([8008]);
        new Message(`\n${LOGO + DARK_AQUA + BOLD}Top ${amount} t${min}+ ${attribute} ${piece}s:`).setChatLineId(chatID++).chat();

        // And print new values
        for (let i = 0; i < amount; i++) {
            new Message(`${i+1}. `, new TextComponent(`${AQUA + bin[i][0]}`)
                .setClick("run_command", `/viewauction ${bin[i][0]}`)
                .setHoverValue(`Click to open auction #${i+1}!`),
                `${GRAY} [t${bin[i][2]}: ${formatNumber(bin[i][1])}]`)
                .setChatLineId(chatID++).chat();
        }
    } else if (piece !== undefined) {
        const KUUDRA_PIECES = ["CRIMSON", "AURORA", "TERROR", "FERVOR", "HOLLOW"];
        const ARMOR_TYPES = ["HELMET", "CHESTPLATE", "LEGGINGS", "BOOTS"];
        const EQUIPMENT_TYPES = ["NECKLACE", "CLOAK", "BELT", "BRACELET"];

        const combo = category < piece ? `${category} ${piece}` : `${piece} ${category}`;
        ChatLib.chat(`${LOGO + GOLD}Attribute Combo ${GRAY}(${combo})${GOLD}:`);
        let chatID = 10946;

        // Armor pieces
        KUUDRA_PIECES.forEach(piece => {
            ChatLib.chat(`${DARK_AQUA + convertToTitleCase(piece)} Pieces:`);
            ARMOR_TYPES.forEach(armor => {
                const price = auction[`${piece}_${armor}`]?.attribute_combos?.[combo] ?? 0;
                if (price < 10_000_000) worthless.push(chatID);
                new Message(`${DARK_GRAY}- ${AQUA + convertToTitleCase(armor)}: ${WHITE + formatNumber(price)}`)
                    .setChatLineId(chatID).chat();
                chatID++;
            });
        });

        // Equipment
        ChatLib.chat(`${DARK_AQUA}Molten Pieces:`);
        EQUIPMENT_TYPES.forEach(equip => {
            const price = auction["MOLTEN_" + equip]?.attribute_combos?.[combo] ?? 0;
            if (price < 10_000_000) worthless.push(chatID);
            new Message(`${DARK_GRAY}- ${AQUA + convertToTitleCase(equip)}: ${WHITE + formatNumber(price)}`)
                .setChatLineId(chatID).chat();
            chatID++;
        });

        // Remove broke pieces
        new Message(new TextComponent(`${LOGO + GRAY}Click here to remove pieces worth less than 10m!`)
            .setClick("run_command", "/clearWorthlessAttributes")
            .setHoverValue("Click me!")
        ).chat();
    } else {
        ChatLib.chat(`\n${LOGO + RED}Error: Invalid argument "${args[1]}"!`);
        ChatLib.chat(`${LOGO + RED}Please input as: ${WHITE}/va attribute ${GRAY}<${WHITE}shard, [armor], [equipment]${GRAY}> ${WHITE}[tier]`);
        ChatLib.chat(`${LOGO + RED}To check combo price, please input as: ${WHITE}/va attribute [attribute_1] [attribute_2]`);
        ChatLib.chat(`${LOGO + RED}To fetch lbin for upgrades, please input as: ${WHITE}/va attribute lbin [item] [attribute] *[min tier] *[amount]`);
        ChatLib.chat(`${DARK_GRAY + ITALIC}Please note that values with more than one word need to be seperated by an underscore.`);
    }
}

/**
 * Remove worthless (< 10m) cost items from chat
 */
register("command", () => {
    worthless.forEach(id => {
        ChatLib.clearChat(id);
    });
    worthless.length = 0;
}).setName("clearWorthlessAttributes");
