import settings from "../../utils/settings";
import { registerWhen } from "../../utils/variables";


/**
 * Variables used to track and move pointer location.
 */
const mouse = Java.type('org.lwjgl.input.Mouse');
const screen = Renderer.screen;
let x = screen.getWidth();
let y = screen.getHeight();

registerWhen(register("guiOpened", () => {
    // Set mouse as old pos
    mouse.setCursorPosition(x, screen.getHeight() * 2 - y);
}), () => settings.mouseReset);

/**
 * Set mouse position to old position if moving from gui to gui else to middle
 */
function setMouse() {
    // Track current position if moving from gui => gui
    x = Client.Companion.getMouseX() * 2;
    y = Client.Companion.getMouseY() * 2;

    // Reset position a tick after closing gui
    Client.scheduleTask(1, () => {
        if (Client.isInGui()) return;
        x = screen.getWidth();
        y = screen.getHeight();
    });
}
registerWhen(register("guiMouseClick", setMouse), () => settings.mouseReset);
registerWhen(register("guiKey", setMouse), () => settings.mouseReset);
