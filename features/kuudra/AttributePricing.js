import { getAuction } from "../../utils/auction";
import { AQUA, BOLD, DARK_AQUA, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy } from "../../utils/functions";


/**
 * Variable used to represent attribute categories.
 */
const CATEGORIES = {
    "shard": "Attribute Shard",
    "shards": "Attribute Shard",
    "helmet": "Helmet",
    "chestplate": "Chestplate",
    "leggings": "Leggings",
    "boots": "Boots",
    "belt": "Belt",
    "bracelet": "Bracelet",
    "cloak": "Cloak",
    "necklace": "Necklace",
}

const GOD_ROLL = {
    
}

/**
 * Displays prices of attributes of shards and armor/equipment pieces sent by player.
 *
 * @param {string[]} args - Arguments of player input values.
 */
export function getAttributes(args) {
    if (Object.keys(CATEGORIES).includes(args[1])) {
        const ah = getAuction();
        const item = CATEGORIES[args[1]]
        const tier = args[2] != undefined && !isNaN(args[2]) ? parseInt(args[2]) : 1;
        
        ChatLib.chat(`${LOGO} ${DARK_AQUA}${BOLD}Important ${item} Prices (t${tier})`);
        Object.keys(ah[item].attributes).forEach(attributeName => {
            let attribute = ah[item].attributes[attributeName] * (2 ** (tier - 1));
            if (attribute % 1e10 != 0)
                ChatLib.chat(`-${AQUA}${attributeName.slice(1)}: ${WHITE}${commafy(attribute)}`);
        });
    } else
        ChatLib.chat(`${LOGO} ${RED}Please input as /va attribute <shard, [armor piece], [equipment piece]> [tier]`);
}
