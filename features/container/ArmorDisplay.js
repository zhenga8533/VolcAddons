import { data, itemNBTs } from "../../utils/Data";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { compressNBT, decompressNBT, parseTexture } from "../../utils/functions/misc";
import { Button } from "./ContainerButtons";

/**
 * Render armor pieces as icons
 */
const barrier = new Item("minecraft:barrier");
const pieces = [null, null, null, null];
new Overlay("armorDisplay", data.UL, "moveArmor", "Armor", ["all"], "renderOverlay", () => {
  let yDiff = -15 * data.UL[2];

  pieces.forEach((piece) => {
    yDiff += 15 * data.UL[2];
    if (piece === null) {
      barrier.draw(data.UL[0], data.UL[1] + yDiff, data.UL[2]);
      return;
    }

    // Draw icon
    piece.draw(data.UL[0], data.UL[1] + yDiff, data.UL[2]);

    // Draw cd/stars
    const size = piece.getStackSize();
    if (size > 1) Renderer.drawString(size, data.UL[0] - Renderer.getStringWidth(size), data.UL[1] + yDiff);
  });

  return true;
});

/**
 * Get player armor pieces
 */
registerWhen(
  register("tick", () => {
    const armor = Player.armor;
    pieces[0] = armor.getHelmet();
    pieces[1] = armor.getChestplate();
    pieces[2] = armor.getLeggings();
    pieces[3] = armor.getBoots();
  }),
  () => Settings.armorDisplay
);

/**
 * Render equipment pieces as icons
 */
const buttons = [];
let equipment = itemNBTs.equip.map((nbt, index) => {
  if (nbt === null) return null;

  const item = new Item(net.minecraft.item.ItemStack.func_77949_a(NBT.parse(decompressNBT(nbt)).rawNBT));
  let texture;

  if (item.getUnlocalizedName() === "item.skull") {
    // Fix skull textures not rendering
    const skullNBT = item.getNBT().getCompoundTag("tag").getCompoundTag("SkullOwner");
    texture = skullNBT.getCompoundTag("Properties").getTagList("textures", 0).func_150305_b(0).func_74779_i("Value");
    const skull = parseTexture(texture);
    item.getNBT().getCompoundTag("tag").set("SkullOwner", skull);
  } else texture = "stained_glass_pane";

  // Create inv eq button
  buttons.push(
    new Button(
      "eq",
      index * 9,
      () => {
        ChatLib.command("equipment");
      },
      "equipment",
      texture,
      data.equipmentLore[index] ?? []
    )
  );

  return item;
});

/**
 * Equipment button handling
 */
const click = register("guiMouseClick", (x, y, button, gui) => {
  const left = gui?.getGuiLeft() ?? 0;
  const top = gui?.getGuiTop() ?? 0;

  Object.keys(buttons).forEach((key) => {
    buttons[key].click(left, top, x, y, button);
  });
}).unregister();

const render = register("guiRender", (x, y, gui) => {
  const top = gui?.getGuiTop() ?? 0;
  const left = gui?.getGuiLeft() ?? 0;

  Object.keys(buttons).forEach((key) => {
    buttons[key].draw(left, top);
    buttons[key].hover(left, top, x, y);
  });
}).unregister();

const close = register("guiClosed", () => {
  // Set registers
  render.unregister();
  click.unregister();
  close.unregister();
}).unregister();

registerWhen(
  register("guiOpened", (event) => {
    const gui = event.gui;
    const name = gui.class.toString().split(".");
    container = name[name.length - 1];
    if (container !== "GuiInventory" && container !== "GuiChest") return;

    click.register();
    close.register();
    render.register();
    Client.scheduleTask(1, () => {
      click.register();
      close.register();
      render.register();
    });
  }),
  () => Settings.equipDisplay
);

/**
 * Equipment Overlay
 */
new Overlay("equipDisplay", data.EQL, "moveEq", "Equip", ["all"], "renderOverlay", () => {
  if (!Settings.equipDisplay) return;
  let yDiff = -15 * data.EQL[2];

  equipment.forEach((piece) => {
    yDiff += 15 * data.EQL[2];
    if (piece === null) {
      barrier.draw(data.EQL[0], data.EQL[1] + yDiff, data.EQL[2]);
      return;
    }

    // Draw icon
    piece.draw(data.EQL[0], data.EQL[1] + yDiff, data.EQL[2]);

    // Draw cd/stars
    const size = piece.getStackSize();
    if (size > 1) Renderer.drawString(size, data.EQL[0] - Renderer.getStringWidth(size), data.EQL[1] + yDiff);
  });

  return true;
});

/**
 * Get player equipment pieces
 */
function updateEquipment() {
  const container = Player.getContainer();
  if (container.getName() !== "Your Equipment and Stats") return;

  equipment = [
    container.getStackInSlot(10),
    container.getStackInSlot(19),
    container.getStackInSlot(28),
    container.getStackInSlot(37),
  ];

  for (let i = 0; i < 4; i++) {
    let item = equipment[i];
    if (item.getID() === 160) {
      buttons[i].setItem("stained_glass_pane", []);
      continue;
    }

    let skullNBT = item.getNBT().getCompoundTag("tag").getCompoundTag("SkullOwner");
    let texture = skullNBT.getCompoundTag("Properties").getTag("textures").getRawNBT();
    buttons[i].setItem(texture.func_150305_b(0).func_74779_i("Value"), item.getLore());
  }
}

registerWhen(
  register("guiMouseClick", () => {
    Client.scheduleTask(1, updateEquipment);
  }),
  () => Settings.equipDisplay
);
registerWhen(
  register("guiOpened", () => {
    Client.scheduleTask(1, updateEquipment);
  }),
  () => Settings.equipDisplay
);

/**
 * Persistant armor and equip.
 */
register("gameUnload", () => {
  itemNBTs.armor = pieces.map((piece) => (piece === null ? null : compressNBT(piece.getNBT().toObject())));
  itemNBTs.equip = equipment.map((piece, index) => {
    if (piece?.getLore()?.length > 1) data.equipmentLore[index] = [...piece.getLore()];
    return piece === null ? null : compressNBT(piece.getNBT().toObject());
  });
}).setPriority(Priority.HIGHEST);
