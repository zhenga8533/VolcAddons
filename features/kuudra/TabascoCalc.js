import { AQUA, BOLD, DARK_AQUA, GRAY, GREEN, LOGO, RED, UNDERLINE, WHITE } from "../../utils/Constants";
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

  ChatLib.chat(
    `\n${LOGO + GREEN + BOLD}Tabasco Craft Profits:\n
${RED + BOLD + UNDERLINE}Tabasco III Cost:
${AQUA}Insta Sell: ${WHITE + commafy(tabasco[0])}
${AQUA}Sell Offer: ${WHITE + commafy(tabasco[1])}\n
${GREEN + BOLD + UNDERLINE}Chili Pepper Cost:
${AQUA}Buy Order: ${WHITE + commafy(orderPepper)}
${AQUA}Insta Buy: ${WHITE + commafy(instaPepper)}\n
${DARK_AQUA + BOLD + UNDERLINE}Total Profit:
${AQUA}Insta Sell + Buy Order: ${WHITE + commafy(p1)} ${GRAY}(${commafy(p1 / 6)} per teeth)
${AQUA}Insta Sell + Insta Buy: ${WHITE + commafy(p2)} ${GRAY}(${commafy(p2 / 6)} per teeth)
${AQUA}Sell Offer + Buy Order: ${WHITE + commafy(p3)} ${GRAY}(${commafy(p3 / 6)} per teeth)
${AQUA}Sell Offer + Insta Buy: ${WHITE + commafy(p4)} ${GRAY}(${commafy(p4 / 6)} per teeth)\n`
  );
}
