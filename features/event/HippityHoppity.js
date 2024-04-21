import settings from "../../utils/settings";
import { BOLD, DARK_GRAY, GOLD, STAND_CLASS, YELLOW } from "../../utils/constants";
import { getSlotCoords } from "../../utils/functions/find";
import { convertToTitleCase, formatNumber, formatTimeElapsed } from "../../utils/functions/format";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
import { announceMob } from "../../utils/functions/misc";


/**
 * Choco latte
 */
const updateChocolate = register("step", () => {
    if (Player?.getContainer()?.getName() !== "Chocolate Factory") return;
    const chocoData = Player.getContainer().getItems()[13];
    if (chocoData === null) return;

    data.chocolate = parseInt(chocoData.getName().removeFormatting().replace(/\D/g, ""));
    data.chocoProduction = parseFloat(chocoData.getLore().find(line => line.endsWith("§8per second")).removeFormatting().replace(/,/g, ""));
    data.chocoLast = Math.floor(Date.now() / 1000);

    const allTime = Player.getContainer().getItems()[28].getLore().find(line => line.startsWith("§5§o§7Chocolate this Prestige"))?.removeFormatting()?.split(' ');
    data.chocoAll = parseFloat(allTime?.[allTime.length - 1]?.replace(/,/g, "") ?? 0);
}).setFps(2).unregister();

/**
 * Chocolate overlay.
 */
const chocoExample =
`§6§lChocolate: §e3.95m§8 (1.49k/s)
§6§lTotal: §e4.20m
§6§lTime: §e00:00:11:03`;
const chocoOverlay = new Overlay("chocoDisplay", ["all"], () => true, data.CFL, "moveChoco", chocoExample);

register("step", () => {
    const now = Math.floor(Date.now() / 1000);
    const chocoCalc = (now - data.chocoLast) * data.chocoProduction;
    const chocoAll = chocoCalc + data.chocoAll;
    chocoOverlay.message = `${GOLD + BOLD}Chocolate: ${YELLOW + formatNumber(chocoCalc + data.chocolate) + DARK_GRAY} (${formatNumber(data.chocoProduction)}/s)`;
    chocoOverlay.message += `\n${GOLD + BOLD}Total: ${YELLOW + formatNumber(chocoAll)}`;
    chocoOverlay.message += `\n${GOLD + BOLD}Time: ${YELLOW + formatTimeElapsed(data.chocoLast, now)}`;
}).setFps(1);


/**
 * Highlight best worker.
 */
let bestWorker = 29;
let bestCost = 0;

function findWorker() {
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
    const containerType = Player.getContainer().getClassName();
    const [x, y] = getSlotCoords(bestWorker, containerType);

    Renderer.translate(0, 0, 100);
    Renderer.drawRect(data.chocolate > bestCost ? Renderer.GREEN : Renderer.RED, x, y, 16, 16);
}).unregister();

/**
 * Chocolate feature controls.
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
}), () => settings.workerHighlight);


/**
 * Egglocator
 */
let eggWaypoints = [];
const EGGS = {
    "015adc61-0aba-3d4d-b3d1-ca47a68a154b": "Breakfast",
    "55ae5624-c86b-359f-be54-e0ec7c175403": "Lunch",
    "e67f7c89-3a19-3f30-ada2-43a3856e5028": "Dinner"
};
export function getEggs() { return eggWaypoints };

registerWhen(register("step", () => {
    const stands = World.getAllEntitiesOfType(STAND_CLASS);
    eggWaypoints = [];

    stands.forEach(stand => {
        const helmet = stand.getEntity()?.func_71124_b(4);  // getEquipmentInSlot(0: Tool in Hand; 1-4: Armor)
        if (helmet !== null) {
            const id = helmet.func_77978_p()?.func_74775_l("SkullOwner")?.func_74779_i("Id");  // getNBT() +> getNBTTagCompound() => getString()
            if (id in EGGS) eggWaypoints.push([EGGS[id], stand.getX(), stand.getY() + 2, stand.getZ()]);
        }
    });
}).setDelay(1), () => settings.chocoWaypoints);

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
