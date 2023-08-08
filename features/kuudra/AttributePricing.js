import { AQUA, BOLD, DARK_AQUA, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy, convertToTitleCase } from "../../utils/functions";
import { getAuction } from "../economy/Economy";


/**
 * Displays prices of attributes for shards, armor, and equipment pieces sent by the player.
 *
 * @param {string[]} args - Arguments from player input values.
 */
export function getAttributes(args) {
    const validCategories = new Set([
        "shard", "shards", "helmet", "chestplate",
        "leggings", "boots", "belt", "bracelet",
        "cloak", "necklace"
    ]);

    const category = args[1];

    if (validCategories.has(category)) {
        const auction = getAuction();
        const item = args[1].includes("shard") ? "ATTRIBUTE_SHARD" : category.toUpperCase();
        const tier = args[2] !== undefined && !isNaN(args[2]) ? parseInt(args[2]) : 1;

        const attributes = auction[item]?.attributes || {};

        ChatLib.chat(`${LOGO} ${DARK_AQUA}${BOLD}${convertToTitleCase(item)} Attribute Prices (t${tier})`);

        Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
            const adjustedValue = attributeValue * (2 ** (tier - 1));
            if (adjustedValue !== 0) {
                ChatLib.chat(`-${AQUA}${convertToTitleCase(attributeName)}: ${WHITE}${commafy(adjustedValue)}`);
            }
        });
    } else {
        ChatLib.chat(`${LOGO} ${RED}Please input as /va attribute <shard OR [armor piece] OR [equipment piece]> [tier]`);
    }
}
