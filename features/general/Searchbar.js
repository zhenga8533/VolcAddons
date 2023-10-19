import { ITALIC } from "../../utils/constants";
import { data } from "../../utils/variables";

// Search bar parameters
const loc = data.XL;
const GuiTextField = Java.type("net.minecraft.client.gui.GuiTextField");
const searchbar = new GuiTextField(0, Client.getMinecraft().field_71466_p, loc[0], loc[1], 192, 16);

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

// Draw search box
register("guiRender", () => {
    searchbar.func_146194_f();
});

// Detect mouse click on box
register("guiMouseClick", (x, y, button) => {
    searchbar.func_146192_a(x, y, button);
});

// Searchbox key detects
register("guiKey", (char, keyCode, _, event) => {
    if (!searchbar.func_146206_l()) return;

    searchbar.func_146201_a(char, keyCode);
    if (keyCode != 1) cancel(event);  // Cancel all but escape key
});

// Exit search when closing gui
register("guiClosed", () => {
    if (gui.isOpen()) renderOverlay.unregister();
    searchbar.func_146195_b(false);
});
