import settings from "../../utils/settings";
import { BOLD, GuiChest, GuiInventory, GuiTextField, InventoryBasic, RENDERER_BLACK, RENDERER_GRAY, UNDERLINE } from "../../utils/constants";
import { data } from "../../utils/data";
import { registerWhen } from "../../utils/register";


// Container offsets from top left [x, y]
const OFFSETS = {
    "top": [8, -18],
    "right": [178, 12],
    "bottom": [8, 42],
    "left": [-18, 12]
};

// Editing inputs and rendering
const editing = {
    "id": "Top0",
    "loc": "Top",
    "index": 0,
    "active": false
}
const commandInput = new GuiTextField(0, Client.getMinecraft().field_71466_p, 10, 10, 176, 16);
const iconInput = new GuiTextField(0, Client.getMinecraft().field_71466_p, 10, 30, 176, 16);

// Local cache
let buttons = {};
let editButtons = {};

class Button {
    #clicked;
    #loc;
    #index;
    #id;
    #x;
    #y;
    #command;
    #icon;
    #item;
    #edit = false;

    /**
     * Boop. Another poorly written class that patches up errors as they came up :).
     * 
     * @param {String} loc - "Top", "Right", "Bottom", or "Left" used to set offset.
     * @param {Number} index - Relative inventory index position. Will be used to determine if button should be rendered 
     * @param {Function} clicked - Callback function to be called when button is pressed.
     * @param {String} command - Command args that are called in the callback. Used to cache data.
     * @param {String} icon - Minecraft item id used to draw logo. Barrier icon is reserved for edit buttons.
     */
    constructor(loc, index, clicked, command="", icon="barrier") {
        this.#clicked = clicked;
        this.#loc = loc;
        this.#index = index;
        this.#id = loc + index.toString();
        this.#command = command;

        // Determine loc
        this.#x = OFFSETS[this.#loc][0] + 18 * (this.#index % 9);
        this.#y = OFFSETS[this.#loc][1] + 18 * ~~(this.#index / 9);

        this.setItem(icon);
    }

    /**
     * Returns Button.#index
     * 
     * @returns {Number} - Button's container index.
     */
    getIndex() {
        return this.#index;
    }

    /**
     * Updates Button.#clicked to callback.
     * 
     * @param {Function} callback - Function to run when button is clicked.
     */
    setClicked(callback) {
        this.#clicked = callback;
    }

    /**
     * Updates Button.#item using icon, otherwise defaults to redstone_block.
     * 
     * @param {String} icon - Name used to find Minecraft item ID.
     */
    setItem(icon) {
        try {
            this.#item = new Item("minecraft:" + icon);
            this.#icon = icon;
            this.#edit = icon === "barrier";
        } catch (err) {
            this.#item = new Item("minecraft:redstone_block");
            this.#icon = "redstone_block";
        }
    }

    /**
     * Saves button into PogData cache.
     */
    save() {
        data.buttons[this.#id] = [this.#loc, this.#index, this.#command, this.#icon];
    }

    /**
     * Draws button background and icon onto screen.
     * 
     * @param {Number} dx - Left most coordinate of current GUI.
     * @param {Number} dy - Top most coordinate of current GUI.
     */
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

    /**
     * Checks if mouse presses on button.
     * 
     * @param {Number} dx - Left most coordinate of current GUI.
     * @param {Number} dy - Top most coordinate of current GUI.
     * @param {Number} cx - X pos of mouse press.
     * @param {Number} cy - Y pos of mouse press.
     * @param {Number} button - 0 for left click, 1 for right click.
     * @returns {Boolean} True if button was pressed, false otherwise.
     */
    click(dx, dy, cx, cy, button) {
        const size = Player.getContainer().getSize();
        const x = dx + this.#x;
        const y = dy + this.#y + (this.#loc !== "bottom" ? 0 :
            18 * ~~(size / 9) + (size > 45 ? 0 : 36));
        if (cx < x || cx > x + 16 || cy < y || cy > y + 16) return false;

        if (editing.active) {
            if (button === 0) {
                if (this.#edit) {
                    this.#clicked();
                    return true;
                }
                
                commandInput.func_146180_a(this.#command);
                iconInput.func_146180_a(this.#icon);
            } else delete buttons[this.#id];
            
            editButtons[this.#id] = new Button(this.#loc, this.#index, () => {
                editing.id = this.#id;
                editing.loc = this.#loc;
                editing.index = this.#index;

                inputKey.register();
                inputRender.register();
            });
        } else if (button === 0) this.#clicked();

        return true;
    }

    /**
     * Checks if mouse is hovering over button to render linked command.
     * 
     * @param {Number} dx - Left most coordinate of current GUI.
     * @param {Number} dy - Top most coordinate of current GUI.
     * @param {Number} hx - Current x pos of mouse.
     * @param {Number} hy - Current y pos of mouse.
     */
    hover(dx, dy, hx, hy) {
        const size = Player.getContainer().getSize();
        const x = dx + this.#x;
        const y = dy + this.#y + (this.#loc !== "bottom" ? 0 :
            18 * ~~(size / 9) + (size > 45 ? 0 : 36));
        if (hx < x || hx > x + 16 || hy < y || hy > y + 16) return;

        Renderer.translate(0, 0, 300);
        Renderer.drawString(UNDERLINE + (this.#edit ? `Edit ${this.#id}` : '/' + this.#command), hx, hy - 10);
    }
}

/**
 * Unregisters edit registers and clears input fields.
 */
function resetEdit() {
    inputKey.unregister();
    inputRender.unregister();
    commandInput.func_146180_a("");
    iconInput.func_146180_a("");
}

const inputClick = register("guiMouseClick", (x, y, button, gui, event) => {
    commandInput.func_146192_a(x, y, button);
    iconInput.func_146192_a(x, y, button);
    if (commandInput.func_146206_l() || iconInput.func_146206_l()) cancel(event);
    else {
        const left = gui.getGuiLeft();
        const top = gui.getGuiTop();
        
        if (!Object.keys(editButtons).some(key => editButtons[key].click(left, top, x, y, button))) resetEdit();
    }
}).unregister();

const inputKey = register("guiKey", (char, keyCode, _, event) => {
    if (commandInput.func_146206_l()) commandInput.func_146201_a(char, keyCode);
    else if (iconInput.func_146206_l()) iconInput.func_146201_a(char, keyCode);
    else return;

    // Cancel all but escape key
    if (keyCode !== 1) cancel(event);
    if (keyCode === 28) {  // Enter key
        if (commandInput.func_146179_b() === "") return;
        else if (iconInput.func_146179_b() === "barrier") return;

        let command = commandInput.func_146179_b();  // This is also a pointer for some reason
        if (buttons.hasOwnProperty(editing.id)) {
            buttons[editing.id].setClicked(() => {
                ChatLib.command(command);
            });
            buttons[editing.id].setItem(iconInput.func_146179_b());
        } else {
            buttons[editing.id] = new Button(editing.loc, editing.index, () => {
                ChatLib.command(command);
            }, command, iconInput.func_146179_b());
            delete editButtons[editing.id];
        }

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

/**
 * Loops through provided indexes to create buttons for a category.
 * 
 * @param {Number} start - Starting index of for loop.
 * @param {Number} end - Ending index of for loop (not inclusive).
 * @param {Number} increment - Step size of for loop.
 * @param {String} category - "top", "right", "bottom", or "left"
 */
function createButtons(start, end, increment, category) {
    for (let i = start; i < end; i += increment) {
        let id = category + i;
        if (data.buttons.hasOwnProperty(id)) continue;
        
        let j = i / 1;  // Why tf does i act like a pointer
        editButtons[id] = new Button(category, i, () => {
            editing.id = id;
            editing.index = j;
            editing.loc = category;

            inputKey.register();
            inputRender.register();
        });
    }
}

/**
 * Sets up button editing menu for specified container type.
 * 
 * @param {String} type - "inv" or "chest" for type of container to open and process.
 */
export function setButtons(type) {
    // Open example inventory, credit to: https://www.chattriggers.com/modules/v/ChestMenu
    if (type === "inv") GuiHandler.openGui(new GuiInventory(Player.getPlayer()));
    else {
        const inv = new InventoryBasic("Container Buttons", true, 54);
        const chest = new GuiChest(Player.getPlayer().field_71071_by, inv);
        GuiHandler.openGui(chest);
    }

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
        const bottom = type === "inv" ? 72 : 99;
        createButtons(0, 9, 1, "top");
        createButtons(0, 9, 1, "bottom");
        createButtons(0, bottom, 9, "left");
        createButtons(0, bottom, 9, "right");
    });
    inputClick.register();
}

/**
 * Registers for tracking and rendering buttons.
 */
const click = register("guiMouseClick", (x, y, button, gui) => {
    const left = gui.getGuiLeft();
    const top = gui.getGuiTop();

    Object.keys(buttons).forEach(key => {
        buttons[key].click(left, top, x, y, button);
    });
}).unregister();

const render = register("guiRender", (x, y, gui) => {
    const top = gui.getGuiTop();
    const left = gui.getGuiLeft();
    const size = Player.getContainer().getSize();

    Object.keys(buttons).forEach(key => {
        if (buttons[key].getIndex() > size) return;
        buttons[key].draw(left, top);
        buttons[key].hover(left, top, x, y);
    });

    Object.keys(editButtons).forEach(key => {
        editButtons[key].draw(left, top);
        editButtons[key].hover(left, top, x, y);
    });
}).unregister();

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

registerWhen(register("guiOpened", (event) => {
    const gui = event.gui;
    const name = gui.class.toString();
    if (!name.endsWith("GuiInventory") && !name.endsWith("GuiChest")) return;

    click.register();
    close.register();
    render.register();
    Client.scheduleTask(1, () => {
        click.register();
        close.register();
        render.register();
    })
}), () => settings.containerButtons);

/**
 * Persistant buttons
 */
register("gameUnload", () => {
    data.buttons = {};
    Object.keys(buttons).forEach(key => {
        buttons[key].save();
    });
});

Object.keys(data.buttons).forEach(key => {
    const button = data.buttons[key];
    buttons[key] = new Button(button[0], button[1], () => {
        ChatLib.command(button[2])
    }, button[2], button[3]);
});
