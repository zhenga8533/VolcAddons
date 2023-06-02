import { data, getWorld } from "../utils/variables";
import settings from "../settings"
import { BOLD, DARK_RED, GOLD, GUI_INSTRUCT, ITALIC, RESET, WHITE } from "../utils/constants";
import { getTime, renderScale } from "../utils/functions";

const moveTimer = new Gui();
let lastCast = 0;
let lastFish = 0;

register("tick", () => {
    if (!settings.goldenFishAlert) return;

    lastCast += 0.05;
    lastFish += 0.05
    if (lastCast > 180)
        lastFish = 0;
})

register("clicked", (x, y, button, state) => {
    if (getWorld() != "crimson isle" || !settings.goldenFishAlert || !button || !state || Player.getHeldItem() == null) return;

    if (Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id").includes("ROD"))
        lastCast = 0;
})

register("chat", () => {
    lastFish = 0;
}).setCriteria("You spot a Golden Fish surface from beneath the lava!");

// Move and Draw Timer HUD
let renderX = data.TL[0]/data.TL[2];
let renderY = data.TL[1]/data.TL[2];

register("renderOverlay", () => {
    if (moveTimer.isOpen()) {
        renderScale(
            data.TL[2], `${ITALIC}x: ${Math.round(data.TL[0])}, y: ${Math.round(data.TL[1])}, s: ${data.TL[2].toFixed(2)}`,
            renderX, renderY - 10
        );

        renderScale(data.TL[2], `${GOLD}${BOLD}Last Cast: ${RESET}Yee`, renderX, renderY);
        renderScale(data.TL[2], `${GOLD}${BOLD}Last Fish: ${RESET}Haw`, renderX, renderY + 10);

        // GUI Instructions
        renderScale(
            1.2, GUI_INSTRUCT,
            Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(GUI_INSTRUCT) / 1.2,
            Renderer.screen.getHeight() / 2.4,
        );
    } else {
        if (getWorld() != "crimson isle" || !settings.goldenFishAlert) return;
        const timeFish = lastCast > 180 ? 0 : lastFish;
        const lastColor = lastCast > 150 ? DARK_RED : WHITE;
        
        renderScale(data.TL[2], `${GOLD}${BOLD}Last Cast: ${lastColor}${getTime(lastCast)}`, renderX, renderY);
        renderScale(data.TL[2], `${GOLD}${BOLD}Last Fish: ${RESET}${getTime(timeFish)}`, renderX, renderY + 10);
    }
})

register("worldUnload", () => {
    lastCast = 0;
    lastFish = 0;
})

register("dragged", (dx, dy, x, y) => {
    if (!moveTimer.isOpen()) return;

    data.TL[0] = parseInt(x);
    data.TL[1] = parseInt(y);
    renderX = data.TL[0]/data.TL[2];
    renderY = data.TL[1]/data.TL[2];
});

register("guiKey", (char, keyCode, gui, event) => {
    if (!moveTimer.isOpen()) return;
    
    // Set or reset scale of text and repositions x/y to match
    if (keyCode == 13) {
        data.TL[2] += 0.05;
        renderX = data.TL[0]/data.TL[2];
        renderY = data.TL[1]/data.TL[2];
    } else if (keyCode == 12) {
        data.TL[2] -= 0.05;
        renderX = data.TL[0]/data.TL[2];
        renderY = data.TL[1]/data.TL[2];
    } else if (keyCode == 19) {
        data.TL[2] = 1;
        renderX = data.TL[0];
        renderY = data.TL[1];
    }
});

register("command", () => {
    moveTimer.open();
}).setName("moveTimer");