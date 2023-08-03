import settings from "../../settings";
import { AMOGUS, BOLD, DARK_BLUE, DARK_RED, WHITE } from "../../utils/constants";
import { playSound } from "../../utils/functions";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


const EntityIronGolem = Java.type('net.minecraft.entity.monster.EntityIronGolem').class;
const EntityGuardian = Java.type('net.minecraft.entity.monster.EntityGuardian').class;
let lavaCreatures = [];
export function getLavaCreatures() { return lavaCreatures };

registerWhen(register("tick", () => {
    lavaCreatures = [];

    const ironGolems = World.getAllEntitiesOfType(EntityIronGolem);
    ironGolems.forEach(ironGolem => {
        Client.Companion.showTitle(`${DARK_RED}${BOLD}LORD JAWBUS ${WHITE}DETECTED!`, "", 0, 25, 5);
        playSound(AMOGUS, 10000);
        if (data.moblist.includes("jawbus"))
            lavaCreatures.push(ironGolem);
    });
    
    const guardians = World.getAllEntitiesOfType(EntityGuardian);
    guardians.forEach(guardian => {
        if (guardian.getEntity().func_175461_cl() === false) return;

        Client.Companion.showTitle(`${DARK_BLUE}${BOLD}THUNDER ${WHITE}DETECTED!`, "", 0, 25, 5);
        playSound(AMOGUS, 10000);
        if (data.moblist.includes("thunder"))
            lavaCreatures.push(guardian);
    });
}), () => getWorld() === "Crimson Isle" && settings.mythicLavaDetect);
