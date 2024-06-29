import { GOLD, YELLOW } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { commafy, unformatNumber } from "../../utils/functions/format";

let craftable = 0;

const tooltip = register("preItemRender", (_, __, slot) => {
  const button = Player.getContainer().getItems()[slot.getSlotIndex()];
  if (!button?.getName()?.startsWith("§aSupercraft")) return;

  // Put the max craftable amount into lore
  const lore = button.getLore().join("\n").split("\n").slice(1);
  const i = lore.findIndex(
    (line, index) => line.startsWith("§5§o§7§aCrafting") && !lore[index + 1]?.startsWith(`§5§o${GOLD} Max Craftable:`)
  );
  if (i === -1) return;

  lore.splice(i + 1, 0, `${GOLD}Max Craftable: ${YELLOW + commafy(craftable)}`);
  button.setLore(lore);
}).unregister();

const close = register("guiClosed", () => {
  tooltip.unregister();
  close.unregister();
}).unregister();

registerWhen(
  register("guiOpened", () => {
    Client.scheduleTask(3, () => {
      // Check if the container is a supercrafting table
      const container = Player.getContainer();
      const button = container.getStackInSlot(32);
      const name = button?.getName();
      if (!name.startsWith("§aSupercraft")) return;

      // Get the max craft amount
      maxCraft = Infinity;
      button.getLore().forEach((line) => {
        if (!line.startsWith("§5§o §a✔") && !line.startsWith("§5§o §c✖")) return;

        const ratio = line.split(" ")[2].removeFormatting().split("/");
        const current = unformatNumber(ratio[0]);
        const required = unformatNumber(ratio[1]);

        maxCraft = Math.min(maxCraft, Math.floor(current / required));
      });
      if (maxCraft === Infinity) maxCraft = 0;

      // Get empty inventory slots to find the max craftable amount
      const crafting =
        name === "§aSupercraft"
          ? container.getStackInSlot(25).getStackSize()
          : unformatNumber(name.split(" ")[1].removeFormatting().replace(/[x(]/g, ""));
      const freeSpace =
        64 *
        Player.getInventory()
          .getItems()
          .reduce((acc, item) => acc + (item === null), 0);
      craftable = Math.min(maxCraft * crafting, freeSpace);

      // Set registers
      tooltip.register();
      close.register();
    });
  }),
  () => Settings.maxSupercraft
);
