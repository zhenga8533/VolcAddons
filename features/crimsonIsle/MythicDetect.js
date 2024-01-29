import settings from "../../utils/settings";
import { BOLD, DARK_BLUE, DARK_RED, GOLEM_CLASS, GUARDIAN_CLASS, RED, WHITE } from "../../utils/constants";
import { announceMob } from "../../utils/functions/misc";
import { data, registerWhen } from "../../utils/variables";
import { Hitbox, renderEntities } from "../../utils/waypoints";
import { getWorld } from "../../utils/worlds";


/**
 * Announce to party/all chat whenever player spawns a mythic lava creature.
 */
registerWhen(register("chat", () => {
    announceMob(settings.mythicLavaAnnounce, "Lord Jawbus", Player.getX(), Player.getY(), Player.getZ());
}).setCriteria("You have angered a legendary creature... Lord Jawbus has arrived."),
() => getWorld() === "Crimson Isle" && settings.mythicLavaAnnounce !== 0);
registerWhen(register("chat", () => {
    announceMob(settings.mythicLavaAnnounce, "Thunder", Player.getX(), Player.getY(), Player.getZ());
}).setCriteria("You hear a massive rumble as Thunder emerges."),
() => getWorld() === "Crimson Isle" && settings.mythicLavaAnnounce !== 0);

/**
 * Detects if any mythic lava creatures are near the player.
 */
let jawbussy = [];
let thunders = [];
registerWhen(register("step", () => {
    jawbussy = World.getAllEntitiesOfType(GOLEM_CLASS);
    if (jawbussy.length > 0) {
        if (jawbussy.find(jawbus => jawbus.getEntity().func_110143_aJ() === 0) !== undefined)
            Client.showTitle(`${DARK_RED + BOLD}LORD JAWBUS ${RED}DEAD!`, "", 0, 50, 10);
        else Client.showTitle(`${DARK_RED + BOLD}LORD JAWBUS ${WHITE}DETECTED!`, "", 0, 25, 5);
        
        if (!data.moblist.includes("jawbus")) jawbussy = [];
    }
    
    thunders = World.getAllEntitiesOfType(GUARDIAN_CLASS).filter(guardian => guardian.getEntity().func_175461_cl());
    if (thunders.length > 0) {
        if (thunders.find(thunder => thunder.getEntity().func_110143_aJ() === 0) !== undefined)
            Client.showTitle(`${DARK_BLUE + BOLD}THUNDER ${RED}DEAD!`, "", 0, 50, 10);
        else Client.showTitle(`${DARK_BLUE + BOLD}THUNDER ${WHITE}DETECTED!`, "", 0, 25, 5);

        if (!data.moblist.includes("thunder")) thunders = [];
    }
}).setFps(2), () => getWorld() === "Crimson Isle" && settings.mythicLavaDetect);
new Hitbox(() => getWorld() === "Crimson Isle" && settings.mythicLavaDetect, (pt) => {
    renderEntities(jawbussy, 0.55, 0, 0, pt, "Jawbussy");
    renderEntities(thunders, 0, 0, 0.55, pt, "T1 Zeus");
});
register("worldUnload", () => {
    jawbussy = [];
    thunders = [];
});
