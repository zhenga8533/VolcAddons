import location from "../../utils/location";
import settings from "../../utils/settings";
import { BOLD, DARK_GRAY, DARK_PURPLE, GOLD, GRAY, GREEN, LIGHT_PURPLE, RED, STAND_CLASS, WHITE, YELLOW } from "../../utils/constants";
import { getSlotCoords } from "../../utils/functions/find";
import { convertToTitleCase, formatNumber, formatTime, unformatNumber } from "../../utils/functions/format";
import { registerWhen } from "../../utils/register";
import { Overlay } from "../../utils/overlay";
import { data } from "../../utils/data";
import { announceMob } from "../../utils/functions/misc";


/**
 * Choco latte
 */
const updateChocolate = register("tick", () => {
    if (Player?.getContainer()?.getName() !== "Chocolate Factory") return;
    const items = Player.getContainer().getItems();

    // Fetch the meaning of life
    const chocoData = items[13];
    if (chocoData) {
        data.chocolate = parseInt(chocoData.getName().removeFormatting().replace(/\D/g, ""));
        data.chocoProduction = parseFloat(chocoData.getLore().find(line => line.endsWith("§8per second")).removeFormatting().replace(/,/g, ""));
        data.chocoLast = Math.floor(Date.now() / 1000);
        
        const allTime = chocoData.getLore().find(line => line.startsWith("§5§o§7All-time"))?.removeFormatting()?.split(' ');
        data.chocoAll = parseFloat(allTime?.[2]?.removeFormatting()?.replace(/,/g, "") ?? 0);
    }

    // Fetch data related to prestiging
    const prestigeData = items[28]?.getLore();
    if (prestigeData !== undefined) {
        const prestigeTotal = prestigeData.find(line => line.startsWith("§5§o§7Chocolate this Prestige"))?.removeFormatting()?.split(' ');
        data.chocoTotal = parseFloat(prestigeTotal?.[prestigeTotal.length - 1]?.replace(/,/g, "") ?? 0);

        const pestige = prestigeData.find(line => line.startsWith("§5§o§7§cRequires"))?.removeFormatting()?.split(' ');
        data.chocoPrestige = unformatNumber(pestige[1]);
    }

    // Fetch eggs
    const eggData = items[34]?.getLore();
    if (eggData !== undefined) {
        const barnLine = eggData.find(line => line.startsWith("§5§o§7Your Barn:")).split(' ');
        data.totalEggs = parseInt(barnLine[2].removeFormatting().split('/')[0]);
    }
}).unregister();

/**
 * Chocolate overlay.
 */
const chocoExample =
`§6§lChocolate:
 §eCurrent: §f12.72m
 §eProduction: §73.59k
 §eTotal: §f901.78m
 §eAll-time: §71.11b
 §ePrestige: §f1.00b

§6§lTime:
 §ePrestige: §77hr36m10s
 §eLast Open: §f2m27s

§6§lRabbits:
 §eTotal: §7101
 §eDupes: §f0`;
const chocoOverlay = new Overlay("chocoDisplay", data.CFL, "moveChoco", chocoExample);

register("step", () => {
    const now = Math.floor(Date.now() / 1000);
    const lastOpen = now - data.chocoLast;
    const chocoCalc = lastOpen * data.chocoProduction;
    const chocoTotal = chocoCalc + data.chocoTotal;
    const chocoAll = chocoCalc + data.chocoAll;
    const prestigeTime = (data.chocoPrestige - chocoTotal) / data.chocoProduction;

    chocoOverlay.setMessage(
`${GOLD + BOLD}Chocolate:
 ${YELLOW}Current: ${WHITE + formatNumber(chocoCalc + data.chocolate)}
 ${YELLOW}Production: ${GRAY + formatNumber(data.chocoProduction)}
 ${YELLOW}Total: ${WHITE + formatNumber(chocoTotal)}
 ${YELLOW}All-time: ${GRAY + formatNumber(chocoAll)}
 ${YELLOW}Prestige: ${data.chocoPrestige > 0 ? WHITE + formatNumber(data.chocoPrestige) : GREEN + "✔"}

${GOLD + BOLD}Time:
 ${YELLOW}Prestige: ${GRAY + formatTime(prestigeTime)}
 ${YELLOW}Last Open: ${WHITE + formatTime(lastOpen)}

${GOLD + BOLD}Rabbits:
 ${YELLOW}Total: ${GRAY + data.totalEggs}
 ${YELLOW}Dupes: ${WHITE + data.dupeEggs}`);
}).setFps(1);

register("chat", () => {
    data.dupeEggs++;
}).setCriteria("DUPLICATE RABBIT! +${x} Chocolate");


/**
 * Highlight best worker.
 */
let bestWorker = 0;
let bestCost = 0;

function findWorker() {
    bestWorker = 0;
    const items = Player.getContainer().getItems();
    const workers = [];
    for (let i = 29; i < 34; i++) workers.push(items[i].getLore())

    let maxValue = 0;
    for (let i = 0; i < 5; i++) {
        let worker = workers[i];
        let index = worker.findIndex(line => line === "§5§o§7Cost");
        if (index === -1) continue;
        let cost = parseInt(worker[index + 1].removeFormatting().replace(/\D/g, ""));
        let value = (i + 1) / cost;

        if (value > maxValue) {
            bestWorker = 29 + i;
            maxValue = value;
            bestCost = cost;
        }
    }
}

const workerFind = register("chat", () => {
    Client.scheduleTask(2, () => {
        findWorker();
    });
}).setCriteria("Rabbit ${rabbit} has been promoted to ${rank}!").unregister();

const workerHighlight = register("guiRender", () => {
    if (bestWorker === 0) return;
    const containerType = Player.getContainer().getClassName();
    const [x, y] = getSlotCoords(bestWorker, containerType);

    Renderer.translate(0, 0, 100);
    Renderer.drawRect(data.chocolate > bestCost ? Renderer.GREEN : Renderer.RED, x, y, 16, 16);
}).unregister();

/**
 * /cf controls.
 */
const chocomatte = register("guiClosed", () => {
    chocomatte.unregister();
    updateChocolate.unregister();
    workerFind.unregister();
    workerHighlight.unregister();
}).unregister();

registerWhen(register("guiOpened", () => {
    Client.scheduleTask(2, () => {
        if (Player.getContainer().getName() !== "Chocolate Factory") return;

        updateChocolate.register();
        if (settings.workerHighlight) {
            findWorker();
            workerFind.register();
            workerHighlight.register();
            chocomatte.register();
        }
    });
}), () => settings.workerHighlight || settings.chocoDisplay);


/**
 * Egglocator
 */
let eggWaypoints = [];
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
export function getEggs() { return eggWaypoints };

// Track if egg was looted.
registerWhen(register("chat", (type) => {
    looted[type] = true;
}).setCriteria("You have already collected this Chocolate ${type} Egg! Try again when it respawns!"),
() => (settings.chocoWaypoints || settings.eggTimers) && location.getSeason() === "Spring");

registerWhen(register("chat", (type) => {
    looted[type] = true;
}).setCriteria("HOPPITY'S HUNT You found a Chocolate ${type} Egg ${loc}!"),
() => (settings.chocoWaypoints || settings.eggTimers) && location.getSeason() === "Spring");

registerWhen(register("chat", (type) => {
    looted[type] = false;
}).setCriteria("HOPPITY'S HUNT A Chocolate ${type} Egg has appeared!"),
() => (settings.chocoWaypoints || settings.eggTimers) && location.getSeason() === "Spring");

registerWhen(register("tick", () => {
    const time = World.getTime() % 24_000;
    if (Math.abs(time - 1_000) < 4) looted.Breakfast = false;
    else if (Math.abs(time - 8_000) < 4) looted.Lunch = false;
    else if (Math.abs(time - 15_000) < 4) looted.Dinner = false;
}), () => (settings.chocoWaypoints || settings.eggTimers) && location.getSeason() === "Spring");

register("worldUnload", () => {
    looted = {
        "Breakfast": false,
        "Lunch": false,
        "Dinner": false
    };
});

// ArmorStand ESP susge, UAYOR
registerWhen(register("step", () => {
    const stands = World.getAllEntitiesOfType(STAND_CLASS);
    eggWaypoints = [];

    stands.forEach(stand => {
        const helmet = stand.getEntity()?.func_71124_b(4);  // getEquipmentInSlot(0: Tool in Hand; 1-4: Armor)
        if (helmet !== null) {
            const id = helmet.func_77978_p()?.func_74775_l("SkullOwner")?.func_74779_i("Id");  // getNBT() +> getNBTTagCompound() => getString()
            if (id in EGGS && !looted[EGGS[id]]) eggWaypoints.push([EGGS[id], ~~stand.getX(), stand.getY() + 2, ~~stand.getZ()]);
        }
    });
}).setFps(1), () => settings.chocoWaypoints);

register("worldUnload", () => {
    eggWaypoints = [];
});


/**
 * Announce egg location on roulette completion.
 */
let chocoType = "";
let chocoLoc = "";

const announceOnClose = register("guiClosed", () => {
    Client.scheduleTask(5, () => announceMob(settings.chocoAlert, chocoType, Player.getX(), Player.getY(), Player.getZ(), chocoLoc));
    announceOnClose.unregister();
}).unregister();

registerWhen(register("chat", (type, loc) => {
    chocoType = type + " Egg";
    chocoLoc = convertToTitleCase(loc);
    announceOnClose.register();
}).setCriteria("HOPPITY'S HUNT You found a Chocolate ${type} Egg ${loc}!"), () => settings.chocoAlert !== 0);


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
}).setFps(1), () => settings.eggTimers && location.getSeason() === "Spring");

registerWhen(register("chat", (type) => {
    Client.showTitle(`${LIGHT_PURPLE + BOLD}EGG SPAWNED!`, `${GOLD}A ${type} Egg ${GOLD}has spawned.`, 10, 50, 10);
}).setCriteria("&r&d&lHOPPITY'S HUNT &r&dA &r${type} Egg &r&dhas appeared!&r"), () => settings.eggTimers && location.getSeason() === "Spring");
