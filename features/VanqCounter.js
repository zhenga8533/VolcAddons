import settings from "../settings";
import { data, getWorld } from "../utils/variables";
import { BOLD, GUI_INSTRUCT, ITALIC, RED, RESET } from "../utils/constants";
import { renderScale } from "../utils/functions";

let items = {};
const session = {
    "vanqs": 0,
    "kills": 0,
    "last": 0,
    "average": 0,
};

const moveCounter = new Gui();


// Tracks Kills
register ("entityDeath", () => {
    if (getWorld() != "crimson isle" || !settings.vanqCounter || Player.getHeldItem() == null) return;

    heldItem = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");
    newKills = Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getInteger("stats_book");

    if (heldItem in items) {
        killsDiff = Math.abs(newKills - items[heldItem]);

        if (killsDiff > 10) items[heldItem] = newKills; // In order for mobs in other islands to not count
        else {
            // Overall
            data.vanqSession.kills += killsDiff;
            data.vanqSession.last += killsDiff;
            if (data.vanqSession.vanqs) data.vanqSession.average = Math.round(data.vanqSession.kills / data.vanqSession.vanqs);

            // Session
            session.kills += killsDiff;
            session.last += killsDiff;
            if (session.vanqs) session.average = Math.round(session.kills / session.vanqs);
            items[heldItem] = newKills;
        }
    } else items[heldItem] = newKills;
});

// Tracks Vanqs
register("chat", () => {
    // Overall
    data.vanqSession.vanqs++;
    data.vanqSession.average = (data.vanqSession.kills / data.vanqSession.vanqs);
    data.vanqSession.last = 0;
    
    // Session
    session.vanqs++;
    session.average = (session.kills / session.vanqs);
    session.last = 0;
}).setCriteria("A Vanquisher is spawning nearby!");

// Move and Draw Counter HUD
let renderX = data.CL[0]/data.CL[2];
let renderY = data.CL[1]/data.CL[2];

register("renderOverlay", () => {
    // Adjusts split location
    if (moveCounter.isOpen()) {
        renderScale(
            data.CL[2], `${ITALIC}x: ${Math.round(data.CL[0])}, y: ${Math.round(data.CL[1])}, s: ${data.CL[2].toFixed(2)}`,
            renderX, renderY - 10
        );

        renderScale(data.CL[2], `${RED}${BOLD}Total Vanqs: ${RESET}Wo`, renderX, renderY);
        renderScale(data.CL[2], `${RED}${BOLD}Total Kills: ${RESET}Cao`, renderX, renderY + 10);
        renderScale(data.CL[2], `${RED}${BOLD}Kills Since: ${RESET}Ni`, renderX, renderY + 20);
        renderScale(data.CL[2], `${RED}${BOLD}Average Kills: ${RESET}Ma`, renderX, renderY + 30);

        // GUI Instructions
        renderScale(
            1.2, GUI_INSTRUCT,
            Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(GUI_INSTRUCT) / 1.2,
            Renderer.screen.getHeight() / 2.4,
        );
    } else {
        if (getWorld() != "crimson isle" || !settings.vanqCounter) return;

        if (settings.vanqCounter == 1) {
            renderScale(data.CL[2], `${RED}${BOLD}Total Vanqs: ${RESET}${data.vanqSession.vanqs}`, renderX, renderY);
            renderScale(data.CL[2], `${RED}${BOLD}Total Kills: ${RESET}${data.vanqSession.kills}`, renderX, renderY + 10);
            renderScale(data.CL[2], `${RED}${BOLD}Kills Since: ${RESET}${data.vanqSession.last}`, renderX, renderY + 20);
            renderScale(data.CL[2], `${RED}${BOLD}Average Kills: ${RESET}${data.vanqSession.average}`, renderX, renderY + 30);
        } else {
            renderScale(data.CL[2], `${RED}${BOLD}Total Vanqs: ${RESET}${session.vanqs}`, renderX, renderY);
            renderScale(data.CL[2], `${RED}${BOLD}Total Kills: ${RESET}${session.kills}`, renderX, renderY + 10);
            renderScale(data.CL[2], `${RED}${BOLD}Kills Since: ${RESET}${session.last}`, renderX, renderY + 20);
            renderScale(data.CL[2], `${RED}${BOLD}Average Kills: ${RESET}${session.average}`, renderX, renderY + 30);
        }
    }
})

register("dragged", (dx, dy, x, y) => {
    if (!moveCounter.isOpen()) return;

    data.CL[0] = parseInt(x);
    data.CL[1] = parseInt(y);
    renderX = data.CL[0]/data.CL[2];
    renderY = data.CL[1]/data.CL[2];
});

register("guiKey", (char, keyCode, gui, event) => {
    if (!moveCounter.isOpen()) return;
    
    // Set or reset scale of text and repositions x/y to match
    if (keyCode == 13) {
        data.CL[2] += 0.05;
        renderX = data.CL[0]/data.CL[2];
        renderY = data.CL[1]/data.CL[2];
    } else if (keyCode == 12) {
        data.CL[2] -= 0.05;
        renderX = data.CL[0]/data.CL[2];
        renderY = data.CL[1]/data.CL[2];
    } else if (keyCode == 19) {
        data.CL[2] = 1;
        renderX = data.CL[0];
        renderY = data.CL[1];
    }
});

register("command", () => {
    moveCounter.open()
}).setName("moveCounter");

// Clear Counter
register("command", () => {
    data.vanqSession = {
        "vanqs": 0,
        "kills": 0,
        "last": 0,
        "average": 0,
    };
}).setName("clearCounter");