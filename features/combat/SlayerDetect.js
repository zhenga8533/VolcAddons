import settings from "../../settings";
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

    annoucePosition(settings.miniAlert == 1, "Slayer Miniboss", Player.getX(), Player.getY(), Player.getZ());

    miniCD = true;
    delay(() => miniCD = false, 3000);
}).setCriteria("random.explode"), () => settings.miniAlert);

/**
 * Uses scoreboard to detect if a slayer boss is active.
 */
register("step", () => {
    if (bossCD) return;

    const bossLine = Scoreboard.getLines().find((line) => line.getName().includes("Slay the boss!"));
    if (questStart && bossLine != undefined) {
        bossCD = true;
        questStart = false;
        if (settings.bossAlert)
            annoucePosition(settings.bossAlert == 1, "Slayer Boss", Player.getX(), Player.getY(), Player.getZ());
    }
}).setFps(5);

/**
 * Uses chat to track slayer quest state.
 */
register("chat", () => {  delay(() => questStart = true, 500) }).setCriteria("  SLAYER QUEST STARTED!");
register("chat", () => { bossCD = false }).setCriteria("  SLAYER QUEST COMPLETE!");
register("chat", () => { bossCD = false }).setCriteria("  SLAYER QUEST FAILED!");
