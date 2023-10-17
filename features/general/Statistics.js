import { AQUA, BOLD, DARK_AQUA, DARK_GREEN, DARK_RED, GOLD, GREEN, LOGO, RED, YELLOW } from "../../utils/constants";
import { formatNumber } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import settings from "../../utils/settings";
import toggles from "../../utils/toggles";
import { data, registerWhen } from "../../utils/variables";


/**
 * Stats display overlay variables
 */
const statsExample = 
`${DARK_AQUA + BOLD}Soulflow: ${GREEN}.-. .- - ${AQUA}⸎`;
const statsOverlay = new Overlay("statsDisplay", ["all"], () => true, data.YL, "moveStats", statsExample);

/**
 * Get equipped pet through pet menu / autopet.
 */
register("guiOpened", () => {
    Client.scheduleTask(1, () => {
        const container = Player.getContainer();
        if (!container.getName().startsWith("Pets (")) return;

        // Loop through pet menu
        const pets = container.getItems();
        for (let i = 1; i <= 4; i++) {
            for (let j = 1; j <= 7; j++) {
                let pet = pets[i * 9 + j];
                if (pet.getLore().find(lore => lore === "§5§o§7§cClick to despawn!") !== undefined) {
                    let name = pet.getName();
                    data.pet = name.substring(name.indexOf(']') + 2);
                }
            }
        }
    });
});
register("chat", (pet) => {
    data.pet = pet.substring(pet.indexOf(']') + 2);
}).setCriteria("&cAutopet &eequipped your ${pet}&e! &a&lVIEW RULE&r");
register("chat", (pet) => {
    data.pet = pet;
}).setCriteria("&r&aYou summoned your ${pet}&r&a!&r");

/**
 * Tab stats
 */
const stats = [];
registerWhen(register("step", () => {
    let tab = TabList?.getNames();
    if (tab === undefined) return;
    stats.length = 0;

    let index = tab.findIndex(line => line.startsWith("§r§e§lSkills:")) + 1;
    let stat = tab[index];

    while (stat?.length > 5) {
        stats.push(stat);
        stat = tab[++index];
    }
}).setDelay(1), () => true);

/**
 * Get soulflow using inventory
 */
let soulflow = 0;
register("step", () => {
    const container = Player.getContainer();
    if (container === null) return;

    container.getItems().forEach(item => {
        if (item !== null && item.getName().includes("Soulflow")) {
            const internal = item.getLore()[1].removeFormatting();
            if (internal.startsWith("Internalized:")) soulflow = internal.replace(/[^0-9]/g, '');
        }
    });
}).setFps(10);

/**
 * Update statsOverlay message
 */
registerWhen(register("tick", () => {
    statsOverlay.message = "";

    // Pet
    if (toggles.petDisplay) {
        statsOverlay.message += `${DARK_AQUA + BOLD}Pet: ${data.pet}\n`;
    }

    // Stats
    if (toggles.statsDisplay) {
        statsOverlay.message += `${DARK_AQUA + BOLD}Stats:\n`;
        stats.forEach(stat => statsOverlay.message += `-${stat}\n` );
    }

    // Soulflow
    if (toggles.soulflowDisplay) {
        const soulflowColor = soulflow > 100_000 ? GREEN :
            soulflow > 75_000 ? DARK_GREEN :
            soulflow > 50_000 ? YELLOW :
            soulflow > 25_000 ? GOLD : 
            soulflow > 10_000 ? RED : DARK_RED;
        
        statsOverlay.message += `${DARK_AQUA + BOLD}SF: ${soulflowColor + formatNumber(soulflow) + AQUA} ⸎`;
    }
}), () => settings.statsDisplay);

/**
 * Output Stats to user chat when user requests via command args.
 * 
 * @param {String} stat - Status type to retrieve.
 */
export function getStat(stat) {
    switch (stat) {
        case "pet":
            ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}Pet: ${data.pet}`);
            break;
        case "stats":
            ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}Stats:`);
            stats.forEach(stat => ChatLib.chat(`-${stat}`) );
            break;
        case "soulflow":
        case "sf":
            const soulflowColor = soulflow > 100_000 ? GREEN :
                soulflow > 75_000 ? DARK_GREEN :
                soulflow > 50_000 ? YELLOW :
                soulflow > 25_000 ? GOLD : 
                soulflow > 10_000 ? RED : DARK_RED;
            
            ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}SF: ${soulflowColor + formatNumber(soulflow) + AQUA} ⸎`);
            break;
    }
}
