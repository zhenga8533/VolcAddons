import settings from "../settings";
import { GUI_INSTRUCT, ITALIC } from "./constants";
import { registerWhen } from "./variables";
import { getWorld } from "./worlds";


/**
 * Render scaled text on a graphical canvas or rendering context.
 *
 * @param {number} scale - The scale factor to apply to the text.
 * @param {string} text - The text to be rendered.
 * @param {number} x - The x-coordinate where the text will be rendered.
 * @param {number} y - The y-coordinate where the text will be rendered.
 */
function renderScale(scale, text, x, y) {
    Renderer.scale(scale);
    Renderer.drawString(text, x, y);
    // new Text(text, x, y).setAlign("right").draw();
}

/**
 * Variables used to move all active GUIs.
 */
const overlays = [];
let currentOverlay = undefined;
const gui = new Gui();
const background = new Gui();
export function openGUI() { gui.open() };

/**
 * This function handles rendering of overlays on the GUI if it's open.
 * It iterates through each overlay in the "overlays" array and performs the following steps:
 * - If the overlay's setting is enabled in the settings and the GUI is open, it proceeds to draw.
 * - It draws a background rectangle around the overlay using the overlay's location and size.
 * - It calls the "renderScale" function to render the example text of the overlay.
 * Additionally, the function renders GUI instructions at the center of the screen.
 */
register("renderOverlay", () => {
    if (!gui.isOpen()) return;
    
    overlays.forEach(overlay => {
        if (!settings[overlay.setting]) return;
        // Draw example text
        Renderer.drawRect(
            Renderer.color(69, 69, 69, 169),
            overlay.loc[0] - 3*overlay.loc[2], overlay.loc[1] - 3*overlay.loc[2],
            overlay.width + 6*overlay.loc[2], overlay.height + 6*overlay.loc[2]
        );
        renderScale(overlay.loc[2], overlay.example, overlay.X, overlay.Y);
    });

    // GUI Instructions
    renderScale(
        1.2, GUI_INSTRUCT,
        Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(GUI_INSTRUCT) / 1.2,
        Renderer.screen.getHeight() / 2.4,
    );
});

/**
 * This function is responsible for handling overlay selection when clicking on the screen.
 * It first checks if the GUI is open; if not, it returns. It then sets the currentOverlay to undefined.
 * For each overlay in the "overlays" array, it checks if the click coordinates (x, y) are within
 * the bounds of the overlay. If the click is within the bounds, the currentOverlay is set to the overlay.
 *
 * @param {number} x - The x-coordinate of the mouse click.
 * @param {number} y - The y-coordinate of the mouse click.
 * @param {number} button - The mouse button pressed during the interaction.
 * @param {object} screen - The screen object associated with the interaction.
 */
register("guiMouseClick", (x, y, button, screen) => {
    if (!gui.isOpen()) return;
    currentOverlay = undefined;

    overlays.forEach(overlay => {
        if (x > overlay.loc[0] - 3*overlay.loc[2] &&
            x < overlay.loc[0] + 3*overlay.loc[2] + overlay.width &&
            y > overlay.loc[1] - 3*overlay.loc[2] &&
            y < overlay.loc[1] + 3*overlay.loc[2] + overlay.height
        ) currentOverlay = overlay;
    });
});

/**
 * This function handles the movement of the currently selected overlay.
 * It first checks if there's a currentOverlay selected and if the GUI is open; if not, it returns.
 * If the GUI is open, it updates the location of the currentOverlay based on the change in coordinates (dx, dy).
 * It also recalculates the normalized X and Y coordinates based on the new location.
 *
 * @param {number} dx - The change in x-coordinate during the movement.
 * @param {number} dy - The change in y-coordinate during the movement.
 * @param {number} x - The x-coordinate of the mouse pointer during the movement.
 * @param {number} y - The y-coordinate of the mouse pointer during the movement.
 */
register("dragged", (dx, dy, x, y) => {
    if (currentOverlay === undefined || !gui.isOpen()) return;

    if (gui.isOpen()) {
        // Changes location of text
        currentOverlay.loc[0] += dx;
        currentOverlay.loc[1] += dy;
        currentOverlay.X = currentOverlay.loc[0] / currentOverlay.loc[2];
        currentOverlay.Y = currentOverlay.loc[1] / currentOverlay.loc[2];
    }
});

/**
 * This function handles the scaling of the currently selected overlay using key presses.
 * It first checks if there's a currentOverlay selected and if the GUI is open; if not, it returns.
 * It then listens for specific key codes:
 * - 13 (Enter key): Increases the scale of the currentOverlay by 0.05.
 * - 12 (Minus key): Decreases the scale of the currentOverlay by 0.05.
 * - 19 (r key): Resets the scale of the currentOverlay to 1.
 * After each scaling operation, the normalized X and Y coordinates are updated based on the new scale,
 * and the "setSize" method of the currentOverlay is called.
 *
 * @param {string} char - The character associated with the pressed key.
 * @param {number} keyCode - The key code of the pressed key.
 * @param {object} currentGui - The current GUI object.
 * @param {object} event - The event object associated with the key press.
 */
register("guiKey", (char, keyCode, currentGui, event) => {
    if (currentOverlay === undefined || !gui.isOpen()) return;
    
    if (keyCode === 13) {  // Increase Scale (+ key)
        currentOverlay.loc[2] += 0.05;
        currentOverlay.X = currentOverlay.loc[0] / currentOverlay.loc[2];
        currentOverlay.Y = currentOverlay.loc[1] / currentOverlay.loc[2];
    } else if (keyCode === 12) {  // Decrease Scale (- key)
        currentOverlay.loc[2] -= 0.05;
        currentOverlay.X = currentOverlay.loc[0] / currentOverlay.loc[2];
        currentOverlay.Y = currentOverlay.loc[1] / currentOverlay.loc[2];
    } else if (keyCode === 19) {  // Reset Scale (r key)
        currentOverlay.loc[2] = 1;
        currentOverlay.X = currentOverlay.loc[0];
        currentOverlay.Y = currentOverlay.loc[1];
    }
    currentOverlay.setSize();
});

export class Overlay {
    /**
     * Creates an overlay with HUD elements and GUI functionality.
     *
     * @param {string} setting - The setting key used to determine whether the overlay should be shown.
     * @param {string[]} requires - An array of world names where the overlay should be displayed (or "all" for all requires).
     * @param {number[]} loc - An array representing the x, y, and scale of the overlay.
     * @param {string} command - The command name that will open the GUI.
     * @param {string} example - An example text to be displayed as an overlay.
     */
    constructor(setting, requires, condition, loc, command, example) {
        overlays.push(this);
        // Store the inputs as instance variables.
        this.setting = setting;
        this.requires = new Set(requires);
        this.loc = loc;
        this.X = this.loc[0] / this.loc[2];
        this.Y = this.loc[1] / this.loc[2];
        this.example = example;
        this.message = example;
        this.gui = new Gui();
        this.setSize();

        // Register a command to open the GUI when executed.
        register("command", () => {
            this.gui.open();
        }).setName(command);

        // Register a render function to display the overlay and GUI instructions.
        // The overlay is shown when the GUI is open or in requires specified in 'requires' array.'
        registerWhen(register(this.requires.has("misc") ? "postGuiRender" : "renderOverlay", () => {
            if (this.gui.isOpen()) {
                // Coords and scale
                renderScale(
                    this.loc[2],
                    `${ITALIC}x: ${Math.round(this.loc[0])}, y: ${Math.round(this.loc[1])}, s: ${this.loc[2].toFixed(2)}`,
                    this.X, this.Y - 10
                );
                Renderer.drawLine(Renderer.WHITE, this.loc[0], 1, this.loc[0], Renderer.screen.getHeight(), 0.5);
                Renderer.drawLine(Renderer.WHITE, Renderer.screen.getWidth(), this.loc[1], 1, this.loc[1], 0.5);

                // Draw example text
                renderScale(this.loc[2], this.example, this.X, this.Y);

                // GUI Instructions
                renderScale(
                    1.2, GUI_INSTRUCT,
                    Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(GUI_INSTRUCT) / 1.2,
                    Renderer.screen.getHeight() / 2.4,
                );
            } else if (settings[this.setting] && condition() && (this.requires.has(getWorld()) || this.requires.has("all")) && !gui.isOpen()) {
                if (this.requires.has("misc")) {
                    background.func_146278_c(0);
                    renderScale(this.loc[2], this.message, this.X, this.Y);
                } else  // Draw HUD
                    renderScale(this.loc[2], this.message, this.X, this.Y);
            }
        }), () => true);

        register("dragged", (dx, dy, x, y) => {
            if (this.gui.isOpen()) {
                // Changes location of text
                this.loc[0] = parseInt(x);
                this.loc[1] = parseInt(y);
                this.X = this.loc[0] / this.loc[2];
                this.Y = this.loc[1] / this.loc[2];
            }
        });
        
        register("guiKey", (char, keyCode, guiScreen, event) => {
            if (this.gui.isOpen()) {
                if (keyCode === 13) {  // Increase Scale (+ key)
                    this.loc[2] += 0.05;
                    this.X = this.loc[0] / this.loc[2];
                    this.Y = this.loc[1] / this.loc[2];
                } else if (keyCode === 12) {  // Decrease Scale (- key)
                    this.loc[2] -= 0.05;
                    this.X = this.loc[0] / this.loc[2];
                    this.Y = this.loc[1] / this.loc[2];
                } else if (keyCode === 19) {  // Reset Scale (r key)
                    this.loc[2] = 1;
                    this.X = this.loc[0];
                    this.Y = this.loc[1];
                }
            }
        });
    }

    /**
     * This method calculates and sets the dimensions (width and height) of the overlay based on its example text.
     * It first splits the example text into lines and calculates the total height based on the number of lines and scaling.
     * Then, for each line, it extracts bold portions using a regular expression and calculates the total width by combining
     * the widths of bold and non-bold portions of the line. The maximum width across all lines is stored in this.width.
     */
    setSize() {
        const lines = this.example.split("\n");
        this.width = 0;
        this.height = lines.length * 9 * this.loc[2];
        lines.forEach(line => {
            const regex = /&l(.*?)(?:&|$)/g;
            const matches = [];
            let match;

            while ((match = regex.exec(line)) !== null) matches.push(match[1]);

            const width = 1.1*Renderer.getStringWidth(matches.join('')) + Renderer.getStringWidth(line.replace(regex, ''));
            this.width = Math.max(this.width, width * this.loc[2]);
        });
    }
}
