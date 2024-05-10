import settings from "../../utils/settings";
import { AQUA, BOLD, DARK_AQUA, DARK_GRAY, GREEN, LOGO, RED } from "../../utils/constants";
import { getSlotCoords } from "../../utils/functions/find";
import { registerWhen } from "../../utils/register";
import { data } from "../../utils/data";


// Bind key
const bindKey = new KeyBind("Slot Binding", data.bindKey, "./VolcAddons.xdd");
register("gameUnload", () => { data.bindKey = bindKey.getKeyCode() });
let binding = undefined;

// Bind slots
registerWhen(register("guiKey", (c, keyCode, gui) => {
    if (keyCode !== bindKey.getKeyCode()) return;
    const bind = gui?.getSlotUnderMouse()?.field_75222_d;
    if (bind === undefined || bind <= 4) return;

    if (data.slotBinds.hasOwnProperty(bind)) {
        delete data.slotBinds[data.slotBinds[bind]];
        delete data.slotBinds[bind];
    } else if (binding === undefined) binding = bind;
    else if (binding === bind) binding = undefined;
    else if ((binding >= 36 && bind < 36) || (binding < 36 && bind >= 36)) {
        // Delete old binds and set new binds
        delete data.slotBinds[binding];
        delete data.slotBinds[bind];

        data.slotBinds[binding] = bind;
        data.slotBinds[bind] = [binding];
        binding = undefined;
    }
}), () => settings.slotBinding);
registerWhen(register("guiClosed", () => {
    binding = undefined;
}), () => settings.slotBinding);

// Swap binded items
registerWhen(register("guiMouseClick", (x, y, button, gui, event) => {
    if (button !== 0 || !Keyboard.isKeyDown(Keyboard.KEY_LSHIFT)) return;

    const hover = gui?.getSlotUnderMouse()?.field_75222_d;
    const bind = data.slotBinds[hover];
    if (hover >= 36 || bind === undefined) return;

    // playerController.windowClick()
    Client.getMinecraft().field_71442_b.func_78753_a(Player.getContainer().getWindowId(), hover, bind - 36, 2, Player.getPlayer());

    cancel(event);
}), () => settings.slotBinding);

// Render bindings
registerWhen(register("guiRender", (x, y, gui) => {
    if (gui.class.getName() !== "net.minecraft.client.gui.inventory.GuiInventory") return;
    const containerType = Player.getContainer().getClassName();

    // render binding
    if (binding !== undefined) {
        const [x, y] = getSlotCoords(binding, containerType);
    
        Renderer.translate(0, 0, 100);
        Renderer.drawRect(Renderer.color(0, 255, 255, 200), x, y, 16, 16);
    }

    // render all binds
    Object.keys(data.slotBinds).forEach(bind => {
        const [x, y] = getSlotCoords(bind, containerType);

        Renderer.translate(0, 0, 100);
        Renderer.drawRect(Renderer.color(128, 128, 128, 200), x, y, 16, 16);
    });

    // render hovered binds
    const hover = gui?.getSlotUnderMouse()?.field_75222_d;
    const bind = data.slotBinds[hover];
    if (bind !== undefined) {
        const [x, y] = getSlotCoords(hover, containerType);
        const [dx, dy] = getSlotCoords(bind, containerType);

        Renderer.translate(0, 0, 100);
        Renderer.drawLine(Renderer.AQUA, x + 8, y + 8, dx + 8, dy + 8, 1);
    }
}), () => settings.slotBinding);

/**
 * Slot binding related commands...
 */
export function slotCommands(args) {
    const command = args[1];
    const name = args[2];

    switch(command) {
        case "save":
            data.bindPresets[name] = data.slotBinds;
            ChatLib.chat(`${LOGO + GREEN}Successfully saved slot bindingds using key: "${name}".`);
            break;
        case "load":
            if (data.bindPresets.hasOwnProperty(name)) {
                data.slotBinds = data.bindPresets[name];
                ChatLib.chat(`${LOGO + GREEN}Succesfully loaded slot bindings using key: "${name}".`);
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
        case "clear":
        case "reset":
            data.slotBinds = {};
            ChatLib.chat(`${LOGO + GREEN}Successfully reset slot bindings!`);
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
 ${DARK_GRAY}- ${GOLD}load ${YELLOW}<key>: Load button preset using key.
 ${DARK_GRAY}- ${GOLD}list: ${YELLOW}View all available button presets.
 ${DARK_GRAY}- ${GOLD}import: ${YELLOW}Import button presets from the clipboard.
 ${DARK_GRAY}- ${GOLD}export: ${YELLOW}Export the button data as encoded data.
 ${DARK_GRAY}- ${GOLD}reset: ${YELLOW}Resets button presets.`);
            break;
    }
}


register("command", (arg) => {
    if (data.bindPresets.hasOwnProperty(arg)) {
        delete data.bindPresets[arg];
        ChatLib.chat(`${LOGO + GREEN}Succesfully deleted slot bindings using key: "${arg}"`);
    } else ChatLib.chat(`${LOGO + RED}Invalid bind key: "${arg}"`);
}).setName("deleteBinds", true);

register("command", (arg) => {
    if (data.bindPresets.hasOwnProperty(arg)) {
        data.slotBinds = data.bindPresets[arg];
        ChatLib.chat(`${LOGO + GREEN}Succesfully loaded slot bindings using key: "${arg}"`);
    } else ChatLib.chat(`${LOGO + RED}Invalid bind key: "${arg}"`);
}).setName("loadBinds", true);

register("command", (arg) => {
    const bindingKeys = Object.keys(data.bindPresets);
    ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}Slot Binding Presets:`);
    bindingKeys.forEach(preset => ChatLib.chat(` ${DARK_GRAY}- ${AQUA + preset}`));
    if (bindingKeys.length === 0) ChatLib.chat(` ${RED}No keys exist!`);
}).setName("listBinds", true);
