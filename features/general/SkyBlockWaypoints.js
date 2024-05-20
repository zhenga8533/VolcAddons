import location from "../../utils/location";
import { AQUA, BOLD, DARK_GRAY, GOLD, GRAY, GREEN, ITALIC, LOGO, RED, WHITE, YELLOW } from "../../utils/constants";
import { Json } from "../../utils/json";
import { Waypoint } from "../../utils/WaypointUtil";


const NPCS = new Json("npcs.json", false, false).getData();
const npcWaypoints = new Waypoint([0.5, 0.5, 1]);
const LOCATIONS = new Json("locations.json", false, false).getData();
const locationWaypoints = new Waypoint([0.5, 0.5, 1]);

/**
 * Update Skyblock Waypoints.
 * 
 * @param {String} type - NPC or Zone.
 * @param {String} command - add, clear, list, help.
 * @param {String} name - Name of the NPC or Zone.
 */
export function updateSBW(type, command, name) {
    const world = location.getWorld();
    const base = type === "NPC" ? NPCS[world] : LOCATIONS[world];
    const waypoints = type === "NPC" ? npcWaypoints : locationWaypoints;
    if (base === undefined) {
        ChatLib.chat(`${LOGO + RED}Error: No ${type}s found in ${world}.`);
        return;
    }

    switch (command) {
        case "add":
            // Check if the name exists
            const locs = base[name];
            if (locs === undefined) {
                ChatLib.chat(`${LOGO + RED}Error: Could not find ${type} "${name}" in ${world}.`);
                return;
            }

            // Add all locations to waypoints
            if (type === "NPC")
                locs.forEach(loc => {
                    if (loc[1] === "") return;
                    const x = Math.floor(loc[1]) + 1;
                    const y = Math.floor(loc[2]);
                    const z = Math.floor(loc[3]) + 1;
                    waypoints.push([name, x, y, z]);
                });
            else waypoints.push([name, ...locs]);

            ChatLib.chat(`${LOGO + GREEN}Added "${name}" to ${type} waypoints.`);
            break;
        case "clear":
            // Clear all waypoints
            waypoints.clear();
            ChatLib.chat(`${LOGO + GREEN}Cleared ${type} waypoints.`);
            break;
        case "list":
            ChatLib.clearChat(5858);
            const message = new Message(`\n${LOGO + GOLD + BOLD + type}s in ${world}:`).setChatLineId(5858);

            Object.keys(base).forEach(key => {
                // Create hover text
                let hover = `${AQUA + key}:`;
                if (type === "NPC")
                    base[key].forEach(loc => {
                        const x = loc[1] === "" ? RED + "?" : WHITE + loc[1];
                        const y = loc[2] === "" ? "?" : loc[2];
                        const z = loc[3] === "" ? "?" : loc[3];
                        hover += `\n${DARK_GRAY} - ${YELLOW + loc[0]}: ${x}, ${y}, ${z}`;
                    });
                else hover += `\n${DARK_GRAY} - ${YELLOW}Origin: ${WHITE + base[key][0]}, ${base[key][1]}, ${base[key][2]}`;
                hover += `\n\n${YELLOW}Click to add ${AQUA + key + YELLOW} to waypoints.`;

                // Add text component
                message.addTextComponent(`\n${DARK_GRAY} - `);
                message.addTextComponent(new TextComponent(YELLOW + key)
                    .setClick("run_command", `/va ${type} add ${key}`)
                    .setHoverValue(hover));
            });

            // Print message
            message.addTextComponent(`\n${GRAY + ITALIC}Hover over names to view and add to waypoints.`);
            message.chat();
            break;
        case "help":
        default:
            if (command !== "help") ChatLib.chat(`${LOGO + RED}Error: Invalid argument "${command}"!\n`);
            ChatLib.chat(
`${LOGO + GOLD + BOLD}Waypoint Commands:
 ${DARK_GRAY}- ${GOLD}Base: ${YELLOW}/va [npc, zone] <command>

 ${DARK_GRAY}- ${GOLD}add <key>: ${YELLOW}Add waypoint using key.
 ${DARK_GRAY}- ${GOLD}clear <key>: ${YELLOW}Delete all waypoints.
 ${DARK_GRAY}- ${GOLD}list <key>: ${YELLOW}List all valid keys.
 ${DARK_GRAY}- ${GOLD}help: ${YELLOW}Displays this help message.`);
            break;
    }
}
