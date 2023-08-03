import settings from "../../settings";
import { AMOGUS, BOLD, DARK_BLUE, DARK_RED, WHITE } from "../../utils/constants";
import { announceMob, playSound } from "../../utils/functions";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Variables used to track world for mythic lava creatures.
 */
const EntityIronGolem = Java.type('net.minecraft.entity.monster.EntityIronGolem').class;
const EntityGuardian = Java.type('net.minecraft.entity.monster.EntityGuardian').class;
let lavaCreatures = [];
export function getLavaCreatures() { return lavaCreatures };

/**
 * Announce to party/all chat whenever player spawns a mythic lava creature.
 */
registerWhen(register("chat", () => {
    announceMob(settings.mythicLavaAnnounce == 1, "Lord Jawbus", Player.getX(), Player.getY(), Player.getZ());
}).setCriteria("You have angered a legendary creature... Lord Jawbus has arrived"),
() => getWorld() === "Crimson Isle" && settings.mythicLavaAnnounce);
registerWhen(register("chat", () => {
    announceMob(settings.mythicLavaAnnounce == 1, "Thunder", Player.getX(), Player.getY(), Player.getZ());
}).setCriteria("You hear a massive rumble as Thunder emerges."),
() => getWorld() === "Crimson Isle" && settings.mythicLavaAnnounce);


/**
 * Detects if any mythic lava creatures are near the player.
 */
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
