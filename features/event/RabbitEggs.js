import location from "../../utils/Location";
import Settings from "../../utils/Settings";
import Waypoint from "../../utils/Waypoint";
import { AMOGUS, BOLD, DARK_GRAY, GOLD, GREEN, LIGHT_PURPLE, LOGO, RED, STAND_CLASS, WHITE, YELLOW } from "../../utils/Constants";
import { convertToTitleCase, formatTime } from "../../utils/functions/format";
import { Json } from "../../utils/Json";
import { printList } from "../../utils/ListTils";
import { registerWhen } from "../../utils/RegisterTils";
import { Overlay } from "../../utils/Overlay";
import { data } from "../../utils/Data";
import { announceMob, playSound } from "../../utils/functions/misc";
import { getClosest } from "../../utils/functions/find";
import { setTitle } from "../../utils/Title";


/**
 * Missing rabbits
 */
const missingRabbits = new Json("rabbits.json", true).getData();
register("guiOpened", () => {
    Client.scheduleTask(1, () => {
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
                let requirement = lore[index] + '\n    ';
                while (lore[++index]?.length > 4) requirement += ' ' + lore[index];

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
    printList(missingRabbits, "Rabbits", isNaN(page) ? backup : page, 6);
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
const eggLocs = [];
const eggWaypoints = new Waypoint([0.25, 0.1, 0]);  // Brown Eggs
const newWaypoints = new Waypoint([0.88, 0.75, 0.72]);  // Rose Gold Eggs

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

    // Set last looted time
    if (lastLooted[type] === 0) {
        const time = World.getTime() % 24_000 + 100;
        const offset = type === "Breakfast" ? (time > 1_000 ? 1_000 - time : -23_000 - time) : 
            type === "Lunch" ? (time > 8_000 ? 8_000 - time : -16_000 - time) : 
            type === "Dinner" ? (time > 15_000 ? 15_000 - time : -9_000 - time) : 0;
        lastLooted[type] = Date.now() + (offset * 50);
    }
}).setCriteria("You have already collected this Chocolate ${type} Egg! Try again when it respawns!"),
() => (Settings.chocoWaypoints || Settings.eggTimers) && location.getSeason() === "Spring");

registerWhen(register("chat", (type) => {
    // Set looted status and last looted time
    looted[type] = true;
    const time = World.getTime() % 24_000 + 100;
    const offset = type === "Breakfast" ? (time > 1_000 ? 1_000 - time : -23_000 - time) : 
        type === "Lunch" ? (time > 8_000 ? 8_000 - time : -16_000 - time) : 
        type === "Dinner" ? (time > 15_000 ? 15_000 - time : -9_000 - time) : 0;
    lastLooted[type] = Date.now() + (offset * 50);

    // Track egg location
    const found = data.eggs.found;
    const world = location.getWorld();
    const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], eggLocs)[0];
    const wpKey = closest[0] + "," + closest[2];
    if (!found.hasOwnProperty(world)) found[world] = {};
    if (!found[world].hasOwnProperty(wpKey)) found[world][wpKey] = 1;
    else found[world][wpKey]++;
}).setCriteria("HOPPITY'S HUNT You found a Chocolate ${type} Egg ${loc}!"),
() => (Settings.chocoWaypoints || Settings.eggTimers) && location.getSeason() === "Spring");

registerWhen(register("chat", (type) => {
    looted[type] = false;
}).setCriteria("HOPPITY'S HUNT A Chocolate ${type} Egg has appeared!"),
() => (Settings.chocoWaypoints || Settings.eggTimers) && location.getSeason() === "Spring");

registerWhen(register("tick", () => {
    const time = World.getTime() % 24_000;

    if (Math.abs(time - 1_000) < 4 || Date.now() - lastLooted.Breakfast > 1_200_000) {
        looted.Breakfast = false;
        lastLooted.Breakfast = 0;
    }
    if (Math.abs(time - 8_000) < 4 || Date.now() - lastLooted.Lunch > 1_200_000) {
        looted.Lunch = false;
        lastLooted.Lunch = 0;
    }
    if (Math.abs(time - 15_000) < 4 || Date.now() - lastLooted.Dinner > 1_200_000) {
        looted.Dinner = false;
        lastLooted.Dinner = 0;
    }
}), () => (Settings.chocoWaypoints || Settings.eggTimers) && location.getSeason() === "Spring");

// ArmorStand ESP susge, UAYOR
registerWhen(register("step", () => {
    const stands = World.getAllEntitiesOfType(STAND_CLASS);
    eggWaypoints.clear();
    newWaypoints.clear();
    const eggOld = [...eggLocs];
    eggLocs.length = 0;

    stands.forEach(stand => {
        // Check if valid armor stand
        const helmet = stand.getEntity()?.func_71124_b(4);  // getEquipmentInSlot(0: Tool in Hand; 1-4: Armor)
        if (helmet === null) return;

        // Check if valid egg ID
        const id = helmet.func_77978_p()?.func_74775_l("SkullOwner")?.func_74779_i("Id");  // getNBT() +> getNBTTagCompound() => getString()
        if (!(id in EGGS) || looted[EGGS[id]]) return;

        // Add waypoint
        const wp = [EGGS[id], stand.getX(), stand.getY() + 1, stand.getZ()];
        const coords = wp.slice(1);
        eggLocs.push(coords);
        if (data.eggs.found[location.getWorld()]?.hasOwnProperty(`${stand.getX()},${stand.getZ()}`))
            eggWaypoints.push(wp);
        else
            newWaypoints.push(wp);
    
        // Announce egg if new
        const coordsStr = coords.toString();
        if (eggOld.find(egg => coordsStr === egg.toString()) === undefined)
            ChatLib.chat(`${LOGO + YELLOW}Found a ${EGGS[id]} Egg: ${coords.map(c => Math.round(c)).join(', ')}!`);
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
    setTitle(`${LIGHT_PURPLE + BOLD}EGG SPAWNED!`, `${GOLD}A ${type} Egg ${GOLD}has spawned.`, 10, 50, 10, 40);
}).setCriteria("&r&d&lHOPPITY'S HUNT &r&dA &r${type} Egg &r&dhas appeared!&r"), () => Settings.eggTimers && location.getSeason() === "Spring");


/**
 * Stray rabbit detection.
 */
const strayDetect = register("step", () => {
    const items = Player.getContainer().getItems();
    for (let i = 0; i < 27; i++) {
        if (i === 13) continue;

        let item = items[i];
        if (item.getRegistryName() !== "minecraft:stained_glass_pane")
            playSound(AMOGUS, 10_000);
    }
}).setDelay(1).unregister();

const strayClose = register("guiClosed", () => {
    strayDetect.unregister();
    strayClose.unregister();
}).unregister();

registerWhen(register("guiOpened", () => {
    Client.scheduleTask(2, () => {
        if (Player.getContainer().getName() !== "Chocolate Factory") return;
        strayClose.register();
        strayDetect.register();
    })
}), () => Settings.strayAlarm);
