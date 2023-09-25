import settings from "../../utils/settings";
import { BOLD, DARK_RED, GRAY, RED, RESET } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { data, getPaused, registerWhen } from "../../utils/variables";
import { getTime } from "../../utils/functions";


/**
 * Variables used to track and display item and vanquisher kill counts.
 */
const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand");
let mobs = {};
let items = {};
let time = 0;
const counterExample =
`${RED}${BOLD}Graveyard Zombie: ${RESET}this
${RED}${BOLD}Zombie Villager: ${RESET}game
${RED}${BOLD}...: ${RESET}is
${DARK_RED}${BOLD}Time Passed: ${RESET}dead`;
const counterOverlay = new Overlay("killCounter", ["all"], () => true, data.JL, "moveKills", counterExample);
counterOverlay.message = "";

function resetCounter() {
    mobs = {}
    time = 0;
    counterOverlay.message = "";
}

function updateCounter() {
    counterOverlay.message = "";
    for (let mob in mobs)
        counterOverlay.message += `${RED}${BOLD}${mob}: ${RESET}${mobs[mob]} ${GRAY}(${(mobs[mob]/time*3600).toFixed(0)}/hr)\n`;
    counterOverlay.message += `${DARK_RED}${BOLD}Time Passed: ${RESET}${getTime(time)}`;
}

/**
 * Uses the "Book of Stats" to track whenever player mobs an entity and updates the Vanquisher Overlay.
 */
registerWhen(register("entityDeath", (death) => {
    if (Player.getHeldItem() === null) return;

    Client.scheduleTask(1, () => {
        const ExtraAttributes = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes");
        const heldItem = ExtraAttributes.getString("id");
        const newKills = ExtraAttributes.getInteger("stats_book");

        if (heldItem in items) {
            const killsDiff = Math.abs(newKills - items[heldItem]);
            if (killsDiff === 0) return;
            items[heldItem] += killsDiff;

            // Update mob kill counter
            death = death.getEntity();
            World.getWorld().func_72839_b(death, death.func_174813_aQ().func_72314_b(1, 3, 1)).filter(entity => 
                entity instanceof EntityArmorStand
            ).forEach(entity => {
                const registry = Player.getHeldItem().getRegistryName();
                const match = entity?.func_95999_t()?.removeFormatting().match(/\[Lv\d+] ([\w\s]+) \d+\/\d+❤/);

                if (match !== null && (registry.endsWith("hoe") || registry.endsWith("bow") || Player.asPlayerMP().distanceTo(death) <= 16)) {
                    const mobName = match[1];
                    if (mobName in mobs) mobs[mobName] += killsDiff;
                    else mobs[mobName] = killsDiff;
                }
            });

            // Update HUD
            updateCounter();
        } else items[heldItem] = newKills;
    });
}), () => settings.killCounter);

registerWhen(register("step", () => {
    if (Object.keys(mobs).length === 0 || getPaused()) return;
    
    time++;
    updateCounter();
}).setFps(1), () => settings.vanqCounter !== 0);

/**
 * Command to reset the stats for the overall counter.
 */
register("command", resetCounter).setName("resetCounter");
register("worldUnload", resetCounter)
