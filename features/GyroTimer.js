import { data, getWorld } from "../utils/variables";
import settings from "../settings"
import { BOLD, GREEN, ITALIC, RED, RESET } from "../utils/constants";

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
register("renderOverlay", () => {
    if (moveTimer.isOpen()) {
        Renderer.drawStringWithShadow(`${ITALIC}x: ${Math.round(data.GL[0])}, y: ${Math.round(data.GL[1])}`, data.GL[0], data.GL[1] - 10);
        Renderer.drawString(`${GREEN}${BOLD}Align Timer: ${RESET}LEAK?!`, data.GL[0], data.GL[1]);
    } else if (getWorld() == "kuudra t5") {
        if (!settings.gyroTimer) return;
        
        if (align)
            Renderer.drawString(`${GREEN}${BOLD}Align Timer: ${RESET}${align}s`, data.GL[0], data.GL[1]);
        else
            Renderer.drawString(`${GREEN}${BOLD}Align Timer: ${RED}NO ALIGN`, data.GL[0], data.GL[1]);
    }
})

register("dragged", (dx, dy, x, y) => {
    if (!moveTimer.isOpen()) return;

    data.GL[0] = parseInt(x);
    data.GL[1] = parseInt(y);
});

register("command", () => {
    moveTimer.open();
}).setName("moveAlignTimer");