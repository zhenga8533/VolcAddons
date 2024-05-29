import location from "../../utils/Location";
import Settings from "../../utils/Settings";
import Waypoint from "../../utils/Waypoint";
import { BOLD, DARK_GRAY, GOLD, GREEN, LIGHT_PURPLE, RED, STAND_CLASS, WHITE, YELLOW } from "../../utils/Constants";
import { convertToTitleCase, formatTime } from "../../utils/functions/format";
import { Json } from "../../utils/Json";
import { printList } from "../../utils/ListTils";
import { registerWhen } from "../../utils/RegisterTils";
import { Overlay } from "../../utils/Overlay";
import { data } from "../../utils/Data";
import { announceMob } from "../../utils/functions/misc";


/**
 * Missing rabbits
 */
const missingRabbits = new Json("rabbits.json", true).getData();

register("guiOpened", () => {
    Client.scheduleTask(2, () => {
        if (!Player.getContainer().getName().endsWith("Hoppity's Collection")) return;
        
        const items = Player.getContainer().getItems();
        for (let i = 1; i < 5; i++) {
            for (let j = 1; j < 8; j++) {
                // Track rabbits with requirements
                let item = items[i * 9 + j];
                let lore = item?.getLore();
                let index = lore?.findIndex(line => line.includes('Requirement'));
                if (index === -1) continue;

                // Get rabbit data
                let complete = !lore[index].startsWith("§5§o§c✖");
                let name = item.getName();

                // Get requirement
                let requirement = '';
                while (lore[++index]?.length > 4) requirement += lore[index] + ' ';

                // Update missing rabbits
                if (!complete) missingRabbits[name] = requirement;
                else if (missingRabbits.hasOwnProperty(name)) delete missingRabbits[name];
            }
        }
    })
});

/**
 * Print missing rabbits.
 * 
 * @param {Number} page - The page number to display.
 */
export function printRabbits(page, backup) {
    printList(missingRabbits, "Rabbits", isNaN(page) ? backup : page);
    if (Object.keys(missingRabbits).length === 30)
        ChatLib.chat(`${DARK_GRAY}Remember to go through rabbits menu to initialize tracking!`);
}


/**
 * Rabbit chat detection.
 */
register("chat", (x) => {
    data.cf.chocolate += parseInt(x.replace(/,/g, '') || 0);
    data.eggs.dupe++;
}).setCriteria("DUPLICATE RABBIT! +${x} Chocolate");

registerWhen(register("chat", (choco, mult) => {
    const cf = data.cf;
    cf.multiplier += parseFloat(mult);
    cf.production += parseInt(choco) * cf.multiplier;
    data.eggs.total++;
}).setCriteria("NEW RABBIT! +${choco} Chocolate and +${mult}x Chocolate per second!"), () => Settings.chocoDisplay);

registerWhen(register("chat", (mult) => {
    if (isNaN(mult)) return;
    data.cf.multiplier += parseFloat(mult);
    data.eggs.total++;
}).setCriteria("NEW RABBIT! +${mult}x Chocolate per second!"), () => Settings.chocoDisplay);

/**
 * Egglocator
 */
const eggWaypoints = new Waypoint([0.25, 0.1, 0]);  // Brown Eggs

const EGGS = {
    "015adc61-0aba-3d4d-b3d1-ca47a68a154b": "Breakfast",
    "55ae5624-c86b-359f-be54-e0ec7c175403": "Lunch",
    "e67f7c89-3a19-3f30-ada2-43a3856e5028": "Dinner"
};
let looted = {
    "Breakfast": false,
    "Lunch": false,
    "Dinner": false
};
let lastLooted = {
    "Breakfast": 0,
    "Lunch": 0,
    "Dinner": 0
}

// Track if egg was looted.
registerWhen(register("chat", (type) => {
    looted[type] = true;
    if (lastLooted[type] === 0) lastLooted[type] = Date.now();
}).setCriteria("You have already collected this Chocolate ${type} Egg! Try again when it respawns!"),
() => (Settings.chocoWaypoints || Settings.eggTimers) && location.getSeason() === "Spring");

registerWhen(register("chat", (type) => {
    looted[type] = true;
    lastLooted[type] = Date.now();
}).setCriteria("HOPPITY'S HUNT You found a Chocolate ${type} Egg ${loc}!"),
() => (Settings.chocoWaypoints || Settings.eggTimers) && location.getSeason() === "Spring");

registerWhen(register("chat", (type) => {
    looted[type] = false;
}).setCriteria("HOPPITY'S HUNT A Chocolate ${type} Egg has appeared!"),
() => (Settings.chocoWaypoints || Settings.eggTimers) && location.getSeason() === "Spring");

registerWhen(register("tick", () => {
    const time = World.getTime() % 24_000;
    if (Math.abs(time - 1_000) < 4 || Date.now() - lastLooted.Breakfast > 1_200_000)
        looted.Breakfast = false;
    else if (Math.abs(time - 8_000) < 4 || Date.now() - lastLooted.Lunch > 1_200_000) 
        looted.Lunch = false;
    else if (Math.abs(time - 15_000) < 4 || Date.now() - lastLooted.Dinner > 1_200_000) 
        looted.Dinner = false;
}), () => (Settings.chocoWaypoints || Settings.eggTimers) && location.getSeason() === "Spring");

// ArmorStand ESP susge, UAYOR
registerWhen(register("step", () => {
    const stands = World.getAllEntitiesOfType(STAND_CLASS);
    eggWaypoints.clear();

    stands.forEach(stand => {
        const helmet = stand.getEntity()?.func_71124_b(4);  // getEquipmentInSlot(0: Tool in Hand; 1-4: Armor)
        if (helmet !== null) {
            const id = helmet.func_77978_p()?.func_74775_l("SkullOwner")?.func_74779_i("Id");  // getNBT() +> getNBTTagCompound() => getString()
            if (id in EGGS && !looted[EGGS[id]]) eggWaypoints.push([EGGS[id], stand.getX(), stand.getY() + 1, stand.getZ()]);
        }
    });
}).setFps(1), () => Settings.chocoWaypoints);


/**
 * Announce egg location on roulette completion.
 */
let chocoType = "";
let chocoLoc = "";

const announceOnClose = register("guiClosed", () => {
    Client.scheduleTask(5, () => announceMob(Settings.chocoAlert, chocoType, Player.getX(), Player.getY(), Player.getZ(), chocoLoc));
    announceOnClose.unregister();
}).unregister();

registerWhen(register("chat", (type, loc) => {
    chocoType = type + " Egg";
    chocoLoc = convertToTitleCase(loc);
    announceOnClose.register();
}).setCriteria("HOPPITY'S HUNT You found a Chocolate ${type} Egg ${loc}!"), () => Settings.chocoAlert !== 0);


/**
 * Egg timer overlay.
 * 
 * 18k = midnight
 * Breakfast- 7:00 am = 1_000
 * Lunch- 2:00 pm = 8_000
 * Dinner- 9:00 pm = 15_000
 */
const eggExample = 
`${GOLD + BOLD}Egg Timers:
 ${YELLOW}Breakfast: ${WHITE}bling
 ${YELLOW}Lunch: ${WHITE}bang
 ${YELLOW}Dinner: ${WHITE}bang`;
const eggOverlay = new Overlay("eggTimers", data.CGL, "moveEgg", eggExample);

registerWhen(register("step", () => {
    const time = World.getTime() % 24_000;
    const breakfastTime = time > 1_000 ? 25_000 - time : 1_000 - time;
    const lunchTime = time > 8_000 ? 32_000 - time : 8_000 - time;
    const dinnerTime = time > 15_000 ? 39_000 - time : 15_000 - time;
    eggOverlay.setMessage(
`${GOLD + BOLD}Egg Timers:
 ${YELLOW}Breakfast: ${WHITE + formatTime(breakfastTime / 20)} ${looted.Breakfast ? GREEN + "✔" : RED + "✘"}
 ${YELLOW}Lunch: ${WHITE + formatTime(lunchTime / 20)} ${looted.Lunch ? GREEN + "✔" : RED + "✘"}
 ${YELLOW}Dinner: ${WHITE + formatTime(dinnerTime / 20)} ${looted.Dinner ? GREEN + "✔" : RED + "✘"}`);
}).setFps(1), () => Settings.eggTimers && location.getSeason() === "Spring");

registerWhen(register("chat", (type) => {
    Client.showTitle(`${LIGHT_PURPLE + BOLD}EGG SPAWNED!`, `${GOLD}A ${type} Egg ${GOLD}has spawned.`, 10, 50, 10);
}).setCriteria("&r&d&lHOPPITY'S HUNT &r&dA &r${type} Egg &r&dhas appeared!&r"), () => Settings.eggTimers && location.getSeason() === "Spring");
