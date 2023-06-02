import settings from "../settings";
import { data, getWorld } from "../utils/variables";
import { AQUA, BOLD, DARK_RED, GREEN, GUI_INSTRUCT, ITALIC, RED, RESET, WHITE } from "../utils/constants";
import { getTime, renderScale } from "../utils/functions";

// Visitor Tablist Variables
let tablist = null;
let visitorsHUD = [];
let visitors = 0;
const moveVisitors = new Gui();

// Next Visitor Display
let next = 0;
const moveNext = new Gui();

register("tick", () => {
    if (next > 0)
        next = next - 0.05;
})

// Check Tab
register("step", () => {
    if (getWorld() != "garden") return;

    try {
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
        nextVisit = tablist.find((tab) => tab.indexOf("Next Visitor:") != -1);
        visitorsHUD.push(nextVisit);

        if (!nextVisit.includes("Full")) {
            nextVisit = nextVisit.removeFormatting().replace(/[^0-9. ]/g, '').trim().split(' ');

            next = nextVisit[0]
            if (nextVisit.length == 2)
                next = next * 60 + parseInt(nextVisit[1]);
        }
    } catch(err) {
        console.log(err);
    }
}).setFps(1);

// Move and Draw Counter HUD
const example = ["Never", "Gonna", "Give", "You", "Up"];
let renderVisitorX = data.VL[0]/data.VL[2];
let renderVisitorY = data.VL[1]/data.VL[2];

let renderNextX = data.NL[0]/data.NL[2];
let renderNextY = data.NL[1]/data.NL[2];

register("renderOverlay", () => {
    // Adjusts split location
    if (moveVisitors.isOpen()) {
        // Coords and scale
        renderScale(
            data.VL[2],
            `${ITALIC}x: ${Math.round(data.VL[0])}, y: ${Math.round(data.VL[1])}, s: ${data.VL[2].toFixed(2)}`,
            renderVisitorX, renderVisitorY - 10
        );
        
        // Draw example text
        renderScale(data.VL[2], `${AQUA}${BOLD}Visitors ${WHITE}(5):`, renderVisitorX, renderVisitorY);
        
        yDiff = 10;
        example.forEach(str => {
            renderScale(data.VL[2], `${GREEN}${BOLD} ${str}`, renderVisitorX, renderVisitorY + yDiff);
            yDiff += 10;
        });
        
        // GUI Instructions
        renderScale(
            1.2, GUI_INSTRUCT,
            Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(GUI_INSTRUCT) / 1.2,
            Renderer.screen.getHeight() / 2.4,
        );
    } else {
        if (getWorld() == "garden" && settings.gardenTab) {
            // Draws Visitors on Screen
            yDiff = 0;
            visitorsHUD.forEach((visitor) => {
                renderScale(data.VL[2], visitor, renderVisitorX, renderVisitorY + yDiff);
                yDiff += 10;
            });
        }
    }

    if (moveNext.isOpen()) {
        // Coords and scale
        renderScale(
            data.NL[2],
            `${ITALIC}x: ${Math.round(data.NL[0])}, y: ${Math.round(data.NL[1])}, s: ${data.NL[2].toFixed(2)}`,
            renderNextX, renderNextY - 10
        );
        
        // Draw example text
        renderScale(data.NL[2], `${AQUA}${BOLD}Next Visitor: ${RESET}REVERT GARDEN`, renderNextX, renderNextY);
        
        // GUI Instructions
        renderScale(
            1.2, GUI_INSTRUCT,
            Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(GUI_INSTRUCT) / 1.2,
            Renderer.screen.getHeight() / 2.4,
        );
    } else {
        if (getWorld() == "garden" || !settings.nextVisitor) return;

        // Draws Visitors on Screen
        const message = next > 0 ? `${AQUA}${BOLD}Next Visitor: ${RESET}${getTime(next)}` : `${AQUA}${BOLD}Next Visitor: ${RED}Shipment Received`;
        renderScale(data.NL[2], message, renderNextX, renderNextY);
    }
})

// Move HUD
register("dragged", (dx, dy, x, y) => {
    // Changes location of text
    if (moveVisitors.isOpen()) {
        data.VL[0] = parseInt(x);
        data.VL[1] = parseInt(y);
        renderVisitorX = data.VL[0]/data.VL[2];
        renderVisitorY = data.VL[1]/data.VL[2];
    } else if (moveNext.isOpen()) {
        data.NL[0] = parseInt(x);
        data.NL[1] = parseInt(y);
        renderNextX = data.NL[0]/data.NL[2];
        renderNextY = data.NL[1]/data.NL[2];
    } else return;
});

register("guiKey", (char, keyCode, gui, event) => {
    // Set or reset scale of text and repositions x/y to match
    if (moveVisitors.isOpen()) {
        if (keyCode == 13) {
            data.VL[2] += 0.05;
            renderVisitorX = data.VL[0]/data.VL[2];
            renderVisitorY = data.VL[1]/data.VL[2];
        } else if (keyCode == 12) {
            data.VL[2] -= 0.05;
            renderVisitorX = data.VL[0]/data.VL[2];
            renderVisitorY = data.VL[1]/data.VL[2];
        } else if (keyCode == 19) {
            data.VL[2] = 1;
            renderVisitorX = data.VL[0];
            renderVisitorY = data.VL[1];
        }
    } else if (moveNext.isOpen()) {
        if (keyCode == 13) {
            data.NL[2] += 0.05;
            renderNextX = data.NL[0]/data.NL[2];
            renderNextY = data.NL[1]/data.NL[2];
        } else if (keyCode == 12) {
            data.NL[2] -= 0.05;
            renderNextX = data.NL[0]/data.NL[2];
            renderNextY = data.NL[1]/data.NL[2];
        } else if (keyCode == 19) {
            data.NL[2] = 1;
            renderNextX = data.NL[0];
            renderNextY = data.NL[1];
        }
    } else return;
});

register("command", () => {
    moveVisitors.open()
}).setName("moveVisitors");

register("command", () => {
    moveNext.open()
}).setName("moveNext");
