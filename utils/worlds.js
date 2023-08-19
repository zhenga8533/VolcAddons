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
 * This function searches for the current zone by inspecting the lines on the scoreboard.
 * It first attempts to find a line containing the symbol "⏣" and assigns it to the variable "zoneLine".
 * If the symbol "⏣" is not found, it then attempts to find a line containing the Cyrillic symbol "ф".
 * If neither symbol is found, it returns "None" to indicate that the zone is not identified.
 * Otherwise, it returns the name of the zone extracted from "zoneLine" after removing formatting codes.
 *
 * @returns {string} - The name of the current zone or "None" if the zone is not identified.
 */
export function findZone() {
    let zoneLine = Scoreboard.getLines().find((line) => line.getName().includes("⏣"));
    // Rift has a different symbol
    if (zoneLine === undefined) zoneLine = Scoreboard.getLines().find((line) => line.getName().includes("ф"));
    return zoneLine === undefined ? "None" : zoneLine.getName().removeFormatting();
}

/**
 * This function attempts to identify the current world the player is in by inspecting the tab list.
 * It includes measures to prevent infinite loops and delay-based retries if the world is not immediately identified.
 * The function first checks for the presence of the word "Area" in tab list names and assigns it to the "world" variable.
 * If "world" is not found, the function schedules a delayed retry after 1000 milliseconds (1 second).
 * If "world" is found, it extracts the formatted world name from it by removing formatting codes and extracting
 * the portion after the colon and space. For the "Kuudra" world, it also attempts to determine the tier based on the zone.
 * The function then proceeds to register/unregister features based on the current world and set player-related settings.
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
});
