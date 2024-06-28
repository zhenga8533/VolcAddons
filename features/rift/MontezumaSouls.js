import { AQUA, BLUE, BOLD, DARK_GRAY, GOLD, GRAY, GREEN, LOGO, RED, YELLOW } from "../../utils/Constants";
import { Json } from "../../utils/Json";
import location from "../../utils/Location";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import Waypoint from "../../utils/Waypoint";
import { getClosest } from "../../utils/functions/find";

/**
 * Variables used to represent soul waypoints.
 */
const soulWaypoints = new Waypoint([0, 0, 1]); // Blue Souls
const catSouls = new Json("catSouls.json", true);

/**
 * Removes closest Montezuma soul piece when player finds one.
 */
registerWhen(
  register("chat", () => {
    // Delete closest soul
    const souls = catSouls.getData();
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
    if (closest !== undefined) souls.splice(souls.indexOf(closest[0]), 1);
  }).setCriteria("You found a piece of Montezuma's soul!"),
  () => location.getWorld() === "The Rift"
);

/**
 * Fail safe Montzuma soul piece remove in case player clicks on an unregistered soul.
 */
registerWhen(
  register("chat", () => {
    // Delete duplicate soul
    const souls = catSouls.getData();
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
    if (closest[1] < 5) souls.splice(souls.indexOf(closest[0]), 1);
  }).setCriteria("You have already found this Montezuma soul piece!"),
  () => location.getWorld() === "The Rift"
);

/**
 * Updates enigma soul array closer than set threshold to player.
 */
registerWhen(
  register("step", () => {
    // Filters to closest souls
    soulWaypoints.clear();
    const soul = catSouls.getData()[0];
    if (soul === undefined) return;

    soulWaypoints.push([soul[0], parseFloat(soul[3]), parseFloat(soul[4]), parseFloat(soul[5])]);
  }).setFps(1),
  () => location.getWorld() === "The Rift" && Settings.catWaypoint
);

/**
 * Updates the fairy soul array.
 *
 * @param {String} command - The command to execute.
 * @param {Number} index - The index of the soul to remove.
 */
export function updateCat(command, index) {
  ChatLib.clearChat(5858);
  const souls = catSouls.getData();

  switch (command) {
    case "clear": // Clear all waypoints
      souls.length = 0;
      ChatLib.chat(`${LOGO + GREEN}Successfully cleared out all Montezuma Soul waypoints.`);
      break;
    case "delete": // Delete the specified soul
      if (souls[index] === undefined) {
        ChatLib.chat(`${LOGO + RED}Error: Invalid Montezuma Soul index "${index}"!`);
        return;
      }
      souls.splice(index, 1);
      ChatLib.command(`va cat list`, true);
      ChatLib.chat(`${LOGO + GREEN}Successfully removed Montezuma Soul.`);
      break;
    case "list": // List all missing fairy souls
      const message = new Message(`\n${LOGO + GOLD + BOLD}Montezuma Souls:`).setChatLineId(5858);
      souls.forEach((soul, i) => {
        // Get the soul data
        const name = soul[0];
        const zone = soul[1];
        const desc = soul[2];
        const x = soul[3];
        const y = soul[4];
        const z = soul[5];
        const hover = `${GOLD + name}: ${AQUA + zone} ${GRAY}(${x}, ${y}, ${z})

${DARK_GRAY}Obtainment:
 ${YELLOW + desc}

 ${YELLOW}Click to remove ${BLUE}Montezuma Soul${YELLOW}.`;

        // Add the text component
        message.addTextComponent(
          new TextComponent(`\n${DARK_GRAY}- ${AQUA}${zone}: ${YELLOW}(${x}, ${y}, ${z})`)
            .setHoverValue(hover)
            .setClick("run_command", `/va cat delete ${i}`)
        );
      });
      message.chat();
      break;
    case "shift": // Delete closest soul
      souls.shift();
      ChatLib.chat(`${LOGO + GREEN}Successfully removed closest Montezuma Soul.`);
      break;
    case "reset": // Reset the array
      catSouls.reset();
      ChatLib.chat(`${LOGO + GREEN}Successfully reset Montezuma Soul waypoints.`);
      break;
    case "help": // Display help message
    default:
      if (command !== "help") ChatLib.chat(`${LOGO + RED}Error: Invalid argument "${command}"!\n`);
      ChatLib.chat(
        `${LOGO + GOLD + BOLD}Fairy Soul Commands:
 ${DARK_GRAY}- ${GOLD}Base: ${YELLOW}/va fairy <command>

 ${DARK_GRAY}- ${GOLD}clear: ${YELLOW}Marks all Montezuma Souls as complete.
 ${DARK_GRAY}- ${GOLD}list: ${YELLOW}List all missing Montezuma Souls.
 ${DARK_GRAY}- ${GOLD}shift: ${YELLOW}Removes the next Montezuma Soul.
 ${DARK_GRAY}- ${GOLD}reset: ${YELLOW}Reset the Montezuma Soul array.
 ${DARK_GRAY}- ${GOLD}help: ${YELLOW}Displays this help message.`
      );
      break;
  }
}
