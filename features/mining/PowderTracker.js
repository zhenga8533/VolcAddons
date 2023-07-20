import settings from "../../settings";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";

const WitherClass = Java.type('net.minecraft.entity.boss.EntityWither').class;
let doublePowder = false;

// Check for 2x
registerWhen(register("step", () => {
    withers = World.getAllEntitiesOfType(WitherClass);
    festivity = withers.find(wither => wither.getName().includes("2x"));
    if (festivity != undefined) doublePowder = true;
}).setFps(1), () => getWorld() == "Crystal Hollows" || getWorld() == "Dwarven Mines");

// Event start
registerWhen(register("chat", (festivity) => {
    if (festivity == "2X POWDER") doublePowder = true;
}).setCriteria("${festivity} STARTED!"), () => (getWorld() == "Crystal Hollows" || getWorld() == "Dwarven Mines") && settings.powderTracker);

// Event end
registerWhen(register("chat", (festivity) => {
    if (festivity == "2X POWDER") doublePowder = false;
}).setCriteria("${festivity} ENDED!"), () => (getWorld() == "Crystal Hollows" || getWorld() == "Dwarven Mines") && settings.powderTracker);
registerWhen(register("worldUnload", () => {
    doublePowder = false
}), () => (getWorld() == "Crystal Hollows" || getWorld() == "Dwarven Mines") && settings.powderTracker);
