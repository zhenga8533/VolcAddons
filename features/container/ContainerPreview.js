import { BOLD, DARK_GRAY, GOLD, GREEN, LOGO, RED, YELLOW } from "../../utils/Constants";
import { data, itemNBTs } from "../../utils/Data";
import { printList } from "../../utils/ListTils";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { compressNBT, parseContainerCache } from "../../utils/functions/misc";
import { drawContainer } from "../../utils/functions/render";

/**
 * Log item data as compressed NBT.
 */
let nameCache = ["T1", 0];
let itemsCache = [];
new Overlay("containerPreview", data.SPL, "moveSP", "Saved Preview", ["all"], "guiRender");

/**
 * Preview commands for container data.
 *
 * @param {String[]} args - Command arguments.
 */
export function previewCommands(args) {
  const command = args[1];
  const name = args[2] ?? nameCache.join("");

  switch (command) {
    case "save":
      itemNBTs.storageCache[name] = itemsCache.map((item) =>
        item === null ? null : compressNBT(item.getNBT().toObject())
      );
      ChatLib.chat(`${LOGO + GREEN}Successfully saved preview data using key: "${name}".`);
      break;
    case "delete":
    case "remove":
      delete itemNBTs.storageCache[name];
      ChatLib.chat(`${LOGO + GREEN}Successfully removed preview data using key: "${name}".`);
      break;
    case "clear":
    case "reset":
      itemNBTs.storageCache = {};
      ChatLib.chat(`${LOGO + GREEN}Successfully cleared preview data.`);
      break;
    case "list":
    case "view":
      const keys = Object.keys(itemNBTs.storageCache);
      printList(keys, "Preview", parseInt(args[2] ?? 1));
      break;
    case "help":
    default:
      if (command !== "help") ChatLib.chat(`${LOGO + RED}Error: Invalid argument "${command}"!\n`);
      ChatLib.chat(
        `${LOGO + GOLD + BOLD}Container Preview Commands:
 ${DARK_GRAY}- ${GOLD}Base: ${YELLOW}/va preview <command>

 ${DARK_GRAY}- ${GOLD}save: ${YELLOW}Saves preview data of last opened storage.
 ${DARK_GRAY}- ${GOLD}delete: ${YELLOW}Deletes preview data of last opened storage.
 ${DARK_GRAY}- ${GOLD}clear: ${YELLOW}Removes all preview data.
 ${DARK_GRAY}- ${GOLD}list: ${YELLOW}Lists all preview data.
 ${DARK_GRAY}- ${GOLD}help: ${YELLOW}Displays this help message.`
      );
      break;
  }
}

/**
 * Registers for cache saving and preview rendering.
 */
let previewCache = [];
const savePreview = register("guiRender", (mouseX, mouseY) => {
  drawContainer(
    data.SPL[0],
    data.SPL[1],
    Player.getContainer().getName(),
    CONTAINER_PNGS[Settings.containerPreview - 1],
    previewCache,
    mouseX,
    mouseY
  );
}).unregister();

const cacheItems = register("guiMouseClick", () => {
  Client.scheduleTask(4, () => {
    const items = Player.getContainer().getItems();
    if (items.length < 54) return;
    itemsCache = items.slice(0, 54);
  });
}).unregister();

const saveCache = register("guiClosed", () => {
  // Save cache
  if (!itemNBTs.storageCache.hasOwnProperty(nameCache.join(""))) {
    if (nameCache[0] === "EC")
      itemNBTs.enderchests[nameCache[1]] = itemsCache.map((item) =>
        item === null ? null : compressNBT(item.getNBT().toObject())
      );
    else if (nameCache[0] === "BP")
      itemNBTs.backpacks[nameCache[1]] = itemsCache.map((item) =>
        item === null ? null : compressNBT(item.getNBT().toObject())
      );
  }

  // Unregister events
  saveCache.unregister();
  savePreview.unregister();
  cacheItems.unregister();
}).unregister();

register("guiOpened", () => {
  Client.scheduleTask(1, () => {
    const name = Player.getContainer().getName();
    const split = name.split(" ");

    // Get container cache
    const containerCache = name.startsWith("Ender Chest")
      ? [itemNBTs.enderchests, "EC"]
      : split[1].startsWith("Backpack")
      ? [itemNBTs.backpacks, "BP"]
      : undefined;
    if (containerCache === undefined) return;
    itemsCache = Player.getContainer().getItems().slice(0, 54);

    // Get index of container
    const i = (split[1].startsWith("Backpack") ? split[split.length - 1].replace(/[^0-9]/g, "") : split[2][1]) - 1;
    nameCache = [containerCache[1], i];

    // Set registers
    saveCache.register();
    cacheItems.register();
    if (itemNBTs.storageCache.hasOwnProperty(nameCache.join(""))) {
      previewCache = parseContainerCache(itemNBTs.storageCache[nameCache.join("")]);
      savePreview.register();
    }
  });
});

/**
 * Render preview on container hover.
 */
let lastPreview = "0";
let previewItems = [];
const CONTAINER_PNGS = [new Image("container.png"), new Image("container-fs.png")];
new Overlay("containerPreview", data.CPL, "movePreview", "Preview", ["all"], "guiRender");

const preview = register("guiRender", (mouseX, mouseY) => {
  drawContainer(
    data.CPL[0],
    data.CPL[1],
    lastPreview,
    CONTAINER_PNGS[Settings.containerPreview - 1],
    previewItems,
    mouseX,
    mouseY
  );
}).unregister();

const clear = register("guiClosed", () => {
  previewItems = [];
  lastPreview = "0";
  preview.unregister();
  clear.unregister();
}).unregister();

registerWhen(
  register("itemTooltip", (_, item) => {
    const name = item.getName();

    if (name.startsWith("§aEnder Chest Page") || name.startsWith("§6Backpack Slot")) {
      const split = name.split(" ");
      const i = parseInt(split[split.length - 1]) - 1;
      if (lastPreview === name) return;

      lastPreview = name;
      previewItems = parseContainerCache(itemNBTs[name.startsWith("§a") ? "enderchests" : "backpacks"][i]);

      preview.register();
      clear.register();
    }
  }),
  () => Settings.containerPreview !== 0
);
