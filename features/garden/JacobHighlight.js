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
    unclaimed.forEach(index => {
        // Credit to https://www.chattriggers.com/modules/v/ExperimentationTable
        const x = index % 9;
        const y = Math.floor(index / 9);
        const renderX = Renderer.screen.getWidth() / 2 + ((x - 4) * 18);
        const renderY = (Renderer.screen.getHeight() + 10) / 2 + ((y - Player.getContainer().getSize() / 18) * 18);
    
        Renderer.translate(0, 0, 100);
        Renderer.drawRect(Renderer.color(57, 255, 20, 128), renderX - 9, renderY - 9, 17, 17);
    })
}), () => getWorld() === "Garden" && settings.jacobReward);
