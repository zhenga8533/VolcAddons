import settings from "../settings";
import { data, getWorld } from "../utils/variables";
import { BOLD, ITALIC, RED, RESET } from "../utils/constants";

let items = {}

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
            data.vanqSession.kills += killsDiff;
            data.vanqSession.last += killsDiff;
            if (data.vanqSession.vanqs) data.vanqSession.average = Math.round(data.vanqSession.kills / data.vanqSession.vanqs);
            items[heldItem] = newKills;
        }
    } else items[heldItem] = newKills;
});

// Tracks Vanqs
register("chat", () => {
    data.vanqSession.vanqs++;
    data.vanqSession.average = (data.vanqSession.kills / data.vanqSession.vanqs);
    data.vanqSession.last = 0;
}).setCriteria("A Vanquisher is spawning nearby!");

// Move and Draw Counter HUD
register("renderOverlay", () => {
    // Adjusts split location
    if (moveCounter.isOpen()) {
        Renderer.drawStringWithShadow(`${ITALIC}x: ${Math.round(data.CL[0])}, y: ${Math.round(data.CL[1])}`, data.CL[0], data.CL[1] - 10);
        Renderer.drawString(`${RED}${BOLD}Total Vanqs: ${RESET}Wo`, data.CL[0], data.CL[1]);
        Renderer.drawString(`${RED}${BOLD}Total Kills: ${RESET}Cao`, data.CL[0], data.CL[1] + 10);
        Renderer.drawString(`${RED}${BOLD}Kills Since: ${RESET}Ni`, data.CL[0], data.CL[1] + 20);
        Renderer.drawString(`${RED}${BOLD}Average Kills: ${RESET}Ma`, data.CL[0], data.CL[1] + 30);
    } else {
        if (getWorld() != "crimson isle" || !settings.vanqCounter) return;
        Renderer.drawString(`${RED}${BOLD}Total Vanqs: ${RESET}${data.vanqSession.vanqs}`, data.CL[0], data.CL[1]);
        Renderer.drawString(`${RED}${BOLD}Total Kills: ${RESET}${data.vanqSession.kills}`, data.CL[0], data.CL[1] + 10);
        Renderer.drawString(`${RED}${BOLD}Kills Since: ${RESET}${data.vanqSession.last}`, data.CL[0], data.CL[1] + 20);
        Renderer.drawString(`${RED}${BOLD}Average Kills: ${RESET}${data.vanqSession.average}`, data.CL[0], data.CL[1] + 30);
    }
})

register("dragged", (dx, dy, x, y) => {
    if (!moveCounter.isOpen()) return;

    data.CL[0] = parseInt(x);
    data.CL[1] = parseInt(y);
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