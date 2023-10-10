import settings from "../../utils/settings";
import { announceMob, romanToNum } from "../../utils/functions";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { BOLD, GREEN, RED, WHITE } from "../../utils/constants";
import { Hitbox, renderEntities } from "../../utils/waypoints";


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
    
    if (settings.miniAlert === 3) Client.Companion.showTitle(`${GREEN + BOLD}SLAYER MINIBOSS SPAWNED!`, "", 10, 50, 10);
    else announceMob(settings.miniAlert, "Slayer Miniboss", Player.getX(), Player.getY(), Player.getZ());

    miniCD = true;
    delay(() => miniCD = false, 3000);
}).setCriteria("random.explode"), () => settings.miniAlert !== 0);

/**
 * Uses scoreboard to detect if a slayer boss is active.
 */
registerWhen(register("step", () => {
    if (bossCD) return;
    const bossLine = Scoreboard?.getLines()?.find(line => line.getName().includes("Slay the boss!"));
    if (!questStart || bossLine === undefined) return;
    
    bossCD = true;
    questStart = false;
    if (settings.bossAlert === 3) Client.Companion.showTitle(`${RED + BOLD}SLAYER BOSS SPAWNED!`, "", 10, 50, 10);
    else if (settings.bossAlert !== 0) announceMob(settings.bossAlert, "Slayer Boss", Player.getX(), Player.getY(), Player.getZ());
}).setFps(5), () => settings.bossAlert !== 0 || settings.slayerSpawn !== 0 ||
(getWorld() === "The Rift" && (settings.vampireAttack || settings.announceMania)));

/**
 * Close to spawn alert
 */
let warned = false;
registerWhen(register("step", () => {
    if (warned) return;

    if (settings.slayerSpawn === 100) {
        if (Scoreboard?.getLines()?.find(line => line.getName().includes("Slay the boss!")) !== undefined) {
            Client.Companion.showTitle(`${RED + BOLD}SLAYER BOSS SPAWNED!`, "", 10, 50, 10);
            warned = true;
        }
        return;
    }

    const bossLine = Scoreboard?.getLines()?.find(line => line.getName().endsWith("lls"));
    if (bossLine === undefined) return;
    const [_, c, t] = bossLine.getName().removeFormatting().match(/(\d+)\/(\d+)/);
    const percent = Math.round(c/t * 100);

    if (percent > settings.slayerSpawn) {
        Client.Companion.showTitle(`${RED + BOLD}SLAYER BOSS SPAWNING SOON (${WHITE + percent}%${RED})`, "", 10, 50, 10);
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


/**
 * Miniboss highlighting.
 * Varibles for different slayer mob classes.
 */
let SMA = Java.type('net.minecraft.entity.SharedMonsterAttributes');
const MOB_CLASSES = {
    "Revenant": Java.type("net.minecraft.entity.monster.EntityZombie").class,
    "Tarantula": Java.type("net.minecraft.entity.monster.EntitySpider").class,
    "Sven": Java.type("net.minecraft.entity.passive.EntityWolf").class,
    "Voidgloom": Java.type("net.minecraft.entity.monster.EntityEnderman").class,
    "Inferno": Java.type("net.minecraft.entity.monster.EntityBlaze").class
};
const MOB_HPS = {
    "Revenant": [new Set([24_000]), new Set([90_000, 360_000]), new Set([600_000, 2_400_000])],
    "Tarantula": [new Set([54_000]), new Set([144_000, 576_000])],
    "Sven": [new Set([45_000]), new Set([120_000, 480_000])],
    "Voidgloom": [new Set([12_000_000]), new Set([25_000_000, 75_000_000])],
    "Inferno": [new Set([12_000_000]), new Set([25_000_000, 75_000_000])]
};
const SLAYER_COLORS = {
    "Revenant": [0, 0.08, 0.05],
    "Tarantula": [0.55, 0, 0],
    "Sven": [255, 255, 255],
    "Voidgloom": [0.58, 0, 0.83],
    "Inferno": [0.55, 0, 0]
}
let minibosses = [];
let rgb = [];

/**
 * Track world for mobs that match miniboss healths depending on slayer quest.
 */
registerWhen(register("step", () => {
    minibosses = [];
    const index = Scoreboard.getLines().findIndex(line => line.getName().startsWith("Slayer Quest")) - 1;
    if (index === -2) return;

    // Get slayer data
    const quest = Scoreboard.getLineByIndex(index).getName().removeFormatting().split(' ');
    const tier = romanToNum(quest[quest.length - 1]);
    const type = quest[0];
    const mobClass = MOB_CLASSES[type];
    const hpSet = MOB_HPS[type]?.[tier - 3];
    rgb = SLAYER_COLORS[type];
    if (mobClass === undefined || hpSet === undefined) return;

    // Check mobs
    minibosses = World.getAllEntitiesOfType(mobClass).filter(mob => hpSet.has(mob.getEntity().func_110148_a(SMA.field_111267_a).func_111125_b()));
}).setFps(2), () => settings.miniHighlight);

new Hitbox(() => settings.miniHighlight, (pt) => {
    renderEntities(minibosses, rgb[0], rgb[1], rgb[2], pt);
});
