import { AQUA, BOLD, DARK_AQUA, DARK_GRAY, GOLD, GRAY, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy, convertToTitleCase, formatNumber } from "../../utils/functions";
import { getAuction } from "./Economy";


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
    const attribute = args[2]?.toLowerCase();
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
    } else if (attribute !== undefined) {
        const KUUDRA_PIECES = ["CRIMSON", "AURORA", "TERROR", "FERVOR", "HOLLOW"];
        const ARMOR_TYPES = ["HELMET", "CHESTPLATE", "LEGGINGS", "BOOTS"];
        const EQUIPMENT_TYPES = ["NECKLACE", "CLOAK", "BELT", "BRACELET"];

        const combo = category < attribute ? `${category} ${attribute}` : `${attribute} ${category}`;
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
        ChatLib.chat(`${LOGO + RED}Please input as /va attribute <shard OR [armor piece] OR [equipment piece]> [tier]`);
        ChatLib.chat(`${LOGO + RED}In order to check combo price, please input /va attribute [attribute_1] [attribute_2]`);
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
