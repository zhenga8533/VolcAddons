import { getAuction } from "../../utils/auctions";
import { AQUA, BOLD, DARK_AQUA, LOGO, RED, WHITE } from "../../utils/constants";
import { commafy } from "../../utils/functions";

function formatPricing(item, tier) {
    const ah = getAuction();
    tier = tier != undefined && !isNaN(tier) ? parseInt(tier) : 1;
    ChatLib.chat(`${LOGO} ${DARK_AQUA}${BOLD}Important ${item} Prices (t${tier})`);
    Object.keys(ah[item].attributes).forEach(attributeName => {
        let attribute = ah[item].attributes[attributeName] * (2 ** (tier - 1));
        if (attribute % 1e10 != 0)
            ChatLib.chat(`-${AQUA}${attributeName.slice(1)}: ${WHITE}${commafy(attribute)}`);
    });
}

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
export function getAttributes(args) {
    const ah = getAuction();
    if (Object.keys(CATEGORIES).includes(args[1]))
        formatPricing(CATEGORIES[args[1]], args[2]);
    else
        ChatLib.chat(`${LOGO} ${RED}Please input as /va attribute <shard, [armor piece], [equipment piece]> [tier]`);
}
