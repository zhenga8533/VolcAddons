import { ITALIC } from "../../utils/constants";
import { getSlotCoords } from "../../utils/functions";
import { data } from "../../utils/variables";


// Search bar parameters
const loc = data.XL;
const GuiTextField = Java.type("net.minecraft.client.gui.GuiTextField");
const searchbar = new GuiTextField(0, Client.getMinecraft().field_71466_p, loc[0], loc[1], 192, 16);

// Finds items to highlight based on user search
const indexes = [];
function getHighlights() {
    indexes.length = 0;
    const text = searchbar.func_146179_b().replace(/[^a-zA-Z0-9&|]/g, "").toLowerCase();
    if (text.length === 0) return;

    const contents = text.split('||').map(ors => ors.split('&&'));
    Player.getContainer().getItems().forEach((item, index) => {
        if (item === null) return;
        const name = item.getName().removeFormatting().replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const lore = item.getLore().join('').replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        
        let toAdd = contents.length;
        contents.forEach(content => {
            for (let cont of content) {
                if (!name.includes(cont) && !lore.includes(cont)) {
                    toAdd--;
                    break;
                }
            }
        });
        if (toAdd !== 0) indexes.push(index);
    });
}

// Render item highlights and search bar
register("guiRender", (x, y, gui) => {
    if (!gui.class.getName().startsWith("net.minecraft.client.gui.inventory.")) return;
    searchbar.func_146194_f();

    const containerType = Player.getContainer().getClassName();
    indexes.forEach(index => {
        const [x, y] = getSlotCoords(index, containerType);
    
        Renderer.translate(0, 0, 100);
        Renderer.drawRect(Renderer.color(255, 255, 255, 255), x, y, 16, 16);
    });
});

/**
 * Stuff to move searchbox
 */
const gui = new Gui();
const renderOverlay = register("renderOverlay", () => {
    if (!gui.isOpen()) return;
    Renderer.drawString(`${ITALIC}x: ${Math.round(loc[0])}, y: ${Math.round(loc[1])}`, loc[0] + 2, loc[1] - 10);
    Renderer.drawLine(Renderer.WHITE, loc[0], 1, loc[0], Renderer.screen.getHeight(), 0.5);
    Renderer.drawLine(Renderer.WHITE, Renderer.screen.getWidth(), loc[1], 1, loc[1], 0.5);
    searchbar.func_146194_f();
}).unregister();

// Render searchbox when moving
register("command", () => {
    renderOverlay.register();
    gui.open();
}).setName("moveSearchbox", true).setAliases("moveSearch");

// Moving searchbox
register("guiMouseDrag", (x, y) => {
    if (!gui.isOpen()) return;

    loc[0] = x;
    loc[1] = y;
    searchbar.field_146209_f = x;
    searchbar.field_146210_g = y;
});

// Detect mouse click on box
register("guiMouseClick", (x, y, button) => {
    searchbar.func_146192_a(x, y, button);
    Client.scheduleTask(1, () => getHighlights());
});

// Searchbox key detects
register("guiKey", (char, keyCode, _, event) => {
    if (!searchbar.func_146206_l()) return;

    searchbar.func_146201_a(char, keyCode);
    getHighlights();
    if (keyCode != 1) cancel(event);  // Cancel all but escape key
});

// Reset search when opening gui
register("guiOpened", () => {
    Client.scheduleTask(1, () => getHighlights());
});

// Exit search when closing gui
register("guiClosed", () => {
    if (gui.isOpen()) renderOverlay.unregister();
    searchbar.func_146195_b(false);
    indexes.length = 0;
});
