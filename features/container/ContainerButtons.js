import settings from "../../utils/settings";
import { AQUA, BOLD, BUTTON_PRESETS, DARK_AQUA, DARK_GRAY, DARK_GREEN, DataFlavor, GOLD, GREEN, GuiChest, GuiInventory, GuiTextField, InventoryBasic, LOGO, RED, Toolkit, UNDERLINE, YELLOW } from "../../utils/constants";
import { data } from "../../utils/data";
import { registerWhen } from "../../utils/register";


// Container offsets from top left [x, y]
const OFFSETS = {
    "top": [8, -18],
    "right": [178, 12],
    "bottom": [8, 42],
    "left": [-18, 12],
    "inv1": [80, 6],
    "inv2": [80, 24],
    "inv3": [80, 42],
    "inv4": [80, 60],
};

const COLOR_SCHEMES = [
    [Renderer.color(139, 139, 139, 128), Renderer.color(198, 198, 198, 255)],  // Default
    [Renderer.color(0, 0, 0, 0), Renderer.color(0, 0, 0, 0)],  // Transparent
    [Renderer.color(255, 255, 255, 16), Renderer.color(169, 169, 169, 128)],  // Semi-Transparent
    [Renderer.color(82, 92, 136, 128), Renderer.color(44, 53, 77, 255)]  // FurfSky
]

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
let container;

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
    #invOnly;
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
        this.#x = OFFSETS[this.#loc][0] + 18 * (this.#index % 9);
        this.#y = OFFSETS[this.#loc][1] + 18 * ~~(this.#index / 9);
        this.#invOnly = loc.startsWith("inv");
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
     * Updates Button.#command and Button.#clicked to callback.
     * 
     * @param {String} command - Command to run when button is pressed.
     */
    setCommand(command) {
        this.#command = command;
        this.#clicked = () => {
            ChatLib.command(command);
        }
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
     * Saves button caching data into specified data variable.
     * 
     * @param {Object} cache - Data variasble to save Button data to.
     */
    save(cache) {
        cache[this.#id] = [this.#loc, this.#index, this.#command, this.#icon, this.#invOnly];
    }

    /**
     * Draws button background and icon onto screen.
     * 
     * @param {Number} dx - Left most coordinate of current GUI.
     * @param {Number} dy - Top most coordinate of current GUI.
     */
    draw(dx, dy) {
        if (this.#invOnly && container !== "GuiInventory") return;

        const size = Player.getContainer().getSize();
        const x = dx + this.#x;
        const y = dy + this.#y + (this.#loc !== "bottom" ? 0 :
            18 * ~~(size / 9) + (size > 45 ? 0 : 36));

        Renderer.translate(0, 0, 300);
        Renderer.drawRect(COLOR_SCHEMES[settings.buttonColor][0], x, y, 16, 16);
        Renderer.translate(0, 0, 300);
        Renderer.drawLine(COLOR_SCHEMES[settings.buttonColor][1], x - 1, y - 1, x + 17, y - 1, 1);
        Renderer.translate(0, 0, 300);
        Renderer.drawLine(COLOR_SCHEMES[settings.buttonColor][1], x - 1, y - 1, x - 1, y + 17, 1);
        Renderer.translate(0, 0, 300);
        Renderer.drawLine(COLOR_SCHEMES[settings.buttonColor][1], x - 1, y + 17, x + 17, y + 17, 1);
        Renderer.translate(0, 0, 300);
        Renderer.drawLine(COLOR_SCHEMES[settings.buttonColor][1], x + 17, y - 1, x + 17, y + 17, 1);
        this.#item.draw(x, y, 1, 301);
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
        if (this.#invOnly && container !== "GuiInventory") return;
        
        const size = Player.getContainer().getSize();
        const x = dx + this.#x;
        const y = dy + this.#y + (this.#loc !== "bottom" ? 0 :
            18 * ~~(size / 9) + (size > 45 ? 0 : 36));
        if (hx < x || hx > x + 16 || hy < y || hy > y + 16) return;

        Renderer.translate(0, 0, 999);
        Renderer.drawString(UNDERLINE + (this.#edit ? `Edit ${this.#id}` : '/' + this.#command), hx, hy - 10);
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
        if (this.#invOnly && container !== "GuiInventory") return;

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

                editing.id = this.#id;
                editing.loc = this.#loc;
                editing.index = this.#index;

                inputKey.register();
                inputRender.register();
                iconInput.func_146180_a(this.#icon);
                commandInput.func_146180_a(this.#command);
                commandInput.func_146195_b(true);
            } else {
                delete buttons[this.#id];
                editButtons[this.#id] = new Button(this.#loc, this.#index, () => {
                    editing.id = this.#id;
                    editing.loc = this.#loc;
                    editing.index = this.#index;
    
                    inputKey.register();
                    inputRender.register();
                }, "", "barrier", this.#invOnly);
            }
        } else if (button === 0) this.#clicked();

        return true;
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

/**
 * Creates a button using input fields as arguments.
 */
function saveEdit() {
    if (commandInput.func_146179_b() === "" || iconInput.func_146179_b() === "barrier") return;

    let command = commandInput.func_146179_b();  // This is also a pointer for some reason
    if (buttons.hasOwnProperty(editing.id)) {
        buttons[editing.id].setCommand(command);
        buttons[editing.id].setItem(iconInput.func_146179_b());
    } else {
        buttons[editing.id] = new Button(editing.loc, editing.index, () => {
            ChatLib.command(command);
        }, command, iconInput.func_146179_b(), editing.inv);
        delete editButtons[editing.id];
    }
}

const inputClick = register("guiMouseClick", (x, y, button, gui, event) => {
    commandInput.func_146192_a(x, y, button);
    iconInput.func_146192_a(x, y, button);
    if (commandInput.func_146206_l() || iconInput.func_146206_l()) cancel(event);
    else {
        saveEdit();
        const left = gui.getGuiLeft();
        const top = gui.getGuiTop();
        
        if (!Object.keys(editButtons).some(key => editButtons[key].click(left, top, x, y, button)) && 
            !Object.keys(buttons).some(key => buttons[key].click(left, top, x, y, button))) resetEdit();
    }
}).unregister();

const inputKey = register("guiKey", (char, keyCode, _, event) => {
    if (commandInput.func_146206_l()) commandInput.func_146201_a(char, keyCode);
    else if (iconInput.func_146206_l()) iconInput.func_146201_a(char, keyCode);
    else return;

    // Cancel all but escape key
    if (keyCode !== 1) cancel(event);
    if (keyCode === 28) {  // Enter key
        saveEdit();
        resetEdit();
    } else if (keyCode === 15) {  // Tab key
        if (commandInput.func_146206_l()) {
            commandInput.func_146195_b(false);
            iconInput.func_146195_b(true);
        } else {
            iconInput.func_146195_b(false);
            commandInput.func_146195_b(true);
        }
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
        if (buttons.hasOwnProperty(id)) continue;
        
        let j = i / 1;  // Why tf does i act like a pointer
        editButtons[id] = new Button(category, i, () => {
            editing.id = id;
            editing.index = j;
            editing.loc = category;

            iconInput.func_146180_a("");
            commandInput.func_146180_a("");
            commandInput.func_146195_b(true)
            inputKey.register();
            inputRender.register();
        }, "", "barrier");
    }
}

/**
 * Sets up button editing menu for specified container type.
 * 
 * @param {String} type - "inv" or "chest" for type of container to open and process.
 */
export function setButtons(type) {
    editing.active = true;
    const setInv = type === "inv";

    // Open example inventory, credit to: https://www.chattriggers.com/modules/v/ChestMenu
    if (setInv) GuiHandler.openGui(new GuiInventory(Player.getPlayer()));
    else {
        const inv = new InventoryBasic("Container Buttons", true, 54);
        const chest = new GuiChest(Player.getPlayer().field_71071_by, inv);
        GuiHandler.openGui(chest);
    }

    Client.scheduleTask(1, () => {
        const gui = Client.currentGui.get();
        if (!gui) return;
        const top = gui.getGuiTop();
        const left = gui.getGuiLeft();

        // Set input field locations
        commandInput.field_146209_f = left;
        commandInput.field_146210_g = top - 80;
        iconInput.field_146209_f = left;
        iconInput.field_146210_g = top - 50;

        // Set all inv edit buttons TRBL
        const bottom = setInv ? 72 : 99;
        createButtons(0, 9, 1, "top");
        createButtons(0, 9, 1, "bottom");
        createButtons(0, bottom, 9, "left");
        createButtons(0, bottom, 9, "right");
        if (setInv) {
            createButtons(0, 5, 1, "inv1");
            createButtons(0, 5, 1, "inv2");
            createButtons(0, 5, 1, "inv3");
            createButtons(0, 5, 1, "inv4");
        }
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
    const name = gui.class.toString().split('.');
    container = name[name.length - 1];
    if (container !== "GuiInventory" && container !== "GuiChest") return;

    if (!editing.active) click.register();
    close.register();
    render.register();
    Client.scheduleTask(1, () => {
        click.register();
        close.register();
        render.register();
    })
}), () => settings.containerButtons);

/**
 * Persistant buttons.
 */
register("gameUnload", () => {
    data.buttons = {};
    Object.keys(buttons).forEach(key => {
        buttons[key].save(data.buttons);
    });
});

/**
 * Loads buttons using cached button data.
 */
function loadButtons() {
    buttons = {};
    Object.keys(data.buttons).forEach(key => {
        const button = data.buttons[key];
        buttons[key] = new Button(button[0], button[1], () => {
            ChatLib.command(button[2])
        }, button[2], button[3], button[4]);
    });
}
loadButtons();

/**
 * Calls through all the commands associated with container buttons feature.
 * 
 * @param {String[]} args - String arguments passed through command call.
 */
export function buttonCommands(args) {
    const command = args[1];
    const name = args[2];

    switch(command) {
        case "inv":
            setButtons("inv");
            break;
        case "chest":
            setButtons("chest");
            break;
        case "save":
            data.buttonPresets[name] = {};
            Object.keys(buttons).forEach(key => {
                buttons[key].save(data.buttonPresets[name]);
            });
            data.save();
            ChatLib.chat(`${LOGO + GREEN}Successfully saved buttons data using key: "${name}".`);
            break;
        case "delete":
        case "remove":
            if (data.buttonPresets.hasOwnProperty(name)) {
                delete data.buttonPresets[name];
                ChatLib.chat(`${LOGO + GREEN}Successfully deleted button preset using key: "${name}".`);
            } else ChatLib.chat(`${LOGO + RED}Error: There are no presets using "${name}" key.`)
            break;
        case "load":
            if (data.buttonPresets.hasOwnProperty(name)) {
                data.buttons = data.buttonPresets[name];
                loadButtons();
                ChatLib.chat(`${LOGO + GREEN}Successfully loaded button preset using key: "${name}".`);
            } else ChatLib.chat(`${LOGO + RED}Error: There are no presets using "${name}" key.`);
            break;
        case "list":
        case "view":
            const buttonKeys = Object.keys(data.buttonPresets);
            ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}Button Presets:`);
            buttonKeys.forEach(preset => ChatLib.chat(` ${DARK_GRAY}- ${AQUA + preset}`));
            if (buttonKeys.length === 0) ChatLib.chat(` ${RED}No presets exist!`);
            break;
        case "import":
        case "parse":
            const backup = data.buttons;
            try {
                const decoded = JSON.parse(FileLib.decodeBase64(Toolkit.getDefaultToolkit().getSystemClipboard().getData(DataFlavor.stringFlavor)));
                data.buttons = decoded;
                loadButtons();
                ChatLib.chat(`${LOGO + GREEN}Successfully loaded button preset from clipboard!`);
            } catch (err) {
                data.buttons = backup;
                ChatLib.chat(`${LOGO + RED}Error: Unable to process clipboard content!`);
            }
            break;
        case "export":
            const compressed = FileLib.encodeBase64(JSON.stringify(data.buttons));
            new Message(`${LOGO + DARK_GREEN}Encoded Button Data:`, new TextComponent(GREEN + compressed)
                .setClickAction("run_command")
                .setClickValue("/vacopy " + compressed)
                .setHoverValue(`${YELLOW}Click to copy data.`)
            ).chat();
            break;
        case "reset":
            data.buttonPresets = BUTTON_PRESETS;
            ChatLib.chat(`${LOGO + GREEN}Successfully reset button presets!`);
            break;
        case "clear":
            data.buttons = {};
            loadButtons();
            ChatLib.chat(`${LOGO + GREEN}Successfully cleared current buttons!`);
            break;
        case "help":
        default:
            if (command !== "help") ChatLib.chat(`${LOGO + RED}Error: Invalid argument "${command}"!\n`);
            ChatLib.chat(`
${LOGO + GOLD + BOLD}Container Buttons Commands:
 ${DARK_GRAY}- ${GOLD}Base: ${YELLOW}/va buttons <command>

 ${DARK_GRAY}- ${GOLD}inv: ${YELLOW}Opens edit menu for GuiInventory.
 ${DARK_GRAY}- ${GOLD}chest: ${YELLOW}Opens edit meny for GuiChest.
 ${DARK_GRAY}- ${GOLD}save ${YELLOW}<key>: Save button data to presets using key.
 ${DARK_GRAY}- ${GOLD}delete ${YELLOW}<key>: Delete button preset using key.
 ${DARK_GRAY}- ${GOLD}load ${YELLOW}<key>: Load button preset using key.
 ${DARK_GRAY}- ${GOLD}list: ${YELLOW}View all available button presets.
 ${DARK_GRAY}- ${GOLD}import: ${YELLOW}Import button presets from the clipboard.
 ${DARK_GRAY}- ${GOLD}export: ${YELLOW}Export the button data as encoded data.
 ${DARK_GRAY}- ${GOLD}reset: ${YELLOW}Resets button presets.
 ${DARK_GRAY}- ${GOLD}clear: ${YELLOW}Resets current button data.`);
            break;
    }
}
