import settings from "../../settings";
import { announceMob } from "../../utils/functions";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";


/**
 * Slayer alert variables.
 */
let miniCD = false;
let bossCD = false;
let questStart = true;
export function getSlayerBoss() { return bossCD };

/**
 * Uses sound name, volume, and pitch, to detect when slayer miniboss spawns.
 *
 * @param {number[]} pos - Array of x, y, z positions.
 * @param {string} name - Name of sound.
 * @param {string} vol - Volume of sound.
 * @param {string} pitch - pitch of sound.
 * @param {string} category - Sound category.
 */
registerWhen(register("soundPlay", (pos, name, vol, pitch, category) => {
    if (miniCD || vol != 0.6000000238418579 || pitch != 1.2857142686843872) return;
    
    announceMob(settings.miniAlert, "Slayer Miniboss", Player.getX(), Player.getY(), Player.getZ());

    miniCD = true;
    delay(() => miniCD = false, 3000);
}).setCriteria("random.explode"), () => settings.miniAlert !== 0);

/**
 * Uses scoreboard to detect if a slayer boss is active.
 */
registerWhen(register("step", () => {
    if (bossCD === false) return;
    const bossLine = Scoreboard?.getLines().find((line) => line.getName().includes("Slay the boss!"));
    if (questStart === false || bossLine === undefined) return;
    
    bossCD = true;
    questStart = false;
    if (settings.bossAlert)
        announceMob(settings.bossAlert, "Slayer Boss", Player.getX(), Player.getY(), Player.getZ());
}).setFps(5), () => settings.bossAlert !== 1 || (getWorld() === "The Rift" && (settings.vampireAttack || settings.announceMania)));

/**
 * Uses chat to track slayer quest state.
 */
register("chat", () => {  delay(() => questStart = true, 500) }).setCriteria("  SLAYER QUEST STARTED!");
register("chat", () => { bossCD = false }).setCriteria("  SLAYER QUEST COMPLETE!");
register("chat", () => { bossCD = false }).setCriteria("  SLAYER QUEST FAILED!");
