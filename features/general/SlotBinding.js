import { GREEN, LOGO, RED } from "../../utils/constants";
import { getSlotCoords } from "../../utils/functions/find";
import settings from "../../utils/settings";
import { data, registerWhen } from "../../utils/variables";


// Sponsered by poe.com
const KEYBOARD = Java.type("org.lwjgl.input.Keyboard");
const LSHIFT = KEYBOARD.KEY_LSHIFT;

// Inventory key press helper stuff
const ROBOT = Java.type("java.awt.Robot");
const KEYEVENT = Java.type("java.awt.event.KeyEvent");

const robot = new ROBOT();
const press = [];
for (let i = 1; i <= 9; i++) {
    let key = Client.getKeyBindFromDescription(`key.hotbar.${i}`).getKeyCode();
    try {
        press.push(KEYEVENT[`VK_${Keyboard.getKeyName(key)}`]);
    } catch(_) {
        press.push(KEYEVENT[`VK_${i}`]);
    }
}

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
    if (button !== 0 || !KEYBOARD.isKeyDown(LSHIFT)) return;

    const hover = gui?.getSlotUnderMouse()?.field_75222_d;
    const bind = data.slotBinds[hover];
    if (bind === undefined) return;

    // swap item positions
    if (hover < 36) {
        const key = press[bind - 36];
        robot.keyPress(key);
        Client.scheduleTask(1, () => robot.keyRelease(key));
    }

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
register("command", () => {
    data.slotBinds = {};
    ChatLib.chat(`${LOGO + GREEN}Successfully reset slot bindings!`);
}).setName("resetBinds", true);

register("command", (arg) => {
    data.bindPresets[arg] = data.slotBinds;
    ChatLib.chat(`${LOGO + GREEN}Successfully saved slot bindingds to key: "${arg}"`);
}).setName("saveBinds", true);

register("command", (arg) => {
    if (data.bindPresets.hasOwnProperty(arg)) {
        data.slotBinds = data.bindPresets[arg];
        ChatLib.chat(`${LOGO + GREEN}Succesfully loaded slot bindings using key: "${arg}"`);
    } else ChatLib.chat(`${LOGO + RED}Invalid key: "${arg}"`);
}).setName("loadBinds", true);
