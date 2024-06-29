/**
 * ARCHIVED
 */

import location from "../../utils/Location";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { getSlotCoords } from "../../utils/functions/find";

/**
 * Track and reset all unclaimed rewards on Jacob reward menu open.
 */
let unclaimed = [];
registerWhen(
  register("guiOpened", () => {
    Client.scheduleTask(2, () => {
      const container = Player.getContainer();
      if (container.getName() !== "Your Contests") return;

      const COLORS = {
        BRONZE: [205, 127, 50],
        SILVER: [192, 192, 192],
        GOLD: [255, 215, 0],
        PLATINUM: [229, 228, 226],
        DIAMOND: [185, 242, 255],
      };

      for (let i = 10; i <= 43; i++) {
        let lore = container
          .getStackInSlot(i)
          .getLore()
          .filter(
            (line) =>
              line.startsWith("§5§o§7You ") || line.startsWith("§5§o§7§7You") || line === "§5§o§eClick to claim reward!"
          );

        if (lore[1] !== undefined) {
          let medal = lore[0].split(" ")[4]?.removeFormatting();
          unclaimed.push([i, COLORS[medal] ?? [0, 0, 0]]);
        }
      }
    });
  }),
  () => location.getWorld() === "Garden" && Settings.jacobReward
);
registerWhen(
  register("guiClosed", () => {
    unclaimed = [];
  }),
  () => location.getWorld() === "Garden" && Settings.jacobReward
);

/**
 * Renders neon green box over unclaimed rewards.
 */
registerWhen(
  register("guiRender", () => {
    if (unclaimed.length === 0) return;

    unclaimed.forEach((index) => {
      const [x, y] = getSlotCoords(index[0]);

      const color = index[1];
      Renderer.translate(0, 0, 100);
      Renderer.drawRect(Renderer.color(...color, 255), x, y, 16, 16);
    });
  }),
  () => location.getWorld() === "Garden" && Settings.jacobReward
);
