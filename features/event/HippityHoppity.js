import { getSlotCoords } from "../../utils/functions/find";
import settings from "../../utils/settings";
import { registerWhen } from "../../utils/variables";


/**
 * Choco latte
 */
let chocolate = 0;

const updateChocolate = register("step", () => {
    if (Player?.getContainer()?.getName() !== "Chocolate Factory") return;
    chocolate = parseInt(Player.getContainer().getItems()[13].getName().removeFormatting().replace(/\D/g, ""));
}).setFps(4).unregister();

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
    Renderer.drawRect(chocolate > bestCost ? Renderer.GREEN : Renderer.RED, x, y, 16, 16);
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
