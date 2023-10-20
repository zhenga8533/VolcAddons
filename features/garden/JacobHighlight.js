import { getSlotCoords } from "../../utils/functions";
import settings from "../../utils/settings";
import { registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";


/**
 * Track and reset all unclaimed rewards on Jacob reward menu open.
 */
let unclaimed = [];
registerWhen(register("guiOpened", () => {
    Client.scheduleTask(1, () => {
        const container = Player.getContainer();
        if (container.getName() !== "Your Contests") return;
        for (let i = 10; i <= 43; i++) {
            let lore = container.getStackInSlot(i).getLore().pop();
            if (lore === "§5§o§eClick to claim reward!") {
                unclaimed.push(i);
            }
        }        
    })
}), () => getWorld() === "Garden" && settings.jacobReward);
registerWhen(register("guiClosed", () => {
    unclaimed = [];
}), () => getWorld() === "Garden" && settings.jacobReward);

/**
 * Renders neon green box over unclaimed rewards.
 */
registerWhen(register("guiRender", () => {
    if (unclaimed.length === 0) return;
    const containerType = Player.getContainer().getClassName();

    unclaimed.forEach(index => {
        const [x, y] = getSlotCoords(index, containerType);
    
        Renderer.translate(0, 0, 100);
        Renderer.drawRect(Renderer.color(57, 255, 20, 128), x, y, 16, 16);
    })
}), () => getWorld() === "Garden" && settings.jacobReward);
