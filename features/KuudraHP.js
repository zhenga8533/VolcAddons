import settings from "../settings";
import { getWorld } from "../variables";

// Magma Cube Variables
const EntityMagmaCube = Java.type('net.minecraft.entity.monster.EntityMagmaCube');
let cubes = World.getAllEntitiesOfType(EntityMagmaCube.class);

// HP Displays
let percentHP = new Text(`One Cycleable`, Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`One Cycleable`) / 2, 10);
let HPDisplay = ["100,000/100,0000 ❤", 0, 0, 0];

register("tick", () => {
    if ((getWorld() != "kuudra t5" && getWorld() != "kuudra f4") || !settings.kuudraHP) return;

    cubes = World.getAllEntitiesOfType(EntityMagmaCube.class);

    // Find Kuudra based off size and HP
    kuudra = cubes.find((cube) => cube.getWidth().toFixed(0) == 15 && cube.getEntity().func_110143_aJ() <= 100000);
    if (kuudra != undefined) {
        currentHP = kuudra.getEntity().func_110143_aJ().toFixed(0);

        // Tesselator Display
        HPDisplay = [`${currentHP.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/100,000 ❤`, kuudra.getX(), kuudra.getY(), kuudra.getZ()];
        
        // Boss Health Bar Percentage
        const percent = `${(currentHP / 100000 * 100).toFixed(2)}%`;
        percentHP = new Text(percent, Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(percent) / 2, 10);
    } else
        HPDisplay = ["100,000/100,0000 ❤", 0, 0, 0];
});

// Render Percent HP
register('renderOverlay', () => {
    if ((getWorld() != "kuudra t5" && getWorld() != "kuudra f4") || !settings.kuudraHP) return;

    percentHP.draw();
});

// Render Tesselator HP
register('renderWorld', () => {
    if ((getWorld() != "kuudra t5" && getWorld() != "kuudra f4") || !settings.kuudraHP) return;

    if (HPDisplay[1]) Tessellator.drawString(HPDisplay[0], HPDisplay[1], HPDisplay[2] + 10, HPDisplay[3], 0xA7171A, true, 0.25, false);
});

// Reset Kuudra UUID
register('worldUnload', () => {
    percentHP = new Text(`Ligma Balls`, Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`Ligma Balls`) / 2, 10);
    HPDisplay = ["100,000/100,0000 ❤", 0, 0, 0];
});