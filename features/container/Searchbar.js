import { DARK_GRAY, GuiTextField, ITALIC } from "../../utils/Constants";
import { data, itemNBTs } from "../../utils/Data";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { getSlotCoords } from "../../utils/functions/find";
import { decompressNBT } from "../../utils/functions/misc";

// Search bar parameters
const loc = data.XL;
const searchbar = new GuiTextField(0, Client.getMinecraft().field_71466_p, loc[0], loc[1], 192, 16);
let calc = undefined;

// Finds items to highlight based on user search
let indexes = [];
let darken = [];
function getHighlights() {
  indexes = [];
  darken = [];
  const text = searchbar.func_146179_b();
  if (text === "") return;

  // Find highlights
  const search = text.replace(/[^a-zA-Z0-9&|]/g, "").toLowerCase();
  if (search.length === 0) return;

  // Highlight backpack slots if in storage
  if (Player.getContainer().getName() === "Storage") {
    getContainers(search);
    return;
  }

  // Find current container content matches
  const contents = search.split("||").map((ors) => ors.split("&&"));
  Player.getContainer()
    .getItems()
    .forEach((item, index) => {
      if (item === null) return;
      const name = item
        .getName()
        .removeFormatting()
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();
      const lore = item
        .getLore()
        .join("")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();

      let toAdd = contents.length;
      contents.forEach((content) => {
        for (let cont of content) {
          if (!name.includes(cont) && !lore.includes(cont)) {
            toAdd--;
            break;
          }
        }
      });
      if (toAdd !== 0) indexes.push(index);
      else darken.push(index);
    });
}

function getContainers(search) {
  const contents = search.split("||").map((ors) => ors.split("&&"));
  itemNBTs.enderchests.forEach((ec, index) => {
    if (
      ec.find((nbt) => {
        if (nbt === null) return false;
        const display = decompressNBT(nbt).tag.display;
        const name = display.Name.removeFormatting()
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase();
        const lore =
          display.Lore === undefined
            ? ""
            : display.Lore.join("")
                .replace(/[^a-zA-Z0-9]/g, "")
                .toLowerCase();

        return (
          contents.find((content) => {
            for (let cont of content) {
              if (name.includes(cont) || lore.includes(cont)) return true;
            }
          }) !== undefined
        );
      }) !== undefined
    )
      indexes.push(9 + index);
  });

  itemNBTs.backpacks.forEach((ec, index) => {
    if (
      ec.find((nbt) => {
        if (nbt === null) return false;
        const display = decompressNBT(nbt).tag.display;
        const name = display.Name.removeFormatting()
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase();
        const lore =
          display.Lore === undefined
            ? ""
            : display.Lore.join("")
                .replace(/[^a-zA-Z0-9]/g, "")
                .toLowerCase();

        return (
          contents.find((content) => {
            for (let cont of content) {
              if (name.includes(cont) || lore.includes(cont)) return true;
            }
          }) !== undefined
        );
      }) !== undefined
    )
      indexes.push(27 + index);
  });
}

// Render item highlights and search bar
registerWhen(
  register("guiRender", (x, y, gui) => {
    if (!gui.class.getName().startsWith("net.minecraft.client.gui.inventory.")) return;
    searchbar.func_146194_f();

    indexes.forEach((index) => {
      const [x, y] = getSlotCoords(index);

      Renderer.translate(0, 0, 100);
      Renderer.drawRect(Renderer.color(255, 255, 255, 255), x - 1, y - 1, 18, 18);
    });
    darken.forEach((index) => {
      const [x, y] = getSlotCoords(index);

      Renderer.translate(0, 0, 100);
      Renderer.drawRect(Renderer.color(0, 0, 0, 255), x, y, 16, 16);
    });

    if (calc !== undefined)
      Renderer.drawString(DARK_GRAY + calc, loc[0] - Renderer.getStringWidth(calc) + 190, loc[1] + 4);
  }),
  () => Settings.searchbar
);

/**
 * Stuff to move searchbox
 */
const gui = new Gui();
const renderOverlay = register("renderOverlay", () => {
  if (!gui.isOpen()) return;
  Renderer.drawString(`${ITALIC}x: ${Math.round(loc[0])}, y: ${Math.round(loc[1])}`, loc[0] + 2, loc[1] - 10);
  Renderer.drawLine(Renderer.WHITE, loc[0], 1, loc[0], Renderer.screen.getHeight(), 0.5);
  Renderer.drawLine(Renderer.WHITE, Renderer.screen.getWidth(), loc[1], 1, loc[1], 0.5);
  searchbar.func_146194_f();
}).unregister();

// Render searchbox when moving
register("command", () => {
  renderOverlay.register();
  gui.open();
})
  .setName("moveSearchbox", true)
  .setAliases("moveSearch");

// Moving searchbox
registerWhen(
  register("guiMouseDrag", (x, y) => {
    if (!gui.isOpen()) return;

    loc[0] = x;
    loc[1] = y;
    searchbar.field_146209_f = x;
    searchbar.field_146210_g = y;
  }),
  () => Settings.searchbar
);

// Detect mouse click on box
registerWhen(
  register("guiMouseClick", (x, y, button) => {
    searchbar.func_146192_a(x, y, button);
    Client.scheduleTask(3, getHighlights);
  }),
  () => Settings.searchbar
);

// Searchbox key detects
registerWhen(
  register("guiKey", (char, keyCode, _, event) => {
    if (!searchbar.func_146206_l()) return;

    // Update searchbar and highlights
    searchbar.func_146201_a(char, keyCode);
    getHighlights();

    // Update calculation
    calc = undefined;
    try {
      calc = eval(searchbar.func_146179_b());
      if (!isNaN(calc)) {
        if (!Number.isInteger(calc)) calc = Math.round(calc * 10000) / 10000;
        calc = calc.toString();
      } else calc = "";
    } catch (err) {
      calc = undefined;
    }

    // Cancel all but escape key
    if (keyCode != 1) cancel(event);
  }),
  () => Settings.searchbar
);

// Reset search when opening gui
registerWhen(
  register("guiOpened", () => {
    Client.scheduleTask(1, getHighlights);
  }),
  () => Settings.searchbar
);

// Exit search when closing gui
registerWhen(
  register("guiClosed", () => {
    if (gui.isOpen()) renderOverlay.unregister();
    searchbar.func_146195_b(false);
    indexes.length = 0;
  }),
  () => Settings.searchbar
);
