import { data, getWorld } from "../utils/variables";
import settings from "../settings"
import { BOLD, GREEN, GUI_INSTRUCT, ITALIC, RED, RESET } from "../utils/constants";
import { renderScale } from "../utils/functions";

const moveTimer = new Gui();
let align = 0;

// Detect Cells Alignment
register("chat", () => {
    align = 6.0;
}).setCriteria("You aligned ${message}");

register("chat", () => {
    align = 6.0;
}).setCriteria("${player} casted Cells Alignment on you!");

register("tick", () => {
    if (align != 0)
        align = (align - 0.05).toFixed(2);
})

// Move and Draw Timer HUD
let renderX = data.GL[0]/data.GL[2];
let renderY = data.GL[1]/data.GL[2];

register("renderOverlay", () => {
    if (moveTimer.isOpen()) {
        renderScale(
            data.GL[2], `${ITALIC}x: ${Math.round(data.GL[0])}, y: ${Math.round(data.GL[1])}, s: ${data.VL[2].toFixed(2)}`,
            renderX, renderY - 10
        );
        renderScale(data.GL[2], `${GREEN}${BOLD}Align Timer: ${RESET}LEAK?!`, renderX, renderY);
        
        // GUI Instructions
        renderScale(
            1.2, GUI_INSTRUCT,
            Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(GUI_INSTRUCT) / 1.2,
            Renderer.screen.getHeight() / 2.4,
        );
    } else if (getWorld() == "kuudra t5") {
        if (!settings.gyroTimer) return;
        
        if (align)
            renderScale(data.GL[2], `${GREEN}${BOLD}Align Timer: ${RESET}${align}s`, renderX, renderY);
        else
            renderScale(data.GL[2], `${GREEN}${BOLD}Align Timer: ${RED}NO ALIGN`, renderX, renderY);
    }
})

register("dragged", (dx, dy, x, y) => {
    if (!moveTimer.isOpen()) return;

    data.GL[0] = parseInt(x);
    data.GL[1] = parseInt(y);
    renderX = data.GL[0]/data.GL[2];
    renderY = data.GL[1]/data.GL[2];
});

register("guiKey", (char, keyCode, gui, event) => {
    if (!moveTimer.isOpen()) return;
    
    // Set or reset scale of text and repositions x/y to match
    if (keyCode == 13) {
        data.GL[2] += 0.05;
        renderX = data.GL[0]/data.GL[2];
        renderY = data.GL[1]/data.GL[2];
    } else if (keyCode == 12) {
        data.GL[2] -= 0.05;
        renderX = data.GL[0]/data.GL[2];
        renderY = data.GL[1]/data.GL[2];
    } else if (keyCode == 19) {
        data.GL[2] = 1;
        renderX = data.GL[0];
        renderY = data.GL[1];
    }
});

register("command", () => {
    moveTimer.open();
}).setName("moveAlignTimer");