import { delay } from "./thread";
import { setRegisters } from "./variables";

// World
let world = undefined;
export function getWorld() { return world };
let tier = 0;
export function getTier() { return tier };
let noFind = 0;

export function findZone() {
    let zoneLine = Scoreboard.getLines().find((line) => line.getName().includes("⏣"));
    // Rift different symbol zzz
    if (zoneLine == undefined) zoneLine = Scoreboard.getLines().find((line) => line.getName().includes("ф"));
    return zoneLine == undefined ? "None" : zoneLine.getName().removeFormatting()
}
function findWorld() {
    // Infinite loop prevention
    if (noFind == 10) return;
    noFind++;

    // Get world from tab
    world = TabList.getNames().find(tab => tab.includes("Area"));
    if (world == undefined)
        delay(() => findWorld(), 1000);
    else {
        // Get world formatted
        world = world.removeFormatting();
        world = world.substring(world.indexOf(': ') + 2);

        // Get tier (for Kuudra and Dungeons)
        if (world == "Instanced") {
            world = "Kuudra";
            const zone = findZone();
            tier = zone.charAt(zone.length - 2);
        }

        // Register/unregister features for current world
        setRegisters();
    }
}
register("worldLoad", () => {
    noFind = 0;
    findWorld();
});
