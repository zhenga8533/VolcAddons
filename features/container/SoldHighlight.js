import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { getSlotCoords } from "../../utils/functions/find";

let own = [];
let coop = [];

const renderSold = register("guiRender", () => {
  own.forEach((index) => {
    const [x, y] = getSlotCoords(index);

    Renderer.translate(0, 0, 100);
    Renderer.drawRect(Renderer.GREEN, x, y, 16, 16);
  });

  coop.forEach((index) => {
    const [x, y] = getSlotCoords(index);

    Renderer.translate(0, 0, 100);
    Renderer.drawRect(Renderer.GOLD, x, y, 16, 16);
  });
}).unregister();

const clear = register("guiClosed", () => {
  own = [];
  coop = [];
  renderSold.unregister();
  clear.unregister();
}).unregister();

registerWhen(
  register("guiOpened", () => {
    Client.scheduleTask(2, () => {
      if (Player.getContainer().getName() !== "Manage Auctions") return;
      renderSold.register();
      clear.register();

      // Fetch all sold items
      Player.getContainer()
        .getItems()
        .forEach((item, index) => {
          if (item !== null && item.getLore().find((line) => line === "§5§o§7Status: §aSold!") !== undefined) {
            if (item.getLore().find((line) => line === "§5§o§aThis is your own auction!") !== undefined)
              own.push(index);
            else coop.push(index);
          }
        });
    });
  }),
  () => Settings.auctionHighlight
);
