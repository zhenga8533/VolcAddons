import { AMOGUS, BOLD, DARK_BLUE, DARK_RED, WHITE } from "../../utils/constants";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


const EntityIronGolem = Java.type('net.minecraft.entity.monster.EntityIronGolem').class;
const EntityGuardian = Java.type('net.minecraft.entity.monster.EntityGuardian').class;
const EntitySquid = Java.type('net.minecraft.entity.passive.EntitySquid').class;
let lavaCreatures = [];
export function getLavaCreatures() { return lavaCreatures };

registerWhen(register("tick", () => {
    lavaCreatures = [];

    const ironGolems = World.getAllEntitiesOfType(EntityIronGolem);
    if (ironGolems.length > 0) {
        Client.Companion.showTitle(`${DARK_BLUE}${BOLD}LORD JAWBUS ${WHITE}DETECTED!`, "", 0, 25, 5);
        AMOGUS.play();
        if (data.moblist.includes("jawbus"))
            ironGolems.forEach(ironGolem => { lavaCreatures.push(ironGolem) });
    }
    
    const guardians = World.getAllEntitiesOfType(EntityGuardian);
    if (guardians.length > 0) {
        Client.Companion.showTitle(`${DARK_BLUE}${BOLD}THUNDER ${WHITE}DETECTED!`, "", 0, 25, 5);
        AMOGUS.play();
        if (data.moblist.includes("thunder"))
            guardians.forEach(guardian => { lavaCreatures.push(guardian) });
    }

    const squids = World.getAllEntitiesOfType(EntitySquid);
    if (squids.length > 0) {
        Client.Companion.showTitle(`${DARK_RED}${BOLD}PLHLEGBLAST ${WHITE}DETECTED!`, "", 0, 25, 5);
        AMOGUS.play();
        if (data.moblist.includes("plhlegblast"))
            squids.forEach(squid => { lavaCreatures.push(squid) });
    }
}), () => getWorld() === "Crimson Isle");
