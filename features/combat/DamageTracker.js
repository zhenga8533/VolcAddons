import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";
import settings from "../../utils/settings";


/**
 * Variable used to track all damage ticks around the player.
 */
const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand");
const damaged = [];

/**
 * Tracks any instance of damage around the player and displays it in chat.
 */

registerWhen(register("step", () => {
    const player = Player.asPlayerMP().getEntity();
    const stands = World.getWorld()
        .func_72839_b(player, player.func_174813_aQ().func_72314_b(16, 16, 16))
        .filter(entity => entity instanceof EntityArmorStand);
    const damage = stands.filter(stand => {
        const name = stand.func_95999_t();
        return name.startsWith("§f✧") || 
            name.startsWith("§f✯") ||
            (name.startsWith("§7") && !isNaN(name.removeFormatting().replace(/,/g, '')));
    });

    damage.forEach(num => {
      const dmg = num.func_95999_t();
      if (!damaged.includes(dmg)) {
        ChatLib.chat(dmg);
        damaged.push(dmg);
        delay(() => damaged.shift(), 1000);
      }
    });
}).setFps(2), () => settings.damageTracker === true);
