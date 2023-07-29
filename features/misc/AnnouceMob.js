import settings from "../../settings";
import { AMOGUS, BOLD, DARK_PURPLE, GOLD, WHITE } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { getInParty } from "../../utils/party";
import { delay } from "../../utils/thread";
import { data, registerWhen } from "../../utils/variables";
import { findZone, getWorld } from "../../utils/worlds";
import { updateInqCounter } from "../hub/InquisitorCounter";


/**
 * Tracks chat for any powder gain messages.
 *
 * @param {boolean} toAll - /ac if true, /pc if false.
 * @param {string} mob - Name of the mob.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {number} z - Z coordinate.
 */
function annoucePosition(toAll, mob, x, y ,z) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    // AREA PLAYER IS IN
    let area = findZone();

    if (toAll) {
        const id = (Math.random() + 1).toString(36).substring(6);
        ChatLib.command(`ac x: ${x}, y: ${y}, z: ${z} | ${mob} Spawned at [${area} ]! @${id}`);
    } else if (getInParty())
        ChatLib.command(`pc x: ${x}, y: ${y}, z: ${z} | ${mob} Spawned at [${area} ]!`);
}


/**
 * Vanquisher detection variables.
 */
const EntityWither = Java.type('net.minecraft.entity.boss.EntityWither');
let entities = [];
let vanquishers = [];
export function getVanquishers() { return vanquishers };
let soundCD = true;

/**
 * Announce vanquisher spawn on chat message appears.
 */
registerWhen(register("chat", () => {
    annoucePosition(settings.vanqAlert == 1, "Vanquisher", Player.getX(), Player.getY(), Player.getZ());
}).setCriteria("A Vanquisher is spawning nearby!"), () => getWorld() == "Crimson Isle" && settings.vanqAlert);

/**
 * Alerts player when another VA user posts coords.
 */
registerWhen(register("chat", () => {
    if (!soundCD) return;

    AMOGUS.play();
    soundCD = false;
    delay(() => soundCD = true, 10000);
}).setCriteria("${player}: ${coords} | Vanquisher Spawned at [${location}]!"), () => getWorld() == "Crimson Isle" && settings.vanqSound);

/**
 * Tracks world for any vanquishers near player.
 */
const vanqExample = `${DARK_PURPLE}${BOLD}Vanquisher ${WHITE}Detected`;
const vanqOverlay = new Overlay("vanqDetect", ["Crimson Isle"], data.QL, "moveVanq", vanqExample);
registerWhen(register("tick", () => {
    vanquishers = [];
    entities = World.getAllEntitiesOfType(EntityWither.class);
    vanqs = entities.filter((entity) => entity.getEntity().func_110138_aP() == 1024);

    if (vanqs.length > 0) {
        vanqOverlay.message = vanqExample;
        if (data.moblist.includes("vanquisher")) {
            vanqs.forEach(vanq => { vanquishers.push(vanq) });
            if (soundCD && settings.vanqSound) {
                AMOGUS.play();
                soundCD = false;
                delay(() => soundCD = true, 10000);
            }
        }
    } else vanqOverlay.message = "";
}), () => getWorld() == "Crimson Isle" && settings.vanqDetect);


/**
 * Inquisitor alert variables.
 */
const EntityPlayerMP = Java.type("net.minecraft.client.entity.EntityOtherPlayerMP");
let inquisitor = undefined;

/**
 * Announce inquisitor spawn on chat message appears.
 */
registerWhen(register("chat", () => {
    entities = World.getAllEntitiesOfType(EntityPlayerMP.class);
    inquisitor = entities.find((entity) => entity.getName().equals("Minos Inquisitor"));

    updateInqCounter(inquisitor != undefined);
    if (inquisitor != undefined && settings.inqAlert)
        annoucePosition(settings.inqAlert == 1, "Minos Inquisitor", inquisitor.getX(), inquisitor.getY(), inquisitor.getZ());
}).setCriteria("${wow}! You dug out a Minos Champion!"), () => getWorld() == "Hub" && (settings.inqAlert || settings.inqCounter));

/**
 * Tracks world for any inquisitors near player.
 */
let inquisitors = [];
export function getInquisitors() { return inquisitors };
registerWhen(register("tick", () => {
    inquisitors = [];

    entities = World.getAllEntitiesOfType(EntityPlayerMP.class);
    inqs = entities.filter((entity) => entity.getName().equals("Minos Inquisitor"));

    if (inqs.length > 0) {
        Client.Companion.showTitle(`${GOLD}${BOLD}INQUISITOR ${WHITE}DETECTED!`, "", 0, 25, 5);
        if (data.moblist.includes("inquisitor"))
            inqs.forEach(inq => { inquisitors.push(inq) });
    }
}), () => getWorld() == "Hub" && settings.detectInq);


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
