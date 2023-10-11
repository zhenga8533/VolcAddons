import settings from "../../utils/settings";
import { BOLD, DARK_RED, GRAY, RED, RESET } from "../../utils/constants";
import { Overlay } from "../../utils/overlay";
import { data, getPaused, registerWhen } from "../../utils/variables";
import { formatNumber, getTime } from "../../utils/functions";


/**
 * Variables used to track and display item and vanquisher kill counts.
 */
const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand");
let mobs = {};
let items = {};
let total = 0;
let time = 0;
const counterExample =
`${RED + BOLD}Graveyard Zombie: ${RESET}this
${RED + BOLD}Zombie Villager: ${RESET}game
${RED + BOLD}...: ${RESET}is
${DARK_RED + BOLD}Time Passed: ${RESET}dead`;
const counterOverlay = new Overlay("killCounter", ["all"], () => true, data.JL, "moveKills", counterExample);
counterOverlay.message = "";

function resetCounter() {
    mobs = {}
    total = 0;
    time = 0;
    counterOverlay.message = "";
}

function updateCounter() {
    counterOverlay.message = "";
    for (let mob in mobs)
        counterOverlay.message += `${RED + BOLD + mob}: ${RESET + formatNumber(mobs[mob]) + GRAY} (${formatNumber(mobs[mob]/time*3600)}/hr)\n`;
    counterOverlay.message += `\n${DARK_RED + BOLD}Total Kills: ${RESET + formatNumber(total)}`;
    counterOverlay.message += `\n${DARK_RED + BOLD}Time Passed: ${RESET + getTime(time)}`;
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

        if (!(heldItem in items)) {
            items[heldItem] = newKills;
            return;
        }

        const killsDiff = Math.abs(newKills - items[heldItem]);
        if (killsDiff === 0) return;

        // Update mob kill counter
        death = death.getEntity();
        World.getWorld().func_72839_b(death, death.func_174813_aQ().func_72314_b(0.5, 1, 0.5)).filter(entity => 
            entity instanceof EntityArmorStand
        ).forEach(entity => {
            const registry = Player.getHeldItem().getRegistryName();
            const title = entity?.func_95999_t()?.removeFormatting();

            if (title.endsWith("❤") && (registry.endsWith("hoe") || registry.endsWith("bow") || Player.asPlayerMP().distanceTo(death) <= 16)) {
                const name = title.split(' ').slice(1, -1).join(' ');
                if (name in mobs) mobs[name]++;
                else mobs[name] = 1;
                total++;
                items[heldItem]++;
                updateCounter();
            }
        });
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
