import { BOLD, DARK_GREEN, DARK_RED, GOLD, GREEN, RED } from "../../utils/constants";
import { formatNumber } from "../../utils/functions/format";
import { Overlay } from "../../utils/overlay";
import { data } from "../../utils/variables";
import { getItemValue } from "./ItemPrice";


const tradeExample = 
`${DARK_RED + BOLD}Giving: ${RED}Nah
${DARK_GREEN + BOLD}Receiving: ${GREEN}I'd
${GOLD + BOLD}Profit: ${GREEN}Win`;
const tradeOverlay = new Overlay("tradeValue", ["all", "misc"],
() => true, data.TVL, "moveTrade", tradeExample);
tradeOverlay.message = "";

const updateTrade = register("step", () => {
    const container = Player.getContainer();
    let giving = 0;
    let receiving = 0;
    let index = 0;

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            giving += getItemValue(container.getStackInSlot(index));
            receiving += getItemValue(container.getStackInSlot(index + 4));
            index += 1;
        }
        index += 5;
    }

    const profit = receiving - giving;
    tradeOverlay.message = `${DARK_RED + BOLD}Giving: ${RED + formatNumber(giving)}
${DARK_GREEN + BOLD}Receiving: ${GREEN + formatNumber(receiving)}
${GOLD + BOLD}Profit: ${(profit > 0 ? GREEN : RED) + formatNumber(profit)}`;
}).setFps(1).unregister();

const setTrade = register("guiClosed", () => {
    updateTrade.unregister();
    tradeOverlay.message = "";
}).unregister();

register("guiOpened", () => {
    Client.scheduleTask(3, () => {
        const container = Player.getContainer();
        if (container.getName().startsWith("You                  ")) {
            updateTrade.register();
            setTrade.register();
        }
    });
});
