import settings from "../../settings";
import { getBazaar } from "../../utils/bazaar";
import { AQUA, BOLD, DARK_AQUA, DARK_PURPLE, GOLD, GREEN, RED } from "../../utils/constants";
import { commafy } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";
import { getTier, getWorld } from "../../utils/worlds";
import { getItemValue } from "../economy/ItemPrice";


/**
 * Variables used to calculate Kuudra chest profit.
 */
const items = {
    "ENCHANTED_RED_SAND": [0, 0],
    "ENCHANTED_MYCELIUM": [0, 0],
    "ESSENCE_CRIMSON": [0, 0],
    "MANDRAA": [0, 0],
    "ENCHANTMENT_ULTIMATE_FATAL_TEMPO_1": [0, 0],
    "ENCHANTMENT_ULTIMATE_INFERNO_1": [0, 0],
    "ENCHANTMENT_TABASCO_3": [0, 0],
    "CHILI_PEPPER": [0, 0]
}
getBazaar(items);
const KEY_COST = [[200000, 2], [400000, 6], [750000, 20], [1500000, 60], [3000000, 120]];
const profitExample =
`${GOLD}${BOLD}Value (BIN): ${GREEN}Do
${GOLD}${BOLD}Profit/Loss: ${GREEN}You

${AQUA}${BOLD}Primary: ${GREEN}Have
${DARK_AQUA}${BOLD}Secondary: ${GREEN}Any
${DARK_PURPLE}${BOLD}Teeth: ${GREEN}Grapes
${RED}${BOLD}Essence: ${RED}?`;
const profitOverlay = new Overlay("kuudraProfit", ["Kuudra", "Paid Chest"], data.KL, "moveKP", profitExample);

//register("guiMouseClick", (x, y, button, gui) => {
    // print(gui.getSlotUnderMouse().field_75222_d);
//})

// WIP
registerWhen(register("guiOpened", () => {
    delay(() => {
        const container = Player.getContainer();
        if (container.getName() !== "Paid Chest") return;
        const tier = getTier();

        const primary = getItemValue(container.getStackInSlot(11));
        let secondary = container.getStackInSlot(12);
        secondary = items[secondary.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id")]?.[1] || getItemValue(secondary);
        let essence = container.getStackInSlot(14).getNBT().toObject().tag.display.Name;
        essence = parseInt(essence.slice(essence.indexOf('x') + 1)) * items.ESSENCE_CRIMSON[1];
        const teeth = settings.maxChili ? (items.ENCHANTMENT_TABASCO_3[1] - 64*items.CHILI_PEPPER[0])/6 * Math.ceil(tier / 2) : 0;
        const cost = KEY_COST[tier - 1][0] + KEY_COST[tier - 1][1] * Math.min(items.ENCHANTED_RED_SAND[0], items.ENCHANTED_MYCELIUM[0]);
        const value = primary + secondary + essence + teeth;
        const total = value - cost;

        profitOverlay.message = 
`${GOLD}${BOLD}Value (BIN): ${GREEN}+${commafy(value)}
${GOLD}${BOLD}Profit/Loss: ${GREEN}+${commafy(total)}

${AQUA}${BOLD}Primary: ${GREEN}+${commafy(primary)}
${DARK_AQUA}${BOLD}Secondary: ${GREEN}+${commafy(secondary)}
${DARK_PURPLE}${BOLD}Teeth: ${GREEN}+${commafy(teeth)}
${RED}${BOLD}Essence: ${GREEN}+${commafy(essence)}`;
    }, 100);

}), () => getWorld() === "Kuudra");
