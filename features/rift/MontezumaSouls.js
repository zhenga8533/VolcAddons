import location from "../../utils/location";
import settings from "../../utils/settings";
import { getClosest } from "../../utils/functions/find";
import { registerWhen } from "../../utils/register";
import { data } from "../../utils/data";
import { Waypoint } from "../../utils/WaypointUtil";
import { Json } from "../../utils/json";


const soulWaypoints = new Waypoint([0.5, 0, 0.5], true);
const catSouls = new Json("catSouls.json", true);

/**
 * Removes closest Montezuma soul piece when player finds one.
 */
registerWhen(register("chat", () => {
    // Delete closest soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], data.catSouls);
    if (closest !== undefined)
        data.catSouls.splice(data.catSouls.indexOf(closest[0]), 1);
}).setCriteria("You found a piece of Montezuma's soul!"), () => location.getWorld() === "The Rift");

/**
 * Fail safe Montzuma soul piece remove in case player clicks on an unregistered soul.
 */
registerWhen(register("chat", () => {
    if (!data.catSouls.length) return;

    // Delete duplicate soul
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], data.catSouls);
    if (closest[1] < 5)
        data.catSouls.splice(data.catSouls.indexOf(closest[0]), 1);
}).setCriteria("You have already found this Montezuma soul piece!"), () => location.getWorld() === "The Rift");

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
        case "clear":  // Clear all waypoints
            souls.length = 0;
            ChatLib.chat(`${LOGO + GREEN}Successfully cleared out all Montezuma Soul waypoints.`);
            break;
        case "delete":  // Delete the specified soul
            if (souls[index] === undefined) {
                ChatLib.chat(`${LOGO + RED}Error: Invalid Montezuma Soul index "${index}"!`);
                return;
            }
            souls.splice(index, 1);
            ChatLib.command(`va cat list`, true);
            ChatLib.chat(`${LOGO + GREEN}Successfully removed Montezuma Soul.`);
            break;
        case "list":  // List all missing fairy souls
            const message = new Message(`\n${LOGO + GOLD + BOLD}Montezuma Souls:`).setChatLineId(5858);
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
        case "pop":  // Delete closest soul
            const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
            if (closest !== undefined) souls.splice(souls.indexOf(closest[0]), 1);
            ChatLib.chat(`${LOGO + GREEN}Successfully removed closest Fairy Soul.`);
            break;
        case "reset":  // Reset the array
            fairySouls.reset();
            ChatLib.chat(`${LOGO + GREEN}Successfully reset Fairy Soul waypoints.`);
            break;
        case "help":  // Display help message
        default:
            if (command !== "help") ChatLib.chat(`${LOGO + RED}Error: Invalid argument "${command}"!\n`);
            ChatLib.chat(
`${LOGO + GOLD + BOLD}Fairy Soul Commands:
 ${DARK_GRAY}- ${GOLD}Base: ${YELLOW}/va fairy <command>

 ${DARK_GRAY}- ${GOLD}clear: ${YELLOW}Marks all Fairy Souls as complete.
 ${DARK_GRAY}- ${GOLD}list: ${YELLOW}List all missing Fairy Souls.
 ${DARK_GRAY}- ${GOLD}pop: ${YELLOW}Removes the closest Fairy Soul.
 ${DARK_GRAY}- ${GOLD}reset: ${YELLOW}Reset the Fairy Soul array.
 ${DARK_GRAY}- ${GOLD}help: ${YELLOW}Displays this help message.`);
            break;
    }
}
