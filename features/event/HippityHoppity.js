import settings from "../../utils/settings";
import { BOLD, DARK_GRAY, GOLD, YELLOW } from "../../utils/constants";
import { getSlotCoords } from "../../utils/functions/find";
import { formatNumber, formatTimeElapsed } from "../../utils/functions/format";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";


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
§6§lTime: §e00:00:11:03`;
const chocoOverlay = new Overlay("chocoDisplay", ["all"], () => true, data.CFL, "moveChoco", chocoExample);

register("step", () => {
    const now = Math.floor(Date.now() / 1000);
    const chocoCalc = (now - data.chocoLast) * data.chocoProduction + data.chocolate;
    const chocoAll = chocoCalc + data.chocoAll;
    chocoOverlay.message = `${GOLD + BOLD}Chocolate: ${YELLOW + formatNumber(chocoCalc) + DARK_GRAY} (${formatNumber(data.chocoProduction)}/s)`;
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
