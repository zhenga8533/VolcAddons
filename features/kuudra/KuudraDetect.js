import settings from "../../utils/settings";
import { CUBE_CLASS } from "../../utils/constants";
import { formatNumber } from "../../utils/functions/format";
import { registerWhen } from "../../utils/variables";
import { getTier, getWorld } from "../../utils/worlds";


/**
 * Variables used to track and display Kuudra HP and entity.
 */
let cubes = undefined;
let percentHP = new Text(`One Cycleable`, Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`One Cycleable`) / 2, 10);
let HPDisplay = ["100k/100k ❤", 0, 0, 0];
let currentHP = 0;
export function getKuudraHP() { return currentHP };

/**
 * Tracks Kuudra's HP and spawn location if entering phase 4.
 */
registerWhen(register("tick", () => {
    cubes = World.getAllEntitiesOfType(CUBE_CLASS);

    // Find Kuudra based off size and HP
    const kuudra = cubes.find((cube) => cube.getWidth().toFixed(1) == 15.3 && cube.getEntity().func_110143_aJ() <= 100_000);
    if (kuudra !== undefined) {
        currentHP = kuudra.getEntity().func_110143_aJ().toFixed(0);
        
        if (settings.kuudraHP) {
            // Tesselator Display
            const color = currentHP > 99_000 ? "§a" :
                currentHP > 75_000 ? "§2" :
                currentHP > 50_000 ? "§e" :
                currentHP > 25_000 ? "§6" :
                currentHP > 10_000 ? "§c" : "§4";
            HPDisplay = [`${color + formatNumber(currentHP)}§7/§a100k §c❤`, kuudra.getX(), kuudra.getY(), kuudra.getZ()];
            
            // Boss Health Bar Percentage
            const percent = `${(currentHP / 100_000 * 100).toFixed(2)}%`;
            percentHP = new Text(percent, Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(percent) / 2, 10);
        }

        // KUUDRA SPAWN DETECT
        if (settings.kuudraSpawn && getTier() === 5 && currentHP <= 25_000 && currentHP > 24_900) {
            x = kuudra.getX();
            z = kuudra.getZ();

            if (x < -128) Client.showTitle("§c§lRIGHT!", "", 0, 25, 5);
            else if (z > -84) Client.showTitle("§2§lFRONT!", "", 0, 25, 5);
            else if (x > -72) Client.showTitle("§a§lLEFT!", "", 0, 25, 5);
            else if (z < -132) Client.showTitle("§4§lBACK!", "", 0, 25, 5);
        }
    } else HPDisplay = ["100k/100k ❤", 0, 0, 0];
}), () => getWorld() === "Kuudra" && (settings.kuudraHP || settings.kuudraSpawn));

/**
 * Cancel health rendering when announcing direction
 */
const DIRECTIONS = new Set(["§c§lRIGHT!", "§2§lFRONT!", "§a§lLEFT!", "§4§lBACK!"]);
registerWhen(register("renderTitle", (title, _, event) => {
    if (currentHP > 25_000 || currentHP <= 24_900 || DIRECTIONS.has(title)) return;

    cancel(event);
}), () => getWorld() === "Kuudra" && settings.kuudraSpawn);

/**
 * Renders Kuudra's percent HP.
 */
registerWhen(register('renderOverlay', () => {
    percentHP.draw();
}), () => getWorld() === "Kuudra" && settings.kuudraHP);

/**
 * Draws Kuudra HP onto its physical body.
 */
registerWhen(register('renderWorld', () => {
    if (HPDisplay[1]) Tessellator.drawString(HPDisplay[0], HPDisplay[1], HPDisplay[2] + 10, HPDisplay[3], 0xA7171A, true, 0.25, false);
}), () => getWorld() === "Kuudra" && settings.kuudraHP);

/**
 * Reset Kuudra's UUID on world exit.
 */
register('worldUnload', () => {
    percentHP = new Text(`One Cycleable`, Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`One Cycleable`) / 2, 10);
    HPDisplay = ["100k/100k ❤", 0, 0, 0];
});
