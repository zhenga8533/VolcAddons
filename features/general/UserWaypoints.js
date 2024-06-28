import { GRAY, GREEN, LOGO, RED, WHITE } from "../../utils/Constants";
import { data } from "../../utils/Data";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { delay } from "../../utils/ThreadTils";
import Waypoint from "../../utils/Waypoint";
import { getPlayerName } from "../../utils/functions/player";

/**
 * Variables used to represent user inputted waypoints.
 */
const chatWaypoints = new Waypoint([0, 1, 1]); // Cyan Chat
const userWaypoints = new Waypoint([0, 1, 0]); // Green User

/**
 * Detects any patcher formatted coords sent in chat.
 */
registerWhen(
  register("chat", (player, _, x, y, z) => {
    // Check blacklist
    if (data.blacklist.includes(getPlayerName(player).toLowerCase())) return;

    // Gets colors and titles in name
    const bracketIndex = player.indexOf("[") - 2;
    if (bracketIndex >= 0) player = player.replaceAll("&", "§").substring(bracketIndex, player.length);
    else player = player.replaceAll("&", "§");

    // Remove anything after z coords
    const spaceIndex = z.indexOf(" ");
    let time = 999;
    if (spaceIndex !== -1) {
      if (z.includes("|")) {
        player = RED + z.split(" ")[2];
        time /= 3;
      }
      z = z.substring(0, spaceIndex);
    }

    chatWaypoints.push([player, x, y, z]);

    // Delete waypoint after 'X' seconds
    delay(() => {
      const waypoints = chatWaypoints.getWaypoints();
      if (waypoints.length) waypoints.shift();
    }, Settings.drawWaypoint * time);
  }).setCriteria("${player}:${spacing}x: ${x}, y: ${y}, z: ${z}&r"),
  () => Settings.drawWaypoint !== 0
);

/**
 * Allows user to create waypoints via command.
 *
 * @param {String[]} args - Array of user input needed for waypoint.
 */
export function createWaypoint(args) {
  const name = args[1];
  const x = isNaN(args[2]) ? Math.round(Player.getX()) : parseFloat(args[2]);
  const y = isNaN(args[3]) ? Math.round(Player.getY()) : parseFloat(args[3]);
  const z = isNaN(args[4]) ? Math.round(Player.getZ()) : parseFloat(args[4]);

  if (name === "clear") {
    chatWaypoints.clear();
    userWaypoints.clear();
    NPCs = [];
    zones = [];
    ChatLib.chat(`${LOGO + GREEN}Successfully cleared waypoints!`);
  } else if (args[2] && args[3] && args[4]) {
    userWaypoints.push([name, x, y, z]);
    ChatLib.chat(`${GREEN}Successfully added waypoint [${name}] at [x: ${x}, y: ${y}, z: ${z}]!`);
  } else {
    ChatLib.chat(`\n${LOGO + RED}Error: Invalid argument "${name}"!`);
    ChatLib.chat(
      `${LOGO + RED}Please input as: ${WHITE}/va waypoint ${GRAY}<${WHITE}[name] [x] [y] [z], clear${GRAY}>`
    );
  }
}
