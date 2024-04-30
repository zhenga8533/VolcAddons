import location from "./location";
import settings from "./settings";
import { GREEN, ITALIC, LOGO } from "./constants";
import { registerWhen } from "./register";


/**
 * Render scaled text on a graphical canvas or rendering context.
 *
 * @param {Number} scale - The scale factor to apply to the text.
 * @param {String} text - The text to be rendered.
 * @param {Number} x - The x-coordinate where the text will be rendered.
 * @param {Number} y - The y-coordinate where the text will be rendered.
 */
function renderScale(scale, text, x, y, align, flex) {
    Renderer.scale(scale);
    if (flex) text = text.replace(/\n/g, "  ");
    if (align) new Text(text.replace(/&l/g, ''), x, y).setAlign("right").setShadow(settings.textShadow).draw();
    else Renderer.drawString(text, x, y, settings.textShadow);
}

/**
 * Variables used to move all active GUIs.
 */
const GUI_INSTRUCT = "Use +/- to scale, R to reset, L to swap align, H to swap flex, B to show BG, or W to change view";
const INSTRUCT_WIDTH = Renderer.getStringWidth(GUI_INSTRUCT);
const gui = new Gui();
const background = new Gui();

let overlays = [];
let overlaid = [];
let currentOverlay = undefined;
let worldView = false;

/**
 * Renders overlays on the GUI if it's open.
 */
const moving = register("renderOverlay", () => {
    overlays.forEach(overlay => {
        if (!settings[overlay.setting]) return;
        // Draw example text and box
        const scale = overlay.loc[2];
        const x = overlay.loc[0] - (overlay.loc[3] ? (overlay.eWidth - 3) * scale : 0);
        const y = overlay.loc[1];

        Renderer.drawRect(
            overlay.loc[5] ? Renderer.color(0, 0, 0, 128) : Renderer.color(128, 128, 128, 128),
            x - 3*scale, y - 3*scale,
            (overlay.eWidth + 6) * scale, (overlay.eHeight + 6) * scale
        );
        renderScale(overlay.loc[2], overlay.example, overlay.X, overlay.Y, overlay.loc[3], overlay.loc[4]);
    });

    // GUI Instructions
    renderScale(
        1.2, GUI_INSTRUCT,
        (Renderer.screen.getWidth() - INSTRUCT_WIDTH * 1.4) / 2,
        Renderer.screen.getHeight() * 0.6, false, false
    );
}).unregister();

/**
 * Handles overlay selection when clicking on the screen.
 */
const clicking = register("guiMouseClick", (x, y) => {
    currentOverlay = undefined;

    overlays.forEach(overlay => {
        const scale = overlay.loc[2];
        const oX = overlay.loc[0] - (overlay.loc[3] ? (overlay.eWidth - 3) * scale : 0);
        const oY = overlay.loc[1];

        if (x > oX - 3 * scale &&
            x < oX + 3 * (scale + overlay.eWidth) &&
            y > oY - 3 * scale &&
            y < oY + 3 * (scale + overlay.eHeight)
        ) currentOverlay = overlay;
    });
}).unregister();

/**
 * Handles movement of the selected overlay.
 * Updates location and normalized coordinates based on delta coordinates.
 */
const dragging = register("dragged", (dx, dy, x, y) => {
    if (currentOverlay === undefined || !gui.isOpen()) return;

    if (gui.isOpen()) {
        // Changes location of text
        currentOverlay.loc[0] += dx;
        currentOverlay.loc[1] += dy;
        currentOverlay.X = currentOverlay.loc[0] / currentOverlay.loc[2];
        currentOverlay.Y = currentOverlay.loc[1] / currentOverlay.loc[2];
    }
}).unregister();

/**
 * Handles scaling of the selected overlay using key presses.
 * Listens for specific keys: Enter (increase), Minus (decrease), r (reset).
 * Updates normalized coordinates and calls "setSize" after scaling.
 */
const keying = register("guiKey", (char, keyCode, currentGui, event) => {
    // View Change
    if (keyCode === 17) {
        worldView = !worldView;
        if (worldView) {
            overlays = overlays.filter(overlay => {
                if (!overlay.requires.has(location.getWorld()) && !overlay.requires.has("all")) {
                    overlaid.push(overlay);
                    return false;
                }
                return true;
            });
            ChatLib.chat(`${LOGO + GREEN}Successfully changed to world view!`);
        } else {
            overlays.push(...overlaid);
            overlaid.length = 0;
            ChatLib.chat(`${LOGO + GREEN}Successfully changed to global view!`);
        }
    } else if (keyCode === 1) {
        moving.unregister();
        clicking.unregister();
        dragging.unregister();
        keying.unregister();
    }
    
    if (currentOverlay === undefined) return;
    if (keyCode === 13) {  // Increase Scale (+ key)
        currentOverlay.loc[2] = Math.round((currentOverlay.loc[2] + 0.05) * 100) / 100;
        currentOverlay.X = currentOverlay.loc[0] / currentOverlay.loc[2];
        currentOverlay.Y = currentOverlay.loc[1] / currentOverlay.loc[2];
    } else if (keyCode === 12) {  // Decrease Scale (- key)
        currentOverlay.loc[2] = Math.round((currentOverlay.loc[2] - 0.05) * 100) / 100;
        currentOverlay.X = currentOverlay.loc[0] / currentOverlay.loc[2];
        currentOverlay.Y = currentOverlay.loc[1] / currentOverlay.loc[2];
    } else if (keyCode === 19) {  // Reset Scale (r key)
        currentOverlay.loc[2] = 1;
        currentOverlay.X = currentOverlay.loc[0];
        currentOverlay.Y = currentOverlay.loc[1];
    } else if (keyCode === 38) {  // Swap align (l key)
        currentOverlay.loc[3] = !currentOverlay.loc[3];
    } else if (keyCode === 35) {  // Swap flex (h key)
        currentOverlay.loc[4] = !currentOverlay.loc[4];
    } else if (keyCode === 48) {  // Set BG (b key)
        currentOverlay.loc[5] = !currentOverlay.loc[5];
    } else return;

    currentOverlay.setSize();
}).unregister();

/**
 * Opens gui to move all overlays
 */
export function openGUI() {
    gui.open();
    moving.register();
    clicking.register();
    dragging.register();
    keying.register();
};


export class Overlay {
    /**
     * Creates an overlay with HUD elements and GUI functionality.
     *
     * @param {String} setting - The setting key used to determine whether the overlay should be shown.
     * @param {String[]} requires - An array of world names where the overlay should be displayed (or "all" for all requires).
     * @param {Function} condition - Function to check if condition is met before rendering.
     * @param {Number[]} loc - An array representing the x, y, and scale of the overlay.
     * @param {String} command - The command name that will open the GUI.
     * @param {String} example - An example text to be displayed as an overlay.
     */
    constructor(setting, requires, condition, loc, command, example, special = () => false) {
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

        // Set size for background rendering
        this.setSize(this.message, "message");
        this.setSize(this.example, "example");

        // loc array changes for versions < 2.9.4
        if (this.loc[3] === undefined) this.loc.push(false);
        if (this.loc[4] === undefined) this.loc.push(false);
        if (this.loc[5] === undefined) this.loc.push(false);

        // Register a render function to display the overlay and GUI instructions.
        // The overlay is shown when the GUI is open or in requires specified in 'requires' array.'
        this.moving = register("renderOverlay", () => {
            const width = Renderer.screen.getWidth();
            const height = Renderer.screen.getHeight();

            // Coords and scale
            const coords = `${ITALIC}x: ${Math.round(this.loc[0])}, y: ${Math.round(this.loc[1])}, s: ${this.loc[2].toFixed(2)}`;
            const coordsWidth = Renderer.getStringWidth(coords);
            const aligning = this.loc[0] + coordsWidth > width;
            renderScale(this.loc[2], coords, this.X + (aligning ? -2 : 2), this.Y - 10, aligning, false);
            Renderer.drawLine(Renderer.WHITE, this.loc[0], 1, this.loc[0], height, 0.5);
            Renderer.drawLine(Renderer.WHITE, width, this.loc[1], 1, this.loc[1], 0.5);

            // Draw example text
            if (this.loc[5] && this.width !== 0)
                Renderer.drawRect(
                    Renderer.color(0, 0, 0, 128),
                    this.loc[0] - 3 *  this.loc[2], this.loc[1] - 3 * this.loc[2],
                    (this.eWidth + 6) * this.loc[2], (this.eHeight + 6) * this.loc[2]
                );
            renderScale(this.loc[2], this.example, this.X, this.Y, this.loc[3], this.loc[4]);

            // GUI Instructions
            renderScale(
                1.2, GUI_INSTRUCT,
                (width - INSTRUCT_WIDTH * 1.4) / 2,
                height / 2.4, false, false
            );
        }).unregister();

        registerWhen(register(this.requires.has("misc") ? "guiRender" : "renderOverlay", () => {
            if (!special() && condition() && !gui.isOpen() && !this.gui.isOpen() && this.message) {
                if (this.requires.has("misc")) background.func_146278_c(0);
                if (this.loc[5] && this.width !== 0)
                    Renderer.drawRect(
                        Renderer.color(0, 0, 0, 128),
                        this.loc[0] - 3 * this.loc[2], this.loc[1] - 3 * this.loc[2],
                        (this.width + 6) * this.loc[2], (this.height + 6) * this.loc[2]
                    );
                renderScale(this.loc[2], this.message, this.X, this.Y, this.loc[3], this.loc[4]);
            }
        }), () => settings[this.setting] && (this.requires.has(location.getWorld()) || this.requires.has("all")));

        // Register editing stuff
        this.dragging = register("dragged", (dx, dy, x, y) => {
            if (this.gui.isOpen()) {
                // Changes location of text
                this.loc[0] = parseInt(x);
                this.loc[1] = parseInt(y);
                this.X = this.loc[0] / this.loc[2];
                this.Y = this.loc[1] / this.loc[2];
            }
        }).unregister();
        
        this.keying = register("guiKey", (char, keyCode, guiScreen, event) => {
            if (this.gui.isOpen()) {
                if (keyCode === 13) {  // Increase Scale (+ key)
                    this.loc[2] = Math.round((this.loc[2] + 0.05) * 100) / 100;
                    this.X = this.loc[0] / this.loc[2];
                    this.Y = this.loc[1] / this.loc[2];
                } else if (keyCode === 12) {  // Decrease Scale (- key)
                    this.loc[2] = Math.round((this.loc[2] - 0.05) * 100) / 100;
                    this.X = this.loc[0] / this.loc[2];
                    this.Y = this.loc[1] / this.loc[2];
                } else if (keyCode === 19) {  // Reset Scale (r key)
                    this.loc[2] = 1;
                    this.X = this.loc[0];
                    this.Y = this.loc[1];
                } else if (keyCode === 38) {  // Swap align (l key)
                    this.loc[3] = !this.loc[3];
                } else if (keyCode === 35) {  // Swap flex (h key)
                    this.loc[4] = !this.loc[4];
                } else if (keyCode === 48) {  // Swap flex (b key)
                    this.loc[5] = !this.loc[5];
                } else if (keyCode === 1) {
                    this.moving.unregister();
                    this.dragging.unregister();
                    this.keying.unregister();
                } else return;

                this.setSize(this.message, "message");
            }
        }).unregister();

        // Register a command to open the GUI when executed.
        register("command", () => {
            this.gui.open();
            this.moving.register();
            this.dragging.register();
            this.keying.register();
        }).setName(command);
    }

    /**
     * Replaces current overlay message with provided message.
     * 
     * @param {String} message - Message to be updated to.
     */
    setMessage(message) {
        this.message = message;
        this.setSize(this.message, "message");
    }

    /**
     * Sets width and height of overlay.
     * Fixes getStringWidth not setting bolded size correctly.
     */
    setSize(message, type) {
        const lines = message?.split("\n");
        if (!(lines?.length)) return;

        if (type === "message") this.height = lines.length * 9;
        else this.eHeight = lines.length * 9;

        let maxWidth = 0;
        lines.forEach(line => {
            if (line.includes('§l')) {
                const splitLine = line.split('§l');
                let stringWidth = 0;

                for (let i = 0; i < splitLine.length; i++) {
                    if (i % 2 === 0) stringWidth += Renderer.getStringWidth(splitLine[i]);
                    else {
                        let clearIndex = splitLine[i].indexOf("§");
                        let boldedString = clearIndex !== -1 ? splitLine[i].substring(0, clearIndex) : splitLine[i];
                        let unboldedString = clearIndex !== -1 ? splitLine[i].substring(clearIndex, splitLine[i].length) : "";
                        stringWidth += Renderer.getStringWidth(boldedString) * 1.2 + Renderer.getStringWidth(unboldedString);
                    }
                }

                maxWidth = Math.max(maxWidth, stringWidth);
            } else maxWidth = Math.max(maxWidth, Renderer.getStringWidth(line));
        });

        if (type === "message") this.width = maxWidth;
        else this.eWidth = maxWidth;
    }
}
