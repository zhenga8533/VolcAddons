import settings from "../../utils/settings";
import toggles from "../../utils/toggles";
import { AQUA, BOLD, DARK_AQUA, DARK_BLUE, DARK_GRAY, DARK_GREEN, DARK_PURPLE, DARK_RED, GOLD, GRAY, GREEN, LOGO, PLAYER_CLASS, RED, WHITE, YELLOW } from "../../utils/constants";
import { formatNumber, getTime } from "../../utils/functions/format";
import { Overlay } from "../../utils/overlay";
import { isPlayer } from "../../utils/functions/player";
import { data, registerWhen } from "../../utils/variables";
import { delay } from "../../utils/thread";


/**
 * Stats display overlay variables
 */
const statsExample = 
`${DARK_AQUA + BOLD}Pet: ${GOLD}-..-
${DARK_AQUA + BOLD}Stats:
${GRAY}- ${WHITE}Strength: ${RED}-1
${GRAY}- ${WHITE}Dexterity: ${RED}-1
${GRAY}- ${WHITE}Constitution: ${RED}-1
${GRAY}- ${WHITE}Intelligence: ${RED}-1
${GRAY}- ${WHITE}Wisdom: ${RED}-1
${GRAY}- ${WHITE}Charisma: ${GREEN}999
${DARK_AQUA + BOLD}Legion: ${RED}0 ${DARK_GRAY}(0%)
${DARK_AQUA + BOLD}SF: ${GREEN}/ -.. ${AQUA}⸎
${DARK_AQUA + BOLD}Daily PT: ${GREEN}/ -..`;
const statsOverlay = new Overlay("statsDisplay", ["all"], () => true, data.YL, "moveStats", statsExample);

/**
 * Get equipped pet through tab widget, menu, or chat.
 */
let petWidget = false;
registerWhen(register("step", () => {
    if (!World.isLoaded()) return;
    const tabNames = TabList.getNames();
    const petIndex = tabNames.findIndex(tab => tab === "§r§e§lPet:§r");
    if (petIndex !== -1) {
        petWidget = true;
        data.pet = tabNames[petIndex + 1].substring(3);

        const petXP = tabNames[petIndex + 2].split(' ')[1];
        if (petXP != "§r§b§lMAX") data.pet += `\n   ${petXP} XP`;
    } else petWidget = false;
}).setFps(1), () => settings.statsDisplay && toggles.petDisplay);

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
    if (!petWidget) data.pet = pet.substring(pet.indexOf(']') + 2);
}).setCriteria("&cAutopet &eequipped your ${pet}&e! &a&lVIEW RULE&r");
register("chat", (pet) => {
    if (!petWidget) data.pet = pet;
}).setCriteria("&r&aYou summoned your ${pet}&r&a!&r");

// Check for Montezuma
let lastPet = data.pet;
const revertPet = register("worldUnload", () => {
    data.pet = lastPet;
    revertPet.unregister();
}).unregister();
register("chat", () => {
    const mont = TabList.getNames().find(name => name.startsWith("§r Montezuma:"));
    if (mont !== undefined) {
        lastPet = data.pet;
        data.pet = (mont[18] >= 6 ? DARK_PURPLE : DARK_BLUE) + "Montezuma";
        revertPet.register();
    }
}).setCriteria("  RIFT INSTABILITY WARNING");

/**
 * Tab stats
 */
const stats = [];
registerWhen(register("step", () => {
    if (!World.isLoaded()) return;
    let tab = TabList?.getNames();
    if (tab === undefined) return;
    stats.length = 0;

    let index = tab.findIndex(line => line.startsWith("§r§e§lStats:")) + 1;
    if (index === 0) return;
    let stat = tab[index];

    while (stat.startsWith("§r ")) {
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
}).setDelay(5);

/**
 * Count daily playtime
 */
register("step", () => {
    if (!World.isLoaded()) return;

    const today = new Date().getDate();
    if (data.lastDay !== today) {
        data.playtime = 0;
        data.lastDay = today;
    }

    data.playtime++;
}).setFps(1);

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
        stats.forEach(stat => statsOverlay.message += `${GRAY}-${stat}\n` );
    }

    // Legion
    if (toggles.legionDisplay) {
        const player = Player.asPlayerMP();
        const legionCount = World.getAllEntitiesOfType(PLAYER_CLASS).filter(other => isPlayer(other) && player.distanceTo(other) < 30).length;
        const legionPercent = Math.round(Math.min(1, legionCount / 20) * 100);
        const legionColor = legionCount > 16 ? GREEN :
            legionCount > 12 ? DARK_GREEN :
            legionCount > 8 ? YELLOW :
            legionCount > 4 ? GOLD :
            legionColor > 0 ? RED : DARK_RED;
        statsOverlay.message += `${DARK_AQUA + BOLD}Legion: ${legionColor + legionCount + DARK_GRAY} (${legionPercent}%)\n`;
    }

    // Soulflow
    if (toggles.soulflowDisplay) {
        const soulflowColor = soulflow > 100_000 ? GREEN :
            soulflow > 75_000 ? DARK_GREEN :
            soulflow > 50_000 ? YELLOW :
            soulflow > 25_000 ? GOLD : 
            soulflow > 10_000 ? RED : DARK_RED;
        
        statsOverlay.message += `${DARK_AQUA + BOLD}SF: ${soulflowColor + formatNumber(soulflow) + AQUA} ⸎\n`;
    }

    // Playtime
    if (toggles.trackPlaytime) {
        const ptColor = data.playtime < 3_600 ? GREEN :
            data.playtime < 7_200 ? DARK_GREEN :
            data.playtime < 10_800 ? YELLOW :
            data.playtime < 18_000 ? GOLD : 
            data.playtime < 28_800 ? RED : DARK_RED;
        
            statsOverlay.message += `${DARK_AQUA + BOLD}Daily PT: ${ptColor + getTime(data.playtime)}`;
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
            stats.forEach(stat => ChatLib.chat(`${GRAY}-${stat}`) );
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
        case "playtime":
        case "pt":
            const ptColor = data.playtime < 3_600 ? GREEN :
                data.playtime < 7_200 ? DARK_GREEN :
                data.playtime < 10_800 ? YELLOW :
                data.playtime < 18_000 ? GOLD : 
                data.playtime < 28_800 ? RED : DARK_RED;
            
            ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}Daily Playtime: ${ptColor + getTime(data.playtime)}`);
            break;
        case "legion":
            const player = Player.asPlayerMP();
            const legionCount = World.getAllEntitiesOfType(PLAYER_CLASS).filter(other => other.getEntity().func_110143_aJ() !== 20 && player.distanceTo(other) < 30).length - 1;
            const legionPercent = Math.min(1, legionCount / 20).toFixed(2) * 100;
            const legionColor = legionCount > 16 ? GREEN :
                legionCount > 12 ? DARK_GREEN :
                legionCount > 8 ? YELLOW :
                legionCount > 4 ? GOLD :
                legionColor > 0 ? RED : DARK_RED;
            ChatLib.chat(`${DARK_AQUA + BOLD}Legion: ${legionColor + legionCount + DARK_GRAY} (${legionPercent}%)`);
            break;
    }
}
