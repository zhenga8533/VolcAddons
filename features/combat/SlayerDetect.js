import settings from "../../utils/settings";
import { announceMob } from "../../utils/functions";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { BOLD, GREEN, RED, WHITE } from "../../utils/constants";


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
    
    if (settings.miniAlert === 3) Client.Companion.showTitle(`${GREEN}${BOLD}SLAYER MINIBOSS SPAWNED!`, "", 10, 50, 10);
    else announceMob(settings.miniAlert, "Slayer Miniboss", Player.getX(), Player.getY(), Player.getZ());

    miniCD = true;
    delay(() => miniCD = false, 3000);
}).setCriteria("random.explode"), () => settings.miniAlert !== 0);

/**
 * Uses scoreboard to detect if a slayer boss is active.
 */
registerWhen(register("step", () => {
    if (bossCD === true) return;
    const bossLine = Scoreboard?.getLines()?.find(line => line.getName().includes("Slay the boss!"));
    if (questStart === false || bossLine === undefined) return;
    
    bossCD = true;
    questStart = false;
    if (settings.bossAlert === 3) Client.Companion.showTitle(`${RED}${BOLD}SLAYER BOSS SPAWNED!`, "", 10, 50, 10);
    else if (settings.bossAlert !== 0) announceMob(settings.bossAlert, "Slayer Boss", Player.getX(), Player.getY(), Player.getZ());
}).setFps(5), () => settings.bossAlert !== 0 || settings.slayerSpawn !== 0 ||
(getWorld() === "The Rift" && (settings.vampireAttack || settings.announceMania)));

/**
 * Close to spawn alert
 */
let warned = false;
registerWhen(register("step", () => {
    if (warned === true) return;

    if (settings.slayerSpawn === 100) {
        if (Scoreboard?.getLines()?.find(line => line.getName().includes("Slay the boss!")) !== undefined) {
            Client.Companion.showTitle(`${RED}${BOLD}SLAYER BOSS SPAWNED!`, "", 10, 50, 10);
            warned = true;
        }
        return;
    }

    const bossLine = Scoreboard?.getLines()?.find(line => line.getName().endsWith("lls"));
    if (bossLine === undefined) return;
    const [_, c, t] = bossLine.getName().removeFormatting().match(/(\d+)\/(\d+)/);
    const percent = Math.round(c/t * 100);

    if (percent > settings.slayerSpawn) {
        Client.Companion.showTitle(`${RED}${BOLD}SLAYER BOSS SPAWNING SOON (${WHITE}${percent}%${RED})`, "", 10, 50, 10);
        warned = true;
    }
}).setFps(1), () => settings.slayerSpawn !== 0);

/**
 * Uses chat to track slayer quest state.
 */
register("chat", () => { delay(() => questStart = true, 500) }).setCriteria("  SLAYER QUEST STARTED!");
register("chat", () => {
    bossCD = false;
    warned = false;
}).setCriteria("  SLAYER QUEST COMPLETE!");
register("chat", () => {
    bossCD = false;
    warned = false;
}).setCriteria("  SLAYER QUEST FAILED!");
