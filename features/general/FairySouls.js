import { AQUA, BOLD, DARK_GRAY, GOLD, GREEN, LIGHT_PURPLE, LOGO, RED, YELLOW } from "../../utils/Constants";
import { Json } from "../../utils/Json";
import location from "../../utils/Location";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import Waypoint from "../../utils/Waypoint";
import { getClosest } from "../../utils/functions/find";

/**
 * Variables used to represent soul waypoints.
 */
const soulWaypoints = new Waypoint([1, 0.75, 0.8], 1); // Pink Fairies
const fairySouls = new Json("fairySouls.json", true);

/**
 * Removes closest fairy soul to player once one is unlocked.
 */
registerWhen(
  register("chat", () => {
    const souls = fairySouls.getData()[location.getWorld()];
    if (souls.length === 0) return;

    // Delete closest soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
    if (closest !== undefined && closest[1] < 10) souls.splice(souls.indexOf(closest[0]), 1);
  }).setCriteria("SOUL! You found a Fairy Soul!"),
  () => Settings.fairyWaypoint !== 0
);

/**
 * Fail safe fairy soul remove in case player clicks on an unregistered soul.
 */
registerWhen(
  register("chat", () => {
    const souls = fairySouls.getData()[location.getWorld()];
    if (souls.length === 0) return;

    // Delete duplicate soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
    if (closest !== undefined && closest[1] < 10) souls.splice(souls.indexOf(closest[0]), 1);
  }).setCriteria("You have already found that Fairy Soul!"),
  () => Settings.fairyWaypoint !== 0
);

/**
 * Updates fairy soul array closer than set threshold to player.
 */
registerWhen(
  register("step", () => {
    // Filters to closest souls
    soulWaypoints.clear();
    fairySouls.getData()[location.getWorld()]?.forEach((fairy) => {
      const x = parseFloat(fairy[1]) + 1;
      const y = parseFloat(fairy[2]);
      const z = parseFloat(fairy[3]) + 1;

      if (Math.hypot(Player.getX() - x, Player.getZ() - z) < Settings.fairyWaypoint) {
        soulWaypoints.push([x, y, z]);
      }
    });
  }).setFps(1),
  () => Settings.fairyWaypoint !== 0
);

/**
 * Updates the fairy soul array.
 *
 * @param {String} command - The command to execute.
 * @param {Number} index - The index of the soul to remove.
 */
export function updateFairy(command, index) {
  ChatLib.clearChat(5858);
  const data = fairySouls.getData();
  const souls = data[location.getWorld()] ?? [];

  switch (command) {
    case "clear": // Clear all waypoints
      Object.keys(data).forEach((world) => {
        data[world].length = 0;
      });
      ChatLib.chat(`${LOGO + GREEN}Successfully cleared out all Fairy Soul waypoints.`);
      break;
    case "delete": // Delete the specified soul
      if (souls[index] === undefined) {
        ChatLib.chat(`${LOGO + RED}Error: Invalid Fairy Soul index "${index}"!`);
        return;
      }
      souls.splice(index, 1);
      ChatLib.command(`va fairy list`, true);
      ChatLib.chat(`${LOGO + GREEN}Successfully removed Fairy Soul.`);
      break;
    case "list": // List all missing fairy souls
      const message = new Message(`\n${LOGO + GOLD + BOLD}Fairy Souls:`).setChatLineId(5858);
      souls.forEach((soul, i) => {
        // Get the soul data
        const zone = soul[0];
        const x = soul[1];
        const y = soul[2];
        const z = soul[3];

        // Add the text component
        message.addTextComponent(
          new TextComponent(`\n${DARK_GRAY}- ${AQUA}${zone}: ${YELLOW}(${x}, ${y}, ${z})`)
            .setHoverValue(`${YELLOW}Click to remove ${LIGHT_PURPLE}Fairy Soul${YELLOW}.`)
            .setClick("run_command", `/va fairy delete ${i}`)
        );
      });
      message.chat();
      break;
    case "pop": // Delete closest soul
      const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
      if (closest !== undefined) souls.splice(souls.indexOf(closest[0]), 1);
      ChatLib.chat(`${LOGO + GREEN}Successfully removed closest Fairy Soul.`);
      break;
    case "reset": // Reset the array
      fairySouls.reset();
      ChatLib.chat(`${LOGO + GREEN}Successfully reset Fairy Soul waypoints.`);
      break;
    case "help": // Display help message
    default:
      if (command !== "help") ChatLib.chat(`${LOGO + RED}Error: Invalid argument "${command}"!\n`);
      ChatLib.chat(
        `${LOGO + GOLD + BOLD}Fairy Soul Commands:
 ${DARK_GRAY}- ${GOLD}Base: ${YELLOW}/va fairy <command>

 ${DARK_GRAY}- ${GOLD}clear: ${YELLOW}Marks all Fairy Souls as complete.
 ${DARK_GRAY}- ${GOLD}list: ${YELLOW}List all missing Fairy Souls.
 ${DARK_GRAY}- ${GOLD}pop: ${YELLOW}Removes the closest Fairy Soul.
 ${DARK_GRAY}- ${GOLD}reset: ${YELLOW}Reset the Fairy Soul array.
 ${DARK_GRAY}- ${GOLD}help: ${YELLOW}Displays this help message.`
      );
      break;
  }
}
