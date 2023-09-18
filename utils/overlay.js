import settings from "./settings";
import { GREEN, ITALIC, LOGO } from "./constants";
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
const GUI_INSTRUCT = "Use +/- to scale, R to reset, or W to change view";
const gui = new Gui();
export function openGUI() { gui.open() };
const background = new Gui();

let overlays = [];
let overlaid = [];
let currentOverlay = undefined;
let worldView = false;

/**
 * Renders overlays on the GUI if it's open.
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
 * Handles overlay selection when clicking on the screen.
 *
 * @param {number} x - X-coordinate of the mouse click.
 * @param {number} y - Y-coordinate of the mouse click.
 * @param {number} button - Mouse button pressed during the interaction.
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
 * Handles movement of the selected overlay.
 * Updates location and normalized coordinates based on delta coordinates.
 *
 * @param {number} dx - Change in x-coordinate during movement.
 * @param {number} dy - Change in y-coordinate during movement.
 * @param {number} x - X-coordinate of mouse pointer during movement.
 * @param {number} y - Y-coordinate of mouse pointer during movement.
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
 * Handles scaling of the selected overlay using key presses.
 * Listens for specific keys: Enter (increase), Minus (decrease), r (reset).
 * Updates normalized coordinates and calls "setSize" after scaling.
 *
 * @param {string} char - Pressed key character.
 * @param {number} keyCode - Key code of the pressed key.
 * @param {object} currentGui - Current GUI object.
 * @param {object} event - Event object for key press.
 */
register("guiKey", (char, keyCode, currentGui, event) => {
    if (!gui.isOpen()) return;
    
    // View Change
    if (keyCode === 17) {
        worldView = !worldView;
        if (worldView === true) {
            overlays = overlays.filter(overlay => {
                if (!overlay.requires.has(getWorld()) && !overlay.requires.has("all")) {
                    overlaid.push(overlay);
                    return false;
                }
                return true;
            });
            ChatLib.chat(`${LOGO} ${GREEN}Successfully changed to world view!`);
        } else {
            overlays.push(...overlaid);
            overlaid.length = 0;
            ChatLib.chat(`${LOGO} ${GREEN}Successfully changed to global view!`);
        }
    }
    
    if (currentOverlay === undefined) return;
    
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
     * @param {function} condition - Function to check if condition is met before rendering.
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
     * Calculates and sets overlay dimensions based on example text.
     * Splits text into lines, calculates total height, and determines width for each line.
     * Maximum width across lines is stored in `this.width`.
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
