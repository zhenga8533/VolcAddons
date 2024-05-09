import { BOLD, RENDERER_BLACK, RENDERER_GRAY } from "./constants";
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

// [x, y, dy]
const OFFSETS = {
    "top": [8, -18],
    "right": [178, 12],
    "bottom": [8, 42],
    "left": [-18, 12]
};

/**
 * Editing inputs and rendering.
 */
const editing = {
    "id": "Top0",
    "loc": "Top",
    "index": 0,
    "active": false
}

class Button {
    #clicked;
    #x;
    #y;
    #loc;
    #index;
    #id;
    #edit = false;
    #item;

    constructor(loc, index, clicked, icon) {
        this.#clicked = clicked;
        this.#loc = loc;
        this.#index = index;
        this.#id = loc + index.toString();

        // Determine loc
        this.#x = OFFSETS[this.#loc][0] + 18 * (this.#index % 9);
        this.#y = OFFSETS[this.#loc][1] + 18 * ~~(this.#index / 9);

        try {
            this.#item = new Item("minecraft:" + icon);
            this.#edit = icon === "barrier";
        } catch (err) {
            this.#item = new Item("minecraft:redstone_block");
        }
    }

    getIndex() {
        return this.#index;
    }

    draw(dx, dy) {
        const size = Player.getContainer().getSize();
        const x = dx + this.#x;
        const y = dy + this.#y + (this.#loc !== "bottom" ? 0 :
            18 * ~~(size / 9) + (size > 45 ? 0 : 36));

        Renderer.drawRect(RENDERER_GRAY, x, y, 16, 16);
        Renderer.drawLine(RENDERER_BLACK, x - 1, y - 1, x + 17, y - 1, 1);
        Renderer.drawLine(RENDERER_BLACK, x - 1, y - 1, x - 1, y + 17, 1);
        Renderer.drawLine(RENDERER_BLACK, x - 1, y + 17, x + 17, y + 17, 1);
        Renderer.drawLine(RENDERER_BLACK, x + 17, y - 1, x + 17, y + 17, 1);
        this.#item.draw(x, y, 1, 102);
    }

    click(dx, dy, cx, cy, button) {
        const size = Player.getContainer().getSize();
        const x = dx + this.#x;
        const y = dy + this.#y + (this.#loc !== "bottom" ? 0 :
            18 * ~~(size / 9) + (size > 45 ? 0 : 36));

        if (cx < x || cx > x + 16 || cy < y || cy > y + 16) return;

        if (editing.active) {
            if (button === 0) {
                if (this.#edit) this.#clicked();
                else {
                    // TBD: Edit text fields
                }
            } else {  // Delete button and replace with new edit button
                editButtons[this.#id] = new Button(this.#loc, this.#index, () => {
                    editing.id = this.#id;
                    editing.loc = this.#loc;
                    editing.index = this.#index;
    
                    inputClick.register();
                    inputKey.register();
                    inputRender.register();
                }, "barrier");
                delete buttons[this.#id];
            }
        } else if (button === 0) this.#clicked();
    }
}

function resetEdit() {
    inputClick.unregister();
    inputKey.unregister();
    inputRender.unregister();
    commandInput.func_146180_a("");
    iconInput.func_146180_a("");
}

const inputClick = register("guiMouseClick", (x, y, button, _, event) => {
    commandInput.func_146192_a(x, y, button);
    iconInput.func_146192_a(x, y, button);
    if (commandInput.func_146206_l() || iconInput.func_146206_l()) cancel(event);
    else resetEdit();
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
        } else if (iconInput.func_146179_b() === "barrier") {
            return;
        }

        // TBD: Save Button
        let command = commandInput.func_146179_b();  // This is also a pointer for some reason
        buttons[editing.id] = new Button(editing.loc, editing.index, () => {
            ChatLib.command(command);
        }, iconInput.func_146179_b());
        delete editButtons[editing.id];

        // Clear and unregister
        resetEdit();
    }
}).unregister();

const inputRender = register("guiRender", () => {
    Renderer.drawString(`${BOLD}Editing: ${editing.id}`, commandInput.field_146209_f, commandInput.field_146210_g - 20, settings.textShadow);
    Renderer.drawString("Command (ex. \"p list\"):", commandInput.field_146209_f, commandInput.field_146210_g - 10, settings.textShadow);
    commandInput.func_146194_f();
    Renderer.drawString("Icon ID (ex. \"redstone_block\"): ", iconInput.field_146209_f, iconInput.field_146210_g - 10, settings.textShadow);
    iconInput.func_146194_f();
}).unregister();

function createButtons(start, end, interval, category) {
    for (let i = start; i < end; i += interval) {
        let id = category + i;
        if (data.buttons.hasOwnProperty(id)) return;
        
        let j = i / 1;  // Why tf does i act like a pointer
        editButtons[id] = new Button(category, i, () => {
            editing.id = id;
            editing.index = j;
            editing.loc = category;

            inputClick.register();
            inputKey.register();
            inputRender.register();
        }, "barrier");
    }
}

export function editInvButtons() {
    // Open example inventory
    GuiHandler.openGui(new GuiInventory(Player.getPlayer()));

    Client.scheduleTask(1, () => {
        editing.active = true;
        const gui = Client.currentGui.get();
        const top = gui.getGuiTop();
        const left = gui.getGuiLeft();

        // Set input field locations
        commandInput.field_146209_f = left;
        commandInput.field_146210_g = top - 80;
        iconInput.field_146209_f = left;
        iconInput.field_146210_g = top - 50;

        // Set all inv edit buttons TRBL
        createButtons(0, 9, 1, "top");
        createButtons(0, 9, 1, "bottom");
        createButtons(0, 72, 9, "left");
        createButtons(0, 72, 9, "right");
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
        editing.active = true;
        const gui = Client.currentGui.get();
        const top = gui.getGuiTop();
        const left = gui.getGuiLeft();

        // Set input field locations
        commandInput.field_146209_f = left;
        commandInput.field_146210_g = top - 80;
        iconInput.field_146209_f = left;
        iconInput.field_146210_g = top - 50;

        // Set all inv edit buttons
        createButtons(0, 9, 1, "top");
        createButtons(0, 9, 1, "bottom");
        createButtons(0, 99, 9, "left");
        createButtons(0, 99, 9, "right");
    });
}

const click = register("guiMouseClick", (x, y, button, gui) => {
    const left = gui.getGuiLeft();
    const top = gui.getGuiTop();

    Object.keys(buttons).forEach(key => {
        buttons[key].click(left, top, x, y, button);
    });

    Object.keys(editButtons).forEach(key => {
        editButtons[key].click(left, top, x, y, button);
    });
}).unregister();

const render = register("guiRender", (_, __, gui) => {
    const top = gui.getGuiTop();
    const left = gui.getGuiLeft();
    const size = Player.getContainer().getSize();

    Object.keys(buttons).forEach(key => {
        if (buttons[key].getIndex() > size) return;
        buttons[key].draw(left, top);
    });

    Object.keys(editButtons).forEach(key => {
        editButtons[key].draw(left, top);
    });
});

const close = register("guiClosed", () => {
    editButtons = {};
    render.unregister();
    click.unregister();
    close.unregister();
    inputRender.unregister();
    inputClick.unregister();
    inputKey.unregister();
    editing.active = false;
    resetEdit();
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
