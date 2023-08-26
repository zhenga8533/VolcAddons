import { setPlayer } from "../features/combat/HealthAlert";
import { delay } from "./thread";
import { setRegisters } from "./variables";


/**
 * Variables used to store world data.
 */
let world = undefined;
export function getWorld() { return world };
let tier = 0;
export function getTier() { return tier };
let noFind = 0;

/**
 * Searches for the current zone based on the scoreboard lines.
 * @returns {string} - The name of the current zone or "None" if not identified.
 */
export function findZone() {
    let zoneLine = Scoreboard.getLines().find((line) => line.getName().includes("⏣"));
    // Rift has a different symbol
    if (zoneLine === undefined) zoneLine = Scoreboard.getLines().find((line) => line.getName().includes("ф"));
    return zoneLine === undefined ? "None" : zoneLine.getName().removeFormatting();
}

/**
 * Identifies the current world the player is in based on the tab list.
 */
function findWorld() {
    // Infinite loop prevention
    if (noFind === 10) return;
    noFind++;

    // Get world from tab list
    world = TabList.getNames().find(tab => tab.includes("Area"));
    if (world === undefined) {
        // If the world is not found, try again after a delay
        delay(() => findWorld(), 1000);
    } else {
        // Get world formatted
        world = world.removeFormatting();
        world = world.substring(world.indexOf(': ') + 2);

        // Get tier (for Kuudra and Dungeons)
        if (world === "Kuudra") {
            delay(() => {
                const zone = findZone();
                tier = parseInt(zone.charAt(zone.length - 2));
            }, 1000);
        }

        // Register/unregister features for the current world
        setRegisters();
        setPlayer();
    }
}

/**
 * Set and reset world on world change.
 */
register("worldLoad", () => {
    noFind = 0; // Resetting the counter when the world loads
    findWorld(); // Finding the current world and its features
});
register("worldUnload", () => {
    world = "";
}).setPriority(Priority.LOWEST);
