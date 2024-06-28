import { YELLOW } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { unformatTime } from "../../utils/functions/format";

const tooltip = register("preItemRender", (_, __, slot) => {
  const item = Player.getContainer().getItems()[slot.getSlotIndex()];
  if (item === null) return;
  const lore = item
    .getLore()
    .join("\n")
    .split("\n")
    .slice(1)
    .map((line) => line.substring(4));
  const name = Player.getContainer().getName();

  // Calendar day date
  if (item.getName().startsWith("§aDay") && !item.getName().endsWith("]")) {
    const container = name.split(" ");
    const diff = container[0] === "Early" ? -1 : container[0] === "Late" ? 1 : 0;
    const month =
      3 * (["Spring", "Summer", "Autumn", "Winter"].indexOf(container[0 + Math.abs(diff)].replace(/,/g, "")) + 1) +
      diff -
      2;
    const day = item.getName().split(" ")[1] - 1;

    const until = month * 37_200 + day * 1_200 - ((new Date().getTime() / 1_000 - 107_704) % 446_400);
    const start = new Date(Date.now() + until * 1_000);
    const date = start.toLocaleDateString();
    const time = start.toLocaleTimeString();

    item.setName(`§aDay ${day + 1} §7[${YELLOW + date}, ${time.substring(0, time.length - 3).trim()}§7]`);
  } else if (name === "Calendar and Events") {
    // Calendar event date
    let startDate = Date.now();
    for (let i = 0; i < lore.length + 1; i++) {
      if (lore[i]?.startsWith("§7Starts in:") && !lore[i + 1]?.startsWith("§7Start Date")) {
        startDate = unformatTime(lore[i].removeFormatting()) * 1_000 + Date.now();
        const start = new Date(Math.round(startDate / 60_000) * 60_000);
        const date = start.toLocaleDateString();
        const time = start.toLocaleTimeString();
        lore.splice(i + 1, 0, `§7Start Date: ${YELLOW + date}, ${time.substring(0, time.length - 3)}`);
      } else if (lore[i]?.startsWith("§7Event lasts for") && !lore[i + 1]?.startsWith("§7End Date")) {
        const endDate = unformatTime(lore[i].removeFormatting()) * 1_000 + startDate;
        const end = new Date(Math.round(endDate / 60_000) * 60_000);
        const date = end.toLocaleDateString();
        const time = end.toLocaleTimeString();
        lore.splice(i + 1, 0, `§7End Date: ${YELLOW + date}, ${time.substring(0, time.length - 3)}`);
      }
    }
  } else if (name === "SkyBlock Menu" && item.getName().startsWith("§aCalendar")) {
    for (let i = 0; i < lore.length + 1; i++) {
      if (lore[i]?.startsWith("§7Starting in:") && !lore[i + 1]?.startsWith("§7Start Date")) {
        const startDate = unformatTime(lore[i].removeFormatting()) * 1_000 + Date.now();
        const start = new Date(Math.round(startDate / 60_000) * 60_000);
        const date = start.toLocaleDateString();
        const time = start.toLocaleTimeString();
        lore.splice(i + 1, 0, `§7Start Date: ${YELLOW + date}, ${time.substring(0, time.length - 3)}`);
      } else if (lore[i]?.startsWith("§7Ends in:") && !lore[i + 1]?.startsWith("§7End Date")) {
        const endDate = unformatTime(lore[i].removeFormatting()) * 1_000 + Date.now();
        const end = new Date(Math.round(endDate / 60_000) * 60_000);
        const date = end.toLocaleDateString();
        const time = end.toLocaleTimeString();
        lore.splice(i + 1, 0, `§7End Date: ${YELLOW + date}, ${time.substring(0, time.length - 3)}`);
      }
    }
  } else return;

  item.setLore(lore);
}).unregister();

const forge = register("preItemRender", (_, __, slot) => {
  const item = Player.getContainer().getItems()[slot.getSlotIndex()];
  if (item === null) return;
  const lore = item
    .getLore()
    .join("\n")
    .split("\n")
    .slice(1)
    .map((line) => line.substring(4));

  for (let i = 0; i < lore.length + 1; i++) {
    if (lore[i]?.startsWith("§7Duration:") && !lore[i + 1]?.startsWith("§7End Date")) {
      const duration = lore[i].removeFormatting().split(" ").slice(1).join("");
      const startDate = unformatTime(duration) * 1_000 + Date.now();
      const start = new Date(Math.round(startDate / 60_000) * 60_000);
      const date = start.toLocaleDateString();
      const time = start.toLocaleTimeString();
      lore.splice(i + 1, 0, `§7End Date: ${YELLOW + date}, ${time.substring(0, time.length - 3)}`);
    }
  }

  item.setLore(lore);
}).unregister();

const close = register("guiClosed", () => {
  forge.unregister();
  tooltip.unregister();
  close.unregister();
}).unregister();

registerWhen(
  register("guiOpened", () => {
    Client.scheduleTask(2, () => {
      const name = Player.getContainer().getName();
      const split = Player.getContainer().getName().split(" ");
      if (split[0] === "Calendar" || split[name.length - 2] === "Year" || name === "SkyBlock Menu") tooltip.register();
      else if (name.startsWith("Refine (Slot #") || name.startsWith("Item Casting (Slot #")) forge.register();
      else return;
      close.register();
    });
  }),
  () => Settings.calendarTime
);
