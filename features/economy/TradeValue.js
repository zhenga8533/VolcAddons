import { BOLD, DARK_GREEN, DARK_RED, GOLD, GREEN, RED } from "../../utils/Constants";
import { data } from "../../utils/Data";
import { Overlay } from "../../utils/Overlay";
import { formatNumber } from "../../utils/functions/format";
import { getItemValue } from "./ItemPrice";

const tradeExample = `${DARK_RED + BOLD}Giving: ${RED}Nah
${DARK_GREEN + BOLD}Receiving: ${GREEN}I'd
${GOLD + BOLD}Profit: ${GREEN}Win`;
const tradeOverlay = new Overlay("tradeValue", data.TVL, "moveTrade", tradeExample, ["all"], "guiRender");
tradeOverlay.setMessage("");

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
  tradeOverlay.setMessage(`${DARK_RED + BOLD}Giving: ${RED + formatNumber(giving)}
${DARK_GREEN + BOLD}Receiving: ${GREEN + formatNumber(receiving)}
${GOLD + BOLD}Profit: ${(profit > 0 ? GREEN : RED) + formatNumber(profit)}`);
})
  .setFps(1)
  .unregister();

const setTrade = register("guiClosed", () => {
  updateTrade.unregister();
  tradeOverlay.setMessage("");
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
