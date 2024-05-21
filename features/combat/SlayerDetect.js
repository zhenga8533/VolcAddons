import location from "../../utils/Location";
import settings from "../../utils/Settings";
import { BLAZE_CLASS, BOLD, DARK_GREEN, ENDERMAN_CLASS, GREEN, RED, SMA, SPIDER_CLASS, WHITE, WOLF_CLASS, ZOMBIE_CLASS } from "../../utils/Constants";
import { romanToNum } from "../../utils/functions/format";
import { announceMob } from "../../utils/functions/misc";
import { registerWhen } from "../../utils/RegisterTils";
import { delay } from "../../utils/ThreadTils";
import Waypoint from "../../utils/Waypoint";


/**
 * Slayer alert variables.
 */
let miniCD = false;
let bossCD = false;
let slainCD = false;
let questStart = true;
export function getSlayerBoss() { return bossCD };

/**
 * Uses sound name, volume, and pitch, to detect when slayer miniboss spawns.
 */
registerWhen(register("soundPlay", (_, __, vol, pitch) => {
    if (miniCD || vol != 0.6000000238418579 || pitch != 1.2857142686843872) return;
    
    if (settings.miniAlert === 3) Client.showTitle(`${GREEN + BOLD}SLAYER MINIBOSS SPAWNED!`, "", 5, 25, 5);
    else announceMob(settings.miniAlert, "Miniboss Slayer", Player.getX(), Player.getY(), Player.getZ());

    miniCD = true;
    delay(() => miniCD = false, 3000);
}).setCriteria("random.explode"), () => settings.miniAlert !== 0);

/**
 * Uses scoreboard to detect if a slayer boss is active.
 */
registerWhen(register("tick", () => {
    if (bossCD) {
        // Announce if boss is dead
        if (!slainCD && Scoreboard?.getLines()?.find(line => line.getName().startsWith("§aBoss slain!")) !== undefined) {
            slainCD = true;
            if (settings.bossAlert === 3) Client.showTitle(`${DARK_GREEN + BOLD}SLAYER BOSS SLAIN!`, "", 5, 25, 5);
            else if (settings.bossAlert === 2) ChatLib.command("pc Slayer Boss Slain!");
            else if (settings.bossAlert === 1) {
                const id = `@${(Math.random() + 1).toString(36).substring(6)} ${(Math.random() + 1).toString(36).substring(9)}`;
                ChatLib.command("ac Slayer Boss Slain! " + id);
            }
        }
        return;
    }

    // Check for slain boss line to reset tracker
    if (!questStart || Scoreboard?.getLines()?.find(line => line.getName().startsWith("§eSlay the boss!")) === undefined) return;
    
    bossCD = true;
    slainCD = false;
    questStart = false;
    if (settings.bossAlert === 3) Client.showTitle(`${RED + BOLD}SLAYER BOSS SPAWNED!`, "", 5, 25, 5);
    else if (settings.bossAlert !== 0) announceMob(settings.bossAlert, "Boss Slayer", Player.getX(), Player.getY(), Player.getZ());
}), () => settings.bossAlert !== 0 || settings.slayerSpawn !== 0 ||
(location.getWorld() === "The Rift" && (settings.vampireAttack || settings.announceMania)));

/**
 * Close to spawn alert
 */
let warned = false;
registerWhen(register("step", () => {
    if (warned) return;

    if (settings.slayerSpawn === 100) {
        if (Scoreboard?.getLines()?.find(line => line.getName().includes("Slay the boss!")) !== undefined) {
            Client.showTitle(`${RED + BOLD}SLAYER BOSS SPAWNED!`, "", 5, 25, 5);
            warned = true;
        }
        return;
    }

    const bossLine = Scoreboard?.getLines()?.find(line => line.getName().endsWith("lls"));
    if (bossLine === undefined) return;
    const [_, c, t] = bossLine.getName().removeFormatting().match(/(\d+)\/(\d+)/);
    const percent = Math.round(c/t * 100);

    if (percent > settings.slayerSpawn) {
        Client.showTitle(`${RED + BOLD}SLAYER BOSS SPAWNING SOON (${WHITE + percent}%${RED})`, "", 5, 25, 5);
        warned = true;
    }
}).setFps(2), () => settings.slayerSpawn !== 0);

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
 * Boss and miniboss highlighting.
 * Varibles for different slayer mob classes.
 */
const MOB_CLASSES = {
    "Revenant": ZOMBIE_CLASS,
    "Tarantula": SPIDER_CLASS,
    "Sven": WOLF_CLASS,
    "Voidgloom": ENDERMAN_CLASS,
    "Inferno": BLAZE_CLASS
};
const BOSS_HPS = {
    "Revenant": [500, 20_000, 400_000, 1_500_000, 10_000_000],
    "Tarantula": [750, 30_000, 900_000, 2_400_000],
    "Sven": [2_000, 40_000, 750_000, 2_000_000],
    "Voidgloom": [300_000, 12_000_000, 50_000_000, 210_000_000],
    "Inferno": [2_500_000, 10_000_000, 75_000_000, 150_000_000]
}
const MINI_HPS = {
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
const bossWaypoints = new Waypoint([1, 1, 1], 2, true, true, false);
const miniWaypoints = new Waypoint([1, 1, 1], 2, true, true, false);

/**
 * Track world for mobs that match miniboss healths depending on slayer quest.
 */
registerWhen(register("step", () => {
    bossWaypoints.clear();
    miniWaypoints.clear();
    const index = Scoreboard.getLines().findIndex(line => line.getName().startsWith("Slayer Quest")) - 1;
    if (index === -2) return;

    // Get slayer data
    const quest = Scoreboard.getLineByIndex(index).getName().removeFormatting().split(' ');
    const tier = romanToNum(quest[quest.length - 1]);
    const type = quest[0];
    const mobClass = MOB_CLASSES[type];
    if (mobClass === undefined) return;

    // Get mob healths
    const bossHP = BOSS_HPS[type]?.[tier - 1];
    const miniSet = MINI_HPS[type]?.[tier - 3];

    // Set colors
    bossWaypoints.setColor(SLAYER_COLORS[type]);
    miniWaypoints.setColor(SLAYER_COLORS[type]);

    // Check mobs
    World.getAllEntitiesOfType(mobClass).forEach(mob => {
        const hp = mob.getEntity().func_110148_a(SMA.field_111267_a).func_111125_b();
        if (bossHP == hp) bossWaypoints.push([RED + "Boss", mob]);
        else if (miniSet.has(hp)) miniWaypoints.push([RED + "Mini", mob]);
    });
}).setFps(2), () => settings.bossHighlight || settings.miniHighlight);
