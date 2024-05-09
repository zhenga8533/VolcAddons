import { RENDERER_BLACK, RENDERER_GRAY } from "./constants";
import { data } from "./data";
import settings from "./settings";


const InventoryBasic = Java.type("net.minecraft.inventory.InventoryBasic");
const GuiInventory = Java.type("net.minecraft.client.gui.inventory.GuiInventory")
const GuiChest = Java.type("net.minecraft.client.gui.inventory.GuiChest");
const GuiTextField = Java.type("net.minecraft.client.gui.GuiTextField");
const commandInput = new GuiTextField(0, Client.getMinecraft().field_71466_p, 10, 10, 176, 16);
const iconInput = new GuiTextField(0, Client.getMinecraft().field_71466_p, 10, 30, 176, 16);

let buttons = {};
let editButtons = {};
let slots;

class Button {
    #dx;
    #dy;
    #slot;
    #clicked;
    #icon;

    constructor(dx, dy, slot, clicked, icon) {
        this.#dx = dx;
        this.#dy = dy;
        this.#slot = slot;
        this.#clicked = clicked;
        try {
            this.#icon = new Item("minecraft:" + icon);
        } catch (err) {
            this.#icon = new Item("minecraft:redstone_block");
        }
    }

    draw(dx, dy) {
        const slot = slots.func_75139_a(this.#slot);
        const x = slot + dx;
        const y = slot + dy;

        Renderer.translate(0, 0, 101);
        Renderer.drawRect(RENDERER_GRAY, x, y, 16, 16);
        Renderer.drawLine(RENDERER_BLACK, x + 16, y, x, y, 1);
        Renderer.drawLine(RENDERER_BLACK, x, y + 16, x, y, 1);
        Renderer.drawLine(RENDERER_BLACK, x, y, x + 16, y, 1);
        Renderer.drawLine(RENDERER_BLACK, x, y, x, y + 16, 1);
        this.#icon.draw(x, y, 1, 102);
    }

    click(dx, dy, button) {
        const slot = slots.func_75139_a(this.#slot);
        const x = slot.field_75223_e;
        const y = slot.field_75221_f;

        if (dx < x || dx > x + 16 || dy < y || dy > y + 16) return;
        
        if (button === 0) this.#clicked();
        else {

        }
    }
}

/**
 * Editing inputs and rendering.
 */
let editID;
let editX = 0;
let editY = 0;

const inputClick = register("guiMouseClick", (x, y, button, _, event) => {
    commandInput.func_146192_a(x, y, button);
    iconInput.func_146192_a(x, y, button);
    if (commandInput.func_146206_l() || iconInput.func_146206_l()) cancel(event);
}).unregister();

const inputKey = register("guiKey", (char, keyCode, _, event) => {
    if (commandInput.func_146206_l()) commandInput.func_146201_a(char, keyCode);
    else if (iconInput.func_146206_l()) iconInput.func_146201_a(char, keyCode);
    else return;

    // Cancel all but escape key
    if (keyCode !== 1) cancel(event);
    if (keyCode === 28) {  // Enter key
        if (commandInput.func_146179_b() === "") {
            // TBD: Add error message here
            return;
        }

        // TBD: Save Button
        buttons[editID] = new Button(editX, editY, () => {
            ChatLib.command(commandInput.func_146179_b());
        }, iconInput.func_146179_b());
        inputRender.unregister();
    }
}).unregister();

const inputRender = register("guiRender", () => {
    Renderer.drawString("Command (ex. \"p list\"):", commandInput.field_146209_f, commandInput.field_146210_g - 10, settings.textShadow);
    commandInput.func_146194_f();
    Renderer.drawString("Icon ID (ex. \"redstone_block\"): ", iconInput.field_146209_f, iconInput.field_146210_g - 10, settings.textShadow);
    iconInput.func_146194_f();
}).unregister();

function createButtons(start, end, interval, type, category, slots, dx, dy) {
    for (let i = start; i < end; i += interval) {
        let id = category + i;
        let slot = slots.func_75139_a(i);
        
        if (type === "set" && data.buttons.hasOwnProperty(id)) {
            let button = data.buttons[id];
            typeButtons[id] = new Button(button.dx, button.dy, i, () => {
                ChatLib.command(button.command)
            }, button.icon);
        } else if (type === "edit") {
            let x = slot.field_75223_e + dx;
            let y = slot.field_75221_f + dy;
            editButtons[id] = new Button(x, y, () => {
                editID = id;
                editX = x;
                editY = y;
                inputClick.register();
                inputKey.register();
                inputRender.register();
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

        // Set input field locations
        commandInput.field_146209_f = left;
        commandInput.field_146210_g = top - 80;
        iconInput.field_146209_f = left;
        iconInput.field_146210_g = top - 50;

        // Set all inv edit buttons
        createButtons(1, 5, 1, "edit", "crafting", slots, 0, 0);
        createButtons(9, 18, 1, "edit", "top", slots, 0, -103);
        createButtons(36, 45, 1, "edit", "bottom", slots, 0, 27);
        createButtons(9, 37, 9, "edit", "left", slots, -27, 0);
        createButtons(5, 9, 1, "edit", "right", slots, 171, 0);
        createButtons(17, 45, 9, "edit", "right", slots, 27, 0);
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
        const size = slots.func_75138_a().length;

        // Set input field locations
        commandInput.field_146209_f = left;
        commandInput.field_146210_g = top - 80;
        iconInput.field_146209_f = left;
        iconInput.field_146210_g = top - 50;

        // Set all inv edit buttons
        createButtons(0, 9, 1, "edit", "top", slots, 0, -36);
        createButtons(size - 9, size, 1, "edit", "bottom", slots, 0, 27);
        createButtons(9, size, 9, "edit", "left", slots, -27, 0);
        createButtons(8, size, 9, "edit", "right", slots, 27, 0);
    });
}

const click = register("guiMouseClick", (x, y, button, gui) => {
    x -= gui.getGuiLeft();
    y -= gui.getGuiTop();

    Object.keys(buttons).forEach(key => {
        buttons[key].click(x, y, button);
    });

    Object.keys(editButtons).forEach(key => {
        editButtons[key].click(x, y, button);
    });
}).unregister();

const render = register("guiRender", (_, __, gui) => {
    const top = gui.getGuiTop();
    const left = gui.getGuiLeft();

    Object.keys(buttons).forEach(key => {
        buttons[key].draw(left, top);
    });

    Object.keys(editButtons).forEach(key => {
        editButtons[key].draw(left, top);
    });
});

const close = register("guiClosed", () => {
    render.unregister();
    click.unregister();
    close.unregister();
    inputRender.unregister();
    inputClick.unregister();
    inputKey.unregister();
}).unregister();

register("guiOpened", (event) => {
    const gui = event.gui;
    slots = gui.field_147002_h;
    const name = gui.class.toString();
    if (name.endsWith("GuiInventory"));
    else if (name.endsWith("GuiChest"));
    else return;

    click.register();
    render.register();
    close.register();
});
