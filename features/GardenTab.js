import settings from "../settings";
import { data, getWorld } from "../variables";
import { AQUA, BOLD, DARK_RED, GREEN, ITALIC, RESET, WHITE } from "../constants";

// Visitor Tablist Variables
let tablist = null;
let visitorsHUD = [];
let visitors = 0;

// HUD GUI
const moveVisitors = new Gui();

// Check Tab
register("step", () => {
    // Get Composter
    if (getWorld() == "garden" && settings.gardenCompost) {
        tablist = TabList.getNames();
        composter = tablist.findIndex((tab) => tab.indexOf("INACTIVE") != -1);
        if (composter != -1)
            Client.Companion.showTitle(`${DARK_RED}${BOLD}COMPOSTER INACTIVE`, "", 0, 25, 5);
    }

    if (getWorld() != "garden" || !settings.gardenTab) return;
    // Get tab and clear old data
    visitorsHUD = [];

    // Get Visitors
    visitors = tablist.findIndex((tab) => tab.indexOf("Visitors:") != -1);

    if (visitors != -1) {
        count = parseInt(tablist[visitors].removeFormatting().substring(11, 12)) + 1;
        for (count; count >= 0; count--) visitorsHUD.unshift(tablist[visitors + count]);
    } else {
        visitorsHUD.push(`${AQUA}${BOLD}Visitors: ${RESET}(0)`);
        visitorsHUD.push('');
    }

    // Set Next Visitor
    visitorsHUD.push(tablist.find((tab) => tab.indexOf("Next Visitor:") != -1));
}).setFps(1);

// Move and Draw Counter HUD
register("renderOverlay", () => {
    // Adjusts split location
    if (moveVisitors.isOpen()) {
        Renderer.drawStringWithShadow(`${ITALIC}x: ${Math.round(data.VL[0])}, y: ${Math.round(data.VL[1])}`, data.VL[0], data.VL[1] - 10);
        
        Renderer.drawString(`${AQUA}${BOLD}Visitors ${WHITE}(5):`, data.VL[0], data.VL[1]);
        Renderer.drawString(`${GREEN}${BOLD} Never`, data.VL[0], data.VL[1] + 10);
        Renderer.drawString(`${GREEN}${BOLD} Gonna`, data.VL[0], data.VL[1] + 20);
        Renderer.drawString(`${GREEN}${BOLD} Give`, data.VL[0], data.VL[1] + 30);
        Renderer.drawString(`${GREEN}${BOLD} You`, data.VL[0], data.VL[1] + 40);
        Renderer.drawString(`${GREEN}${BOLD} Up`, data.VL[0], data.VL[1] + 50);
    } else {
        if (getWorld() != "garden" || !settings.gardenTab) return;

        // Draws Visitors on Screen
        yDiff = 0;
        visitorsHUD.forEach((visitor) => {
            Renderer.drawString(visitor, data.VL[0], data.VL[1] + yDiff);
            yDiff += 10;
        });
    }
})

// Move HUD
register("dragged", (dx, dy, x, y) => {
    if (!moveVisitors.isOpen()) return;

    data.VL[0] = parseInt(x);
    data.VL[1] = parseInt(y);
});

register("command", () => {
    moveVisitors.open()
}).setName("moveVisitors");