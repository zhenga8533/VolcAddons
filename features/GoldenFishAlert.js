import { data, getWorld } from "../utils/variables";
import settings from "../settings"
import { BOLD, DARK_RED, GOLD, ITALIC, RESET, WHITE } from "../utils/constants";
import { getTime } from "../utils/functions";

const moveTimer = new Gui();
let lastCast = Date.now();
let lastFish = Date.now();

register("clicked", (x, y, button, state) => {
    if (getWorld() != "crimson isle" || !settings.goldenFishAlert || !button || !state || Player.getHeldItem() == null) return;

    if ((Date.now() - lastCast) / 1000 > 180)
        lastFish = Date.now();
    if (Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id").includes("ROD"))
        lastCast = Date.now();
})

register("chat", () => {
    lastFish = Date.now();
}).setCriteria("You spot a Golden Fish surface from beneath the lava!");

// Move and Draw Timer HUD
register("renderOverlay", () => {
    if (moveTimer.isOpen()) {
        Renderer.drawStringWithShadow(`${ITALIC}x: ${Math.round(data.TL[0])}, y: ${Math.round(data.TL[1])}`, data.TL[0], data.TL[1] - 10);
        Renderer.drawString(`${GOLD}${BOLD}Last Cast: ${RESET}Yee`, data.TL[0], data.TL[1]);
        Renderer.drawString(`${GOLD}${BOLD}Last Fish: ${RESET}Haw`, data.TL[0], data.TL[1] + 10);
    } else {
        if (getWorld() != "crimson isle" || !settings.goldenFishAlert) return;
        const timeCast = (Date.now() - lastCast) / 1000;
        const timeFish = timeCast > 180 ? 0 : (Date.now() - lastFish) / 1000;
        const lastColor = timeCast > 150 ? DARK_RED : WHITE;
        
        Renderer.drawString(`${GOLD}${BOLD}Last Cast: ${lastColor}${getTime(timeCast)}`, data.TL[0], data.TL[1]);
        Renderer.drawString(`${GOLD}${BOLD}Last Fish: ${RESET}${getTime(timeFish)}`, data.TL[0], data.TL[1] + 10);
    }
})

register("worldUnload", () => {
    lastCast = Date.now();
    lastFish = Date.now();
})

register("dragged", (dx, dy, x, y) => {
    if (!moveTimer.isOpen()) return;

    data.TL[0] = parseInt(x);
    data.TL[1] = parseInt(y);
});

register("command", () => {
    moveTimer.open();
}).setName("moveTimer");