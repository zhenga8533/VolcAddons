import { RENDERER_BLACK, RENDERER_GRAY } from "./constants";
import { data } from "./data";

data.invButtons = {};
data.chestButtons = {};

const InventoryBasic = Java.type("net.minecraft.inventory.InventoryBasic");
const GuiInventory = Java.type("net.minecraft.client.gui.inventory.GuiInventory")
const GuiChest = Java.type("net.minecraft.client.gui.inventory.GuiChest");

let buttons = {};

class Button {
    #x;
    #y;
    #clicked;
    #icon;

    constructor(x, y, clicked, icon) {
        this.#x = x;
        this.#y = y;
        this.#clicked = clicked;
        this.#icon = new Item("minecraft:" + icon);
    }

    draw() {
        Renderer.translate(0, 0, 100);
        Renderer.drawRect(RENDERER_GRAY, this.#x, this.#y, 16, 16);
        Renderer.drawLine(RENDERER_BLACK, this.#x + 16, this.#y, this.#x, this.#y, 1);
        Renderer.drawLine(RENDERER_BLACK, this.#x, this.#y + 16, this.#x, this.#y, 1);
        Renderer.drawLine(RENDERER_BLACK, this.#x, this.#y, this.#x + 16, this.#y, 1);
        Renderer.drawLine(RENDERER_BLACK, this.#x, this.#y, this.#x, this.#y + 16, 1);
        this.#icon.draw(this.#x, this.#y, 1, 102);
    }

    click(x, y) {
        if (x < this.#x || x > this.#x + 16 || y < this.#y || y > this.#y + 16) return;
        this.#clicked();
    }
}

function createButtons(start, end, interval, typeButtons, category, slots, left, top, dx, dy) {
    for (let i = start; i < end; i += interval) {
        let id = category + i;
        let slot = slots.func_75139_a(i);
        
        if (data.invButtons.hasOwnProperty(id)) {
            let button = data.invButtons[id];
            buttons[id] = new Button(button.x, button.y, () => {
                ChatLib.command(button.command)
            }, button.icon);
        } else {
            let x = left + slot.field_75223_e + dx;
            let y = top + slot.field_75221_f + dy;
            buttons[id] = new Button(x, y, () => {
                ChatLib.chat("E");
            }, "barrier");
        }
    }
}

export function editInvButtons() {
    // Open example inventory
    GuiHandler.openGui(new GuiInventory(Player.getPlayer()));

    Client.scheduleTask(1, () => {
        const gui = Client.currentGui.get();
        const top = gui.getGuiTop();
        const left = gui.getGuiLeft();
        const slots = gui.field_147002_h;

        // Set all inv edit buttons
        createButtons(1, 5, 1, data.invButtons, "crafting", slots, left, top, 0, 0);
        createButtons(9, 18, 1, data.invButtons, "top", slots, left, top, 0, -103);
        createButtons(36, 45, 1, data.invButtons, "bottom", slots, left, top, 0, 27);
        createButtons(9, 37, 9, data.invButtons, "left", slots, left, top, -27, 0);
        createButtons(5, 9, 1, data.invButtons, "right", slots, left, top, 171, 0);
        createButtons(17, 45, 9, data.invButtons, "right", slots, left, top, 27, 0);
    });
}

export function editChestButtons() {
    // Open example inventory
    const inv = new InventoryBasic(
        ChatLib.addColor("Chest"),
        true,
        54
    );
    const chest = new GuiChest(
        Player.getPlayer().field_71071_by,
        inv
    );
    GuiHandler.openGui(chest);
    
    Client.scheduleTask(1, () => {
        const gui = Client.currentGui.get();
        const top = gui.getGuiTop();
        const left = gui.getGuiLeft();
        const slots = gui.field_147002_h;
        const size = slots.func_75138_a().length;

        // Set all inv edit buttons
        createButtons(0, 9, 1, data.chestButtons, "top", slots, left, top, 0, -36);
        createButtons(size - 9, size, 1, data.chestButtons, "bottom", slots, left, top, 0, 27);
        createButtons(9, size, 9, data.chestButtons, "left", slots, left, top, -27, 0);
        createButtons(8, size, 9, data.chestButtons, "right", slots, left, top, 27, 0);
    });
}

const click = register("guiMouseClick", (x, y) => {
    Object.keys(buttons).forEach(key => {
        buttons[key].click(x, y);
    });
}).unregister();

const render = register("guiRender", () => {
    Object.keys(buttons).forEach(key => {
        buttons[key].draw();
    });
});

const close = register("guiClosed", () => {
    buttons = {};
    render.unregister();
    click.unregister();
    close.unregister();
}).unregister();

register("guiOpened", (event) => {
    const gui = event.gui;
    const name = gui.class.toString();
    if (name.endsWith("GuiInventory"));
    else if (name.endsWith("GuiChest"));
    else return;

    click.register();
    render.register();
    close.register();
});
