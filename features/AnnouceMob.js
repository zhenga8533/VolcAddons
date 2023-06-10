import { AMOGUS, BOLD, DARK_PURPLE, GOLD, WHITE } from "../utils/constants";
import settings from "../settings"
import { data, getInParty, getWorld } from "../utils/variables"

// GENERAL FUNCTIONS
function annoucePosition(toAll, mob, x, y ,z) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    // AREA PLAYER IS IN
    let area = Scoreboard.getLines().find((line) => line.getName().includes("⏣"));
    if (area != undefined)
        area = area.getName().removeFormatting();

    if (toAll) {
        const id = (Math.random() + 1).toString(36).substring(6);
        ChatLib.command(`ac x: ${x}, y: ${y}, z: ${z} | ${mob} Spawned at [${area} ]! @${id}`);
    } else if (getInParty())
        ChatLib.command(`pc x: ${x}, y: ${y}, z: ${z} | ${mob} Spawned at [${area} ]!`);
}

// --- Vanquisher Alert ---
const EntityWither = Java.type('net.minecraft.entity.boss.EntityWither');
let entities = [];
let vanquishers = [];
let soundCD = true;

register("chat", () => {
    if (!settings.vanqAlert || settings.vanqParty.length > 0) return;

    annoucePosition(settings.vanqAlert == 1, "Vanquisher", Player.getX(), Player.getY(), Player.getZ());
}).setCriteria("A Vanquisher is spawning nearby!");

// Detect others with sound
register("chat", () => {
    if (soundCD && settings.vanqSound) {
        soundCD = false;
        AMOGUS.play();
        setTimeout(() => { soundCD = true }, 10000);
    }
}).setCriteria("${player}: ${coords} | Vanquisher Spawned at [${location}]!");

register("tick", () => {
    vanquishers = [];
    if (getWorld() != "crimson isle" || !settings.vanqDetect) return;
    
    entities = World.getAllEntitiesOfType(EntityWither.class);
    vanqs = entities.filter((entity) => entity.getEntity().func_110138_aP() == 1024);

    if (vanqs.length > 0) {
        Client.Companion.showTitle(`${DARK_PURPLE}${BOLD}VANQUISHER ${WHITE}DETECTED!`, "", 0, 25, 5);
        if (data.moblist.includes("vanquisher")) {
            vanqs.forEach(vanq => { vanquishers.push(vanq) });
            if (soundCD && settings.vanqSound) {
                soundCD = false;
                AMOGUS.play();
                setTimeout(() => { soundCD = true }, 10000);
            }
        }
    }
});

export function getVanquishers() {
    return vanquishers;
}


// --- Inquisitor Alert ---
const EntityPlayerMP = Java.type("net.minecraft.client.entity.EntityOtherPlayerMP");
let inquisitor = undefined;

// Annouces your own Inquisitors
register("chat", () => {
    if (!settings.dianaAlert) return;

    entities = World.getAllEntitiesOfType(EntityPlayerMP.class);
    inquisitor = entities.find((entity) => entity.getName().equals("Minos Inquisitor"));

    if (inquisitor != undefined)
        annoucePosition(settings.dianaAlert == 1, "Minos Inquisitor", inquisitor.getX(), inquisitor.getY(), inquisitor.getZ());
}).setCriteria("${wow}! You dug out a Minos Champion!");

// Tracks all nearby Inquisitors
let inquisitors = [];

register("tick", () => {
    inquisitors = [];
    if (!settings.detectInq || getWorld() != "hub") return;

    entities = World.getAllEntitiesOfType(EntityPlayerMP.class);
    inqs = entities.filter((entity) => entity.getName().equals("Minos Inquisitor"));

    if (inqs.length > 0) {
        Client.Companion.showTitle(`${GOLD}${BOLD}INQUISITOR ${WHITE}DETECTED!`, "", 0, 25, 5);
        if (data.moblist.includes("inquisitor"))
            inqs.forEach(inq => { inquisitors.push(inq) });
    }
});

export function getInquisitors() {
    return inquisitors;
}


// --- Slayer Alert ---
let miniCD = false;
let bossCD = false;

// Get Miniboss Spawn
register("soundPlay", (pos, name, vol, pitch, category, event) => {
    if (!settings.miniAlert || miniCD || name != "random.explode" || vol != 0.6000000238418579 || pitch != 1.2857142686843872) return;

    annoucePosition(settings.miniAlert == 1, "Slayer Miniboss", Player.getX(), Player.getY(), Player.getZ());

    miniCD = true;
    setTimeout(() => { miniCD = false }, 3000);
});

// Boss Spawn
register("step", () => {
    if (!settings.miniAlert || bossCD) return;

    const bossLine = Scoreboard.getLines().find((line) => line.getName().includes("Slay the boss!"));
    if (bossLine != undefined) {
        annoucePosition(settings.bossAlert == 1, "Slayer Boss", Player.getX(), Player.getY(), Player.getZ());

        bossCD = true;
    }
}).setFps(10);

register("chat", () => {
    bossCD = false;
}).setCriteria("  SLAYER QUEST COMPLETE!");
