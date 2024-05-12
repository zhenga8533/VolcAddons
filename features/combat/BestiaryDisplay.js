import settings from "../../utils/settings";
import { romanToNum } from "../../utils/functions/format";
import { registerWhen } from "../../utils/register";


/**
 * Parse bestiary level inventory
 * [ [levels], [completed] ]
 */
const bestiaryData = [[], []];

/**
 * Trigger to record and track bestiary menu levels.
 */
const setLevels = register("guiRender", () => {
    const container = Player.getContainer();

    if (bestiaryData[0].length === 0) {
        rows: for (let i = 1; i < 5; i++) {
            for (let j = 1; j < 8; j++) {
                let index = i*9 + j;
                let item = container.getStackInSlot(index);
                if (item === null || item.getRegistryName() === "minecraft:stained_glass_pane") break rows;
                
                let lore = item.getLore();
                let completed = lore[lore.length - 4] === "§5§o§7Overall Progress: §b100% §7(§c§lMAX!§7)";
                bestiaryData[1].push(completed);
                bestiaryData[0].push(completed ? 1 : romanToNum(item.getName().split(' ').pop()));
            }
        }
    }

    bestiaryData[0].forEach((level, i) => {
        let index = 2*parseInt(i/7) + 10 + i;
        let item = container.getStackInSlot(index);
        item.setStackSize(isNaN(level) ? 0 : level);
    })
}).unregister();

/**
 * Trigger to highlight uncompleted bestiary milestones in red.
 */
const setHighlight = register('guiRender', () => {
    bestiaryData[1].forEach((complete, i) => {
        // Credit to https://www.chattriggers.com/modules/v/ExperimentationTable
        if (complete) return;
        let index = 2*parseInt(i/7) + 10 + i
        const x = index % 9;
        const y = Math.floor(index / 9);
        const renderX = Renderer.screen.getWidth() / 2 + ((x - 4) * 18);
        const renderY = (Renderer.screen.getHeight() + 10) / 2 + ((y - Player.getContainer().getSize() / 18) * 18);
    
        Renderer.translate(0, 0, 100);
        Renderer.drawRect(Renderer.color(255, 87, 51, 128), renderX - 9, renderY - 9, 17, 17);
    })
}).unregister();

/**
 * Register/unregister bestiary stack size
 */
registerWhen(register("guiOpened", () => {
    Client.scheduleTask(1, () => {
        const containerName = Player.getContainer().getName();
        if ((!containerName.includes("Bestiary ➜") && !containerName.includes("Fishing ➜"))) return;
        setLevels.register();
        setHighlight.register();
    })
}), () => settings.bestiaryGUI);
registerWhen(register("guiClosed", () => {
    setLevels.unregister();
    setHighlight.unregister();
    bestiaryData[0] = [];
    bestiaryData[1] = [];
}), () => settings.bestiaryGUI);


/**
 * Bestiary widget tracker.
 */
