import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { getSlotCoords } from "../../utils/functions/find";

let unopened = {};

const highlight = register("guiRender", () => {
  Object.keys(unopened).forEach((index) => {
    const [x, y] = getSlotCoords(index);
    Renderer.translate(0, 0, 100);
    Renderer.drawRect(unopened[index], x, y, 16, 16);
  });
}).unregister();

const close = register("guiClosed", () => {
  close.unregister();
  highlight.unregister();
}).unregister();

registerWhen(
  register("guiOpened", () => {
    Client.scheduleTask(1, () => {
      if (Player.getContainer().getName() !== "Croesus") return;
      const items = Player.getContainer().getItems();
      unopened = {};

      // Iterate through the chest slots
      for (let i = 1; i < 5; i++) {
        for (let j = 1; j < 8; j++) {
          // Calculate the index of the item in the container
          let index = i * 9 + j;
          let lore = items[index]?.getLore();
          if (lore === undefined) continue;

          // Check if the chest is unopened, opened, or empty
          if (lore.find((line) => line === "§5§o§8No Chests Opened!") !== undefined) unopened[index] = Renderer.GREEN;
          else if (lore.find((line) => line.startsWith("§5§o§8Opened Chest:")) !== undefined)
            unopened[index] = Renderer.YELLOW;
        }
      }

      if (Object.keys(unopened).length > 0) {
        highlight.register();
        close.register();
      }
    });
  }),
  () => Settings.croesusHighlight
);
