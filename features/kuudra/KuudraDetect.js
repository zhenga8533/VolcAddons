import { BOLD, DARK_GREEN, DARK_RED, GREEN, RED } from "../../utils/constants";
import settings from "../../settings";
import { getTier, getWorld, registerWhen } from "../../utils/variables";

// Magma Cube Variables
const EntityMagmaCube = Java.type('net.minecraft.entity.monster.EntityMagmaCube');
let cubes = World.getAllEntitiesOfType(EntityMagmaCube.class);

// HP Displays
let percentHP = new Text(`One Cycleable`, Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`One Cycleable`) / 2, 10);
let HPDisplay = ["100,000/100,0000 ❤", 0, 0, 0];
let currentHP = 0;
export function getKuudraHP() { return currentHP };

registerWhen(register("tick", () => {
    cubes = World.getAllEntitiesOfType(EntityMagmaCube.class);

    // Find Kuudra based off size and HP
    kuudra = cubes.find((cube) => cube.getWidth().toFixed(0) == 15 && cube.getEntity().func_110143_aJ() <= 100000);
    if (kuudra != undefined) {
        currentHP = kuudra.getEntity().func_110143_aJ().toFixed(0);

        if (settings.kuudraHP) {
            // Tesselator Display
            HPDisplay = [`${currentHP.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/100,000 ❤`, kuudra.getX(), kuudra.getY(), kuudra.getZ()];
            
            // Boss Health Bar Percentage
            const percent = `${(currentHP / 100000 * 100).toFixed(2)}%`;
            percentHP = new Text(percent, Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(percent) / 2, 10);
        }

        // KUUDRA SPAWN DETECT
        if (settings.kuudraSpawn && getTier() == 5 && currentHP <= 25000 && currentHP > 24900) {
            x = kuudra.getX();
            z = kuudra.getZ();

            if (x < -128)
                Client.Companion.showTitle(`${RED}${BOLD}RIGHT!`, "", 0, 25, 5);
            else if (z > -84)
                Client.Companion.showTitle(`${DARK_GREEN}${BOLD}FRONT!`, "", 0, 25, 5);
            else if (x > -72)
                Client.Companion.showTitle(`${GREEN}${BOLD}LEFT!`, "", 0, 25, 5);
            else if (z < -132)
                Client.Companion.showTitle(`${DARK_RED}${BOLD}BACK!`, "", 0, 25, 5);
        }
    } else
        HPDisplay = ["100,000/100,0000 ❤", 0, 0, 0];
}), () => getWorld() == "kuudra" && (settings.kuudraHP || settings.kuudraSpawn));

// Render Percent HP
registerWhen(register('renderOverlay', () => {
    percentHP.draw();
}), () => getWorld() == "kuudra" && settings.kuudraHP);

// Render Tesselator HP
registerWhen(register('renderWorld', () => {
    if (HPDisplay[1]) Tessellator.drawString(HPDisplay[0], HPDisplay[1], HPDisplay[2] + 10, HPDisplay[3], 0xA7171A, true, 0.25, false);
}), () => getWorld() == "kuudra" && settings.kuudraHP);

// Reset Kuudra UUID
register('worldUnload', () => {
    percentHP = new Text(`One Cycleable`, Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`One Cycleable`) / 2, 10);
    HPDisplay = ["100,000/100,0000 ❤", 0, 0, 0];
});
