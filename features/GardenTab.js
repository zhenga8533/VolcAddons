import settings from "../settings";
import { data, getWorld } from "../utils/variables";
import { AQUA, BOLD, DARK_RED, GREEN, GUI_INSTRUCT, ITALIC, RESET, WHITE } from "../utils/constants";
import { renderScale } from "../utils/functions";

// Visitor Tablist Variables
let tablist = null;
let visitorsHUD = [];
let visitors = 0;

// HUD GUI
const moveVisitors = new Gui();

// Check Tab
register("step", () => {
    if (getWorld() != "garden") return;

    tablist = TabList.getNames();

    // Get Composter
    if (settings.gardenCompost) {
        composter = tablist.findIndex((tab) => tab.indexOf("INACTIVE") != -1);
        if (composter != -1)
            Client.Companion.showTitle(`${DARK_RED}${BOLD}COMPOSTER INACTIVE`, "", 0, 25, 5);
    }

    if (!settings.gardenTab) return;
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
const example = ["Never", "Gonna", "Give", "You", "Up"];
let renderX = data.VL[0]/data.VL[2];
let renderY = data.VL[1]/data.VL[2];

register("renderOverlay", () => {
    // Adjusts split location
    if (moveVisitors.isOpen()) {
        // Coords and scale
        renderScale(
            data.VL[2],
            `${ITALIC}x: ${Math.round(data.VL[0])}, y: ${Math.round(data.VL[1])}, s: ${data.VL[2].toFixed(2)}`,
            renderX, renderY - 10
        );
        
        // Draw example text
        renderScale(data.VL[2], `${AQUA}${BOLD}Visitors ${WHITE}(5):`, renderX, renderY);
        
        yDiff = 10;
        example.forEach(str => {
            renderScale(data.VL[2], `${GREEN}${BOLD} ${str}`, renderX, renderY + yDiff);
            yDiff += 10;
        });
        
        // GUI Instructions
        renderScale(
            1.2, GUI_INSTRUCT,
            Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(GUI_INSTRUCT) / 1.2,
            Renderer.screen.getHeight() / 2.4,
        );
    } else {
        if (getWorld() != "garden" || !settings.gardenTab) return;

        // Draws Visitors on Screen
        yDiff = 0;
        visitorsHUD.forEach((visitor) => {
            renderScale(data.VL[2], visitor, renderX, renderY + yDiff);
            yDiff += 10;
        });
    }
})

// Move HUD
register("dragged", (dx, dy, x, y) => {
    if (!moveVisitors.isOpen()) return;

    // Changes location of text
    data.VL[0] = parseInt(x);
    data.VL[1] = parseInt(y);
    renderX = data.VL[0]/data.VL[2];
    renderY = data.VL[1]/data.VL[2];
});

register("guiKey", (char, keyCode, gui, event) => {
    if (!moveVisitors.isOpen()) return;
    
    // Set or reset scale of text and repositions x/y to match
    if (keyCode == 13) {
        data.VL[2] += 0.05;
        renderX = data.VL[0]/data.VL[2];
        renderY = data.VL[1]/data.VL[2];
    } else if (keyCode == 12) {
        data.VL[2] -= 0.05;
        renderX = data.VL[0]/data.VL[2];
        renderY = data.VL[1]/data.VL[2];
    } else if (keyCode == 19) {
        data.VL[2] = 1;
        renderX = data.VL[0];
        renderY = data.VL[1];
    }
});

register("command", () => {
    moveVisitors.open()
}).setName("moveVisitors");