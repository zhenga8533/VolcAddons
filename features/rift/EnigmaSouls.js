import { AQUA, BOLD, DARK_GRAY, GOLD, GRAY, GREEN, LOGO, RED, YELLOW } from "../../utils/Constants";
import { Json } from "../../utils/Json";
import location from "../../utils/Location";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import Waypoint from "../../utils/Waypoint";
import { getClosest } from "../../utils/functions/find";

/**
 * Variables used to represent soul waypoints.
 */
const soulWaypoints = new Waypoint([0.5, 0, 0.5], 1); // Purple Souls
const enigmaSouls = new Json("enigmaSouls.json", true);

/**
 * Removes closest enigma soul to player once one is unlocked.
 */
registerWhen(
  register("chat", () => {
    const souls = enigmaSouls.getData();
    if (souls.length === 0) return;

    // Delete closest soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
    if (closest !== undefined && closest[1] < 10) souls.splice(souls.indexOf(closest[0]), 1);
  }).setCriteria("SOUL! You unlocked an Enigma Soul!"),
  () => location.getWorld() === "The Rift"
);

/**
 * Fail safe enigma soul remove in case player clicks on an unregistered soul.
 */
registerWhen(
  register("chat", () => {
    const souls = enigmaSouls.getData();
    if (souls.length === 0) return;

    // Delete duplicate soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
    if (closest !== undefined && closest[1] < 10) souls.splice(souls.indexOf(closest[0]), 1);
  }).setCriteria("You have already found that Enigma Soul!"),
  () => location.getWorld() === "The Rift"
);

/**
 * Updates enigma soul array closer than set threshold to player.
 */
registerWhen(
  register("step", () => {
    // Filters to closest souls
    soulWaypoints.clear();
    enigmaSouls.getData().forEach((enigma) => {
      const x = parseFloat(enigma[3]) + 1;
      const y = parseFloat(enigma[4]);
      const z = parseFloat(enigma[5]) + 1;

      if (Math.hypot(Player.getX() - x, Player.getZ() - z) < Settings.enigmaWaypoint) {
        soulWaypoints.push([x, y, z]);
      }
    });
  }).setFps(1),
  () => location.getWorld() === "The Rift" && Settings.enigmaWaypoint !== 0
);

/**
 * Updates the enigma soul array.
 *
 * @param {String} command - The command to execute.
 * @param {String} name - The name of the enigma soul.
 */
export function updateEnigma(command, name) {
  ChatLib.clearChat(5858);

  switch (command) {
    case "clear": // Clear all waypoints
      enigmaSouls.getData().length = 0;
      ChatLib.chat(`${LOGO + GREEN}Successfully cleared out all Enigma Soul waypoints.`);
      break;
    case "delete": // Check if the name exists
      const souls = enigmaSouls.getData();
      const soul = souls.find((soul) => soul[0] === name);
      if (soul === undefined) {
        ChatLib.chat(`${LOGO + RED}Error: Could not find Enigma Soul "${name}".`);
        return;
      }

      // Delete the soul
      souls.splice(souls.indexOf(soul), 1);
      ChatLib.command("va enigma list", true);
      ChatLib.chat(`${LOGO + GREEN}Successfully removed Enigma Soul "${name}".`);
      break;
    case "list": // List all souls
      const message = new Message(`\n${LOGO + GOLD + BOLD}Enigma Souls:`).setChatLineId(5858);
      enigmaSouls.getData().forEach((soul) => {
        // Get the soul data
        const name = soul[0];
        const zone = soul[1];
        const x = soul[3];
        const y = soul[4];
        const z = soul[5];

        // Split the description into rows
        const words = soul[2].split(" ");
        const rows = [];
        let currentRow = "";
        words.forEach((word) => {
          if ((currentRow + word).length <= 50) {
            currentRow += " " + word;
          } else {
            rows.push(currentRow);
            currentRow = word;
          }
        });
        if (currentRow !== "") rows.push(currentRow);

        // Create the hover text
        const desc = rows.join("\n " + YELLOW);
        const hover = `${GOLD + name}: ${AQUA + zone} ${GRAY}(${x}, ${y}, ${z})

${DARK_GRAY}Obtainment:
${YELLOW + desc}

${YELLOW}Click to remove ${AQUA + name + YELLOW} from the list.`;

        // Add the text component
        message.addTextComponent(
          new TextComponent(`\n${DARK_GRAY}- ${AQUA}${name}: ${YELLOW + zone} ${GRAY}(${x}, ${y}, ${z})`)
            .setHoverValue(hover)
            .setClick("run_command", `/va enigma delete ${name}`)
        );
      });
      message.chat();
      break;
    case "pop": // Delete closest soul
      const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], enigmaSouls.getData());
      if (closest !== undefined) enigmaSouls.getData().splice(enigmaSouls.getData().indexOf(closest[0]), 1);
      ChatLib.chat(`${LOGO + GREEN}Successfully removed closest Enigma Soul.`);
      break;
    case "reset": // Reset the array
      enigmaSouls.reset();
      ChatLib.chat(`${LOGO + GREEN}Successfully reset Enigma Soul waypoints.`);
      break;
    case "help": // Display help message
    default:
      if (command !== "help") ChatLib.chat(`${LOGO + RED}Error: Invalid argument "${command}"!\n`);
      ChatLib.chat(
        `${LOGO + GOLD + BOLD}Enigma Commands:
 ${DARK_GRAY}- ${GOLD}Base: ${YELLOW}/va enigma <command>

 ${DARK_GRAY}- ${GOLD}clear: ${YELLOW}Marks all Enigma Souls as complete.
 ${DARK_GRAY}- ${GOLD}delete <name>: ${YELLOW}Removes a specific Enigma Soul.
 ${DARK_GRAY}- ${GOLD}list: ${YELLOW}List all missing Enigma Souls.
 ${DARK_GRAY}- ${GOLD}pop: ${YELLOW}Removes the closest Enigma Soul.
 ${DARK_GRAY}- ${GOLD}reset: ${YELLOW}Reset the Enigma Soul array.
 ${DARK_GRAY}- ${GOLD}help: ${YELLOW}Displays this help message.`
      );
      break;
  }
}
