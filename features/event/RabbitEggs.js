import {
  AMOGUS,
  BOLD,
  DARK_GRAY,
  GOLD,
  GRAY,
  GREEN,
  LIGHT_PURPLE,
  LOGO,
  RED,
  STAND_CLASS,
  WHITE,
  YELLOW,
} from "../../utils/Constants";
import { data } from "../../utils/Data";
import { Json } from "../../utils/Json";
import { printList } from "../../utils/ListTils";
import { default as Location, default as location } from "../../utils/Location";
import { Overlay } from "../../utils/Overlay";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";
import Waypoint from "../../utils/Waypoint";
import { getClosest } from "../../utils/functions/find";
import { formatTime, unformatNumber } from "../../utils/functions/format";
import { playSound } from "../../utils/functions/misc";

/**
 * Missing rabbits
 */
const missingRabbits = new Json("rabbits.json", true).getData();
register("guiOpened", () => {
  Client.scheduleTask(1, () => {
    if (!Player.getContainer().getName().endsWith("Hoppity's Collection")) return;

    const items = Player.getContainer().getItems();
    for (let i = 1; i < 5; i++) {
      for (let j = 1; j < 8; j++) {
        // Track rabbits with requirements
        let item = items[i * 9 + j];
        let lore = item?.getLore();
        let index = lore?.findIndex((line) => line.includes("Requirement"));
        if (index === -1) continue;

        // Track duplicates
        let dupeI = lore?.findIndex((line) => line.endsWith("§7duplicate Rabbits."));
        if (dupeI !== -1) {
          let dupes = unformatNumber(lore[dupeI - 1]?.removeFormatting()?.split(" ")?.[2]?.split("/")?.[0]);
          if (dupes !== 0) data.eggs.dupe = dupes;
        }

        // Get rabbit data
        let complete = !lore[index].startsWith("§5§o§c✖");
        let name = item.getName();

        // Get requirement
        let requirement = lore[index] + "\n    ";
        while (lore[++index]?.length > 4) requirement += " " + lore[index];

        // Update missing rabbits
        if (!complete) missingRabbits[name] = requirement;
        else if (missingRabbits.hasOwnProperty(name)) delete missingRabbits[name];
      }
    }
  });
});

/**
 * Print missing rabbits.
 *
 * @param {Number} page - The page number to display.
 */
export function printRabbits(page, backup) {
  printList(missingRabbits, "Rabbits", isNaN(page) ? backup : page, 6, false);
  if (Object.keys(missingRabbits).length === 30)
    ChatLib.chat(`${DARK_GRAY}Remember to go through rabbits menu to initialize tracking!`);
}

/**
 * Rabbit chat detection.
 */
register("chat", (x) => {
  data.cf.chocolate += parseInt(x.replace(/,/g, "") || 0);
  data.eggs.dupe++;
}).setCriteria("DUPLICATE RABBIT! +${x} Chocolate");

registerWhen(
  register("chat", (choco, mult) => {
    const cf = data.cf;
    cf.multiplier += parseFloat(mult);
    cf.production += parseInt(choco) * cf.multiplier;
    data.eggs.total++;
  }).setCriteria("NEW RABBIT! +${choco} Chocolate and +${mult}x Chocolate per second!"),
  () => Settings.chocoDisplay
);

registerWhen(
  register("chat", (mult) => {
    if (isNaN(mult)) return;
    data.cf.multiplier += parseFloat(mult);
    data.eggs.total++;
  }).setCriteria("NEW RABBIT! +${mult}x Chocolate per second!"),
  () => Settings.chocoDisplay
);

/**
 * Egglocator
 */
const eggLocs = [];
const eggWaypoints = new Waypoint([0.25, 0.1, 0]); // Brown Eggs
const newWaypoints = new Waypoint([0.88, 0.75, 0.72]); // Rose Gold Eggs
let updateUniques = false;

const EGGS = {
  ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjY3MzE0OSwKICAicHJvZmlsZUlkIiA6ICJiN2I4ZTlhZjEwZGE0NjFmOTY2YTQxM2RmOWJiM2U4OCIsCiAgInByb2ZpbGVOYW1lIiA6ICJBbmFiYW5hbmFZZzciLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvYTQ5MzMzZDg1YjhhMzE1ZDAzMzZlYjJkZjM3ZDhhNzE0Y2EyNGM1MWI4YzYwNzRmMWI1YjkyN2RlYjUxNmMyNCIKICAgIH0KICB9Cn0:
    "Breakfast",
  ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjU2ODExMiwKICAicHJvZmlsZUlkIiA6ICI3NzUwYzFhNTM5M2Q0ZWQ0Yjc2NmQ4ZGUwOWY4MjU0NiIsCiAgInByb2ZpbGVOYW1lIiA6ICJSZWVkcmVsIiwKICAic2lnbmF0dXJlUmVxdWlyZWQiIDogdHJ1ZSwKICAidGV4dHVyZXMiIDogewogICAgIlNLSU4iIDogewogICAgICAidXJsIiA6ICJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlLzdhZTZkMmQzMWQ4MTY3YmNhZjk1MjkzYjY4YTRhY2Q4NzJkNjZlNzUxZGI1YTM0ZjJjYmM2NzY2YTAzNTZkMGEiCiAgICB9CiAgfQp9:
    "Lunch",
  ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjY0OTcwMSwKICAicHJvZmlsZUlkIiA6ICI3NGEwMzQxNWY1OTI0ZTA4YjMyMGM2MmU1NGE3ZjJhYiIsCiAgInByb2ZpbGVOYW1lIiA6ICJNZXp6aXIiLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZTVlMzYxNjU4MTlmZDI4NTBmOTg1NTJlZGNkNzYzZmY5ODYzMTMxMTkyODNjMTI2YWNlMGM0Y2M0OTVlNzZhOCIKICAgIH0KICB9Cn0:
    "Dinner",
};
let looted = {
  Breakfast: false,
  Brunch: false,
  Lunch: false,
  Déjeuner: false,
  Dinner: false,
  Supper: false,
};
let lastLooted = {
  Breakfast: 0,
  Brunch: 0,
  Lunch: 0,
  Déjeuner: 0,
  Dinner: 0,
  Supper: 0,
};

// Track if egg was looted.
registerWhen(
  register("chat", (type) => {
    looted[type] = true;

    // Set last looted time
    if (lastLooted[type] === 0) {
      const time = Location.getTime();
      const offset =
        type === "Breakfast"
          ? time >= 1_000
            ? 1_000 - time
            : -23_000 - time
          : type === "Lunch"
          ? time >= 8_000
            ? 8_000 - time
            : -16_000 - time
          : type === "Dinner"
          ? time >= 15_000
            ? 15_000 - time
            : -9_000 - time
          : 0;
      lastLooted[type] = Date.now() + offset * 50;
    }
  }).setCriteria("You have already collected this Chocolate ${type} Egg! Try again when it respawns!"),
  () => (Settings.chocoWaypoints || Settings.eggTimers) && location.getSeason() === "Spring"
);

registerWhen(
  register("chat", (type) => {
    // Set looted status and last looted time
    looted[type] = true;
    const time = Location.getTime();
    const offset =
      type === "Breakfast"
        ? time >= 1_000
          ? 1_000 - time
          : -23_000 - time
        : type === "Lunch"
        ? time >= 8_000
          ? 8_000 - time
          : -16_000 - time
        : type === "Dinner"
        ? time >= 15_000
          ? 15_000 - time
          : -9_000 - time
        : 0;
    lastLooted[type] = Date.now() + offset * 50 + 5_500;

    // Track egg location
    const found = data.eggs.found;
    const world = location.getWorld();
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], eggLocs)[0];
    const wpKey = closest[0] + "," + closest[2];
    if (!found.hasOwnProperty(world)) found[world] = {};

    if (!found[world].hasOwnProperty(wpKey)) {
      found[world][wpKey] = 1;
      if (updateUniques) ChatLib.command("va eggs unique", true);
    } else found[world][wpKey]++;
  }).setCriteria("HOPPITY'S HUNT You found a Chocolate ${type} Egg ${loc}!"),
  () => (Settings.chocoWaypoints || Settings.eggTimers) && location.getSeason() === "Spring"
);

registerWhen(
  register("chat", (type) => {
    looted[type] = false;
  }).setCriteria("HOPPITY'S HUNT A Chocolate ${type} Egg has appeared!"),
  () => (Settings.chocoWaypoints || Settings.eggTimers) && location.getSeason() === "Spring"
);

// ArmorStand ESP susge, UAYOR
registerWhen(
  register("step", () => {
    const stands = World.getAllEntitiesOfType(STAND_CLASS);
    eggWaypoints.clear();
    newWaypoints.clear();
    const eggOld = [...eggLocs];
    eggLocs.length = 0;

    stands.forEach((stand) => {
      // Check if valid armor stand
      const helmet = stand.getEntity()?.func_71124_b(4); // getEquipmentInSlot(0: Tool in Hand; 1-4: Armor)
      if (helmet === null) return;

      // Check if valid egg ID
      // const id = helmet.func_77978_p()?.func_74775_l("SkullOwner")?.func_74779_i("Id"); // getNBT() => getNBTTagCompound() => getString()
      const texture = helmet
        .func_77978_p()
        ?.func_74775_l("SkullOwner")
        ?.func_74775_l("Properties")
        ?.func_150295_c("textures", 10)
        ?.func_150305_b(0)
        ?.func_74779_i("Value");
      if (!(texture in EGGS)) return;
      const eggType = EGGS[texture];
      if (eggType === "Breakfast" && looted.Breakfast && looted.Brunch) return;
      if (eggType === "Lunch" && looted.Lunch && looted.Déjeuner) return;
      if (eggType === "Dinner" && looted.Dinner && looted.Supper) return;

      // Add waypoint
      const wp = [eggType, stand.getX(), stand.getY() + 1, stand.getZ()];
      const coords = wp.slice(1);
      const dupe = data.eggs.found[location.getWorld()]?.hasOwnProperty(`${wp[1]},${wp[3]}`);

      eggLocs.push(coords);
      if (dupe) eggWaypoints.push(wp);
      else newWaypoints.push(wp);

      // Announce egg if new
      const coordsStr = coords.toString();
      if (eggOld.find((egg) => coordsStr === egg.toString()) === undefined)
        ChatLib.chat(
          `${LOGO + YELLOW}Found a ${eggType} Egg: ${coords.map((c) => Math.round(c)).join(", ")}! ${
            dupe ? GREEN + "✔" : RED + "✘"
          }`
        );
    });
  }).setFps(1),
  () => Settings.chocoWaypoints
);

/**
 * Egg timer overlay.
 *
 * 18k = midnight
 * Breakfast- 7:00 am = 1_000
 * Lunch- 2:00 pm = 8_000
 * Dinner- 9:00 pm = 15_000
 */
const eggExample = `${GOLD + BOLD}Egg Timers:
 ${YELLOW}Breakfast: ${WHITE}bling
 ${YELLOW}Lunch: ${WHITE}bang
 ${YELLOW}Dinner: ${WHITE}bang`;
const eggOverlay = new Overlay("eggTimers", data.CGL, "moveEgg", eggExample);

registerWhen(
  register("step", () => {
    const time = Location.getTime();
    const breakfastTime = time > 1_000 ? 25_000 - time : 1_000 - time;
    const lunchTime = time > 8_000 ? 32_000 - time : 8_000 - time;
    const dinnerTime = time > 15_000 ? 39_000 - time : 15_000 - time;
    eggOverlay.setMessage(
      `${GOLD + BOLD}Egg Timers:
 ${YELLOW}Breakfast: ${WHITE + formatTime(breakfastTime / 20)} ${looted.Breakfast ? GREEN + "✔" : RED + "✘"} ${
        looted.Brunch ? GREEN + "✔" : RED + "✘"
      }
 ${YELLOW}Lunch: ${WHITE + formatTime(lunchTime / 20)} ${looted.Lunch ? GREEN + "✔" : RED + "✘"} ${
        looted.Déjeuner ? GREEN + "✔" : RED + "✘"
      }
 ${YELLOW}Dinner: ${WHITE + formatTime(dinnerTime / 20)} ${looted.Dinner ? GREEN + "✔" : RED + "✘"} ${
        looted.Supper ? GREEN + "✔" : RED + "✘"
      }`
    );
  }).setFps(1),
  () => Settings.eggTimers && location.getSeason() === "Spring"
);

registerWhen(
  register("chat", (type) => {
    setTitle(`${LIGHT_PURPLE + BOLD}EGG SPAWNED!`, `${GOLD}A ${type} Egg ${GOLD}has spawned.`, 10, 50, 10, 40);
  }).setCriteria("&r&d&lHOPPITY'S HUNT &r&dA &r${type} Egg &r&dhas appeared!&r"),
  () => Settings.eggTimers && location.getSeason() === "Spring"
);

/**
 * Stray rabbit detection.
 */
const strayDetect = register("step", () => {
  if (Player.getContainer().getName() !== "Chocolate Factory") return;
  const items = Player.getContainer().getItems();

  for (let i = 0; i < 27; i++) {
    if (i === 13) continue;

    let item = items[i];
    if (item !== null && item.getRegistryName() !== "minecraft:stained_glass_pane") {
      // Gold: 794465b5-3bd2-38fc-b02f-0b51d782e201
      // let skullId = item.getNBT().getCompoundTag("tag").getCompoundTag("SkullOwner").getString("Id");
      let name = item.getName();

      if (name.endsWith("§d§lCAUGHT!") || (!name.startsWith("§6§lGolden Rabbit") && Settings.strayAlert === 2)) return;
      playSound(AMOGUS, 10_000);
    }
  }
})
  .setDelay(1)
  .unregister();

const strayClose = register("guiClosed", () => {
  strayDetect.unregister();
  strayClose.unregister();
}).unregister();

registerWhen(
  register("guiOpened", () => {
    Client.scheduleTask(2, () => {
      if (Player.getContainer().getName() !== "Chocolate Factory") return;
      strayClose.register();
      strayDetect.register();
    });
  }),
  () => Settings.strayAlert !== 0
);

/**
 * Egg waypoints.
 */
const EGGPOINTS = new Json("eggs.json", false, false).getData();
const eggPoints = new Waypoint([1, 1, 0]); // Yellow Eggs

/**
 * Update Skyblock Waypoints.
 *
 * @param {String} command - add, clear, list, help.
 * @param {String} name - Name of the NPC or Zone.
 */
export function updateEggs(command, page) {
  const world = location.getWorld();
  const base = EGGPOINTS[world];
  if (base === undefined) {
    ChatLib.chat(`${LOGO + RED}Error: No eggs found in ${world}.`);
    return;
  }

  switch (command) {
    case "all":
    case "show":
      // Show all waypoints
      eggPoints.clear();
      base.forEach((wp) => eggPoints.push([wp[0], ...wp.slice(2)]));
      ChatLib.chat(`${LOGO + GREEN}Showing all egg waypoints.`);
      break;
    case "unique":
      // Show all unique waypoints
      eggPoints.clear();
      base.forEach((wp) => {
        const x = parseInt(wp[2]);
        const z = parseInt(wp[4]);
        if (!data.eggs.found[world]?.hasOwnProperty(`${x + (x < 0)}.5,${z + (z < 0)}.5`))
          eggPoints.push([wp[0], ...wp.slice(2)]);
      });
      updateUniques = true;
      ChatLib.chat(`${LOGO + GREEN}Showing all missing unique eggs.`);
      break;
    case "clear":
      // Clear all waypoints
      eggPoints.clear();
      updateUniques = false;
      ChatLib.chat(`${LOGO + GREEN}Cleared egg waypoints.`);
      break;
    case "list":
      // List all waypoints
      const found = data.eggs.found[world];
      const unique = base.filter((wp) => {
        const x = parseInt(wp[2]);
        const z = parseInt(wp[4]);
        return !found.hasOwnProperty(`${x + (x < 0)}.5,${z + (z < 0)}.5`);
      });
      const dupe = base.filter((wp) => {
        const x = parseInt(wp[2]);
        const z = parseInt(wp[4]);
        return found.hasOwnProperty(`${x + (x < 0)}.5,${z + (z < 0)}.5`);
      });

      const formatted = unique
        .map((wp) => `${GOLD + wp[0]} ${RED}✘\n    ${YELLOW + wp.slice(2).join(", ")} ${GRAY}(${wp[1]})`)
        .concat(
          dupe.map((wp) => `${GOLD + wp[0]} ${GREEN}✔\n    ${YELLOW + wp.slice(2).join(", ")} ${GRAY}(${wp[1]})`)
        );
      printList(formatted, "eggs", page, 6, false);
      break;
    case "help":
    default:
      if (command !== "help") ChatLib.chat(`${LOGO + RED}Error: Invalid argument "${command}"!\n`);
      ChatLib.chat(
        `${LOGO + GOLD + BOLD}Waypoint Commands:
 ${DARK_GRAY}- ${GOLD}Base: ${YELLOW}/va [npc, zone] <command>

 ${DARK_GRAY}- ${GOLD}show: ${YELLOW}Show all waypoints.
 ${DARK_GRAY}- ${GOLD}unique: ${YELLOW}Show all missing unique eggs.
 ${DARK_GRAY}- ${GOLD}clear: ${YELLOW}Delete all waypoints.
 ${DARK_GRAY}- ${GOLD}list: ${YELLOW}List all valid keys.
 ${DARK_GRAY}- ${GOLD}help: ${YELLOW}Displays this help message.`
      );
      break;
  }
}
