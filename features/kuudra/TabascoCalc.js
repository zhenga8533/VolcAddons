import { AQUA, BOLD, DARK_AQUA, GRAY, GREEN, LOGO, RED, UNDERLINE, WHITE } from "../../utils/constants";
import { commafy } from "../../utils/functions/format";
import { getBazaar } from "../economy/Economy";


/**
 * /va calc for tabasco book prices
 */
export function calcTabasco() {
    const bazaar = getBazaar();
    const tabasco = bazaar.ENCHANTMENT_TABASCO_3;
    const pepper = bazaar.CHILI_PEPPER;
    const orderPepper = pepper[0] * 64;
    const instaPepper = pepper[1] * 64;
    const p1 = tabasco[0] - orderPepper;
    const p2 = tabasco[0] - instaPepper;
    const p3 = tabasco[1] - orderPepper;
    const p4 = tabasco[1] - instaPepper;
    
    ChatLib.chat(`\n${LOGO + GREEN + BOLD}Tabasco Craft Profits:\n`);
    ChatLib.chat(`${RED + BOLD + UNDERLINE}Tabasco III Cost:`);
    ChatLib.chat(`${AQUA}Insta Sell: ${WHITE + commafy(tabasco[0])}`);
    ChatLib.chat(`${AQUA}Sell Offer: ${WHITE + commafy(tabasco[1])}\n`);
    ChatLib.chat(`${GREEN + BOLD + UNDERLINE}Chili Pepper Cost:`);
    ChatLib.chat(`${AQUA}Buy Order: ${WHITE + commafy(orderPepper)}`);
    ChatLib.chat(`${AQUA}Insta Buy: ${WHITE + commafy(instaPepper)}\n`);
    ChatLib.chat(`${DARK_AQUA + BOLD + UNDERLINE}Total Profit:`);
    ChatLib.chat(`${AQUA}Insta Sell + Buy Order: ${WHITE + commafy(p1)} ${GRAY}(${commafy(p1 / 6)} per teeth)`);
    ChatLib.chat(`${AQUA}Insta Sell + Insta Buy: ${WHITE + commafy(p2)} ${GRAY}(${commafy(p2 / 6)} per teeth)`);
    ChatLib.chat(`${AQUA}Sell Offer + Buy Order: ${WHITE + commafy(p3)} ${GRAY}(${commafy(p3 / 6)} per teeth)`);
    ChatLib.chat(`${AQUA}Sell Offer + Insta Buy: ${WHITE + commafy(p4)} ${GRAY}(${commafy(p4 / 6)} per teeth)\n`);
}
