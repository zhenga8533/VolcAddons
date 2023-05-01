import { BOLD, DARK_PURPLE, GOLD, WHITE } from "../constants";
import settings from "../settings"
import { data, getInParty, getWorld } from "../variables"

// GENERAL FUNCTIONS
function annoucePosition(toAll, mob, x, y ,z) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    // AREA PLAYER IS IN
    let area = Scoreboard.getLines().find((line) => line.getName().includes("⏣"));
    if (area != undefined)
        area = area.getName().removeFormatting();

    if (toAll)
        ChatLib.command(`ac x: ${x}, y: ${y}, z: ${z} | ${mob} Spawned at [${area} ]!`);
    else if (getInParty())
        ChatLib.command(`pc x: ${x}, y: ${y}, z: ${z} | ${mob} Spawned at [${area} ]!`);
}

// --- Vanquisher Alert ---
const EntityWither = Java.type('net.minecraft.entity.boss.EntityWither');
let entities = [];
let vanquishers = [];

register("chat", () => {
    if (!settings.vanqAlert || settings.vanqParty.length > 0) return;

    annoucePosition(settings.vanqAlertAll, "Vanquisher", Player.getX(), Player.getY(), Player.getZ());
}).setCriteria("A Vanquisher is spawning nearby!");

register("tick", () => {
    vanquishers = [];
    if (getWorld() != "crimson isle" || !settings.vanqDetect) return;
    
    entities = World.getAllEntitiesOfType(EntityWither.class);
    vanqs = entities.filter((entity) => entity.getEntity().func_110138_aP() == 1024);

    if (vanqs.length > 0) {
        Client.Companion.showTitle(`${DARK_PURPLE}${BOLD}VANQUISHER ${WHITE}DETECTED!`, "", 0, 25, 5);
        if (data.moblist.includes("vanquisher"))
            vanqs.forEach(vanq => { vanquishers.push(vanq) });
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
        annoucePosition(settings.dianaAlertAll, "Minos Inquisitor", inquisitor.getX(), inquisitor.getY(), inquisitor.getZ());
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

// To draw waypoint
export function getInquisitors() {
    return inquisitors;
}