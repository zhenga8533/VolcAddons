import location from "./location";
import settings from "./settings";
import { GREEN, ITALIC, LOGO } from "./constants";
import { registerWhen } from "./register";


/**
 * Render scaled text on a graphical canvas or rendering context.
 *
 * @param {Number} x - The x-coordinate where the text will be rendered.
 * @param {Number} y - The y-coordinate where the text will be rendered.
 * @param {String} text - The text to be rendered.
 * @param {Number} scale - The scale factor to apply to the text.
 * @param {Boolean} align - True for right align, or false for left align.
 * @param {Boolean} flex - True for vertical flex, or false for horizontal flex.
 */
function renderScale(x, y, text, scale=1, align=false, flex=false) {
    // Apply parameters
    x /= scale;
    y /= scale;
    if (flex) text = text.replace(/\n/g, "  ");

    // Scale and render
    Renderer.scale(scale);
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
    overlays.forEach(o => {
        if (!settings[o.setting]) return;

        // Draw example text and box
        const scale = o.loc[2];
        const x = o.loc[0] - (o.loc[3] ? o.ewidth : 0);
        const y = o.loc[1];

        Renderer.drawRect(
            o.loc[5] ? Renderer.color(0, 0, 0, 128) : Renderer.color(128, 128, 128, 128),
            x - 3 * scale, y - 3 * scale,
            o.ewidth + 6 * scale, o.eheight + 6 * scale
        );
        renderScale(o.loc[0], o.loc[1], o.example, o.loc[2], o.loc[3], o.loc[4]);
    });

    // GUI Instructions
    renderScale((Renderer.screen.getWidth() - INSTRUCT_WIDTH) / 2, Renderer.screen.getHeight() / 2, GUI_INSTRUCT, 1);
}).unregister();

/**
 * Handles overlay selection when clicking on the screen.
 */
const clicking = register("guiMouseClick", (x, y) => {
    currentOverlay = overlays.find(o => {
        const scale = o.loc[2];
        const oX = o.loc[0] - (o.loc[3] ? o.ewidth : 0);
        const oY = o.loc[1];

        return x > oX - 3 * scale &&
            x < oX + o.ewidth + 3 * scale &&
            y > oY - 3 * scale &&
            y < oY + o.eheight + 3 * scale;
    });
}).unregister();

/**
 * Handles movement of the selected overlay.
 */
const dragging = register("dragged", (dx, dy) => {
    if (currentOverlay === undefined || !gui.isOpen()) return;

    currentOverlay.loc[0] += parseInt(dx);
    currentOverlay.loc[1] += parseInt(dy);
}).unregister();

/**
 * Handles scaling of the selected overlay using key presses.
 */
const keying = register("guiKey", (_, keyCode) => {
    // View Change
    if (keyCode === 17) {
        worldView = !worldView;
        if (worldView) {
            overlays = overlays.filter(overlay => {
                if (!overlay.requires.has("all") && !overlay.requires.has(location.getWorld())) {
                    overlaid.push(overlay);
                    return false;
                }
                return true;
            });
            ChatLib.chat(`${LOGO + GREEN}Successfully changed to world view!`);
        } else {
            overlays.push(...overlaid);
            overlaid = [];
            ChatLib.chat(`${LOGO + GREEN}Successfully changed to global view!`);
        }
    } else if (keyCode === 1) {
        currentOverlay = undefined;
        moving.unregister();
        clicking.unregister();
        dragging.unregister();
        keying.unregister();
        return;
    }
    
    if (currentOverlay !== undefined)
        currentOverlay.handleKey(keyCode);
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
     * @param {Type[]} loc - An array representing [x, y, scale, align, flex, background] of the overlay.
     * @param {String} command - The command name that will open the GUI.
     * @param {String} example - The example text to be displayed when editing the GUI.
     * @param {String[]} requires - An array of world names where the overlay should be displayed or ["all"] if it should render everywhere.
     * @param {String} trigger - Type of trigger to use for the rendering register.
     * @param {Function} special - Special rendering function to optional be used in place of text rendering. Should return true if used.
     */
    constructor(setting, loc, command, example = "Test", requires = ["all"], trigger = "renderOverlay", special = () => false) {
        overlays.push(this);

        // Update private variables
        this.setting = setting;
        this.loc = loc;
        this.message = "";
        this.width = 0;
        this.height = 0;
        this.example = example;
        this.setSize("example");
        this.requires = new Set(requires);
        this.gui = new Gui();

        // loc array changes for versions < 2.9.4
        if (this.loc[3] === undefined) this.loc.push(false);
        if (this.loc[4] === undefined) this.loc.push(false);
        if (this.loc[5] === undefined) this.loc.push(false);

        // The actual rendering register for the GUI.
        registerWhen(register(trigger, () => {
            if (!special() && !gui.isOpen() && !this.gui.isOpen() && this.message) {
                if (trigger === "renderOverlay") background.func_146278_c(0);
                if (this.loc[5] && this.width !== 0) {
                    Renderer.drawRect(
                        Renderer.color(0, 0, 0, 128),
                        this.loc[0] - (this.loc[3] ? this.ewidth : 0) - 3 * this.loc[2], this.loc[1] - 3 * this.loc[2],
                        this.width + 6 * this.loc[2], this.height + 6 * this.loc[2]
                    );
                }
                renderScale(this.loc[0], this.loc[1], this.message, this.loc[2], this.loc[3], this.loc[4]);
            }
        }), () => settings[this.setting] && (this.requires.has(location.getWorld()) || this.requires.has("all")));

        // Set registers for editing the GUI.
        this.moving = register("renderOverlay", () => {
            const width = Renderer.screen.getWidth();
            const height = Renderer.screen.getHeight();

            // Coords and scale
            const coords = `${ITALIC}x: ${Math.round(this.loc[0])}, y: ${Math.round(this.loc[1])}, s: ${this.loc[2].toFixed(2)}`;
            const align = this.loc[0] + Renderer.getStringWidth(coords) > width;
            renderScale(this.loc[0] + (align ? -2 : 2), this.loc[1] - 10, coords, 1, align);

            Renderer.drawLine(Renderer.WHITE, this.loc[0], 1, this.loc[0], height, 0.5);
            Renderer.drawLine(Renderer.WHITE, width, this.loc[1], 1, this.loc[1], 0.5);

            // Draw example text
            if (this.loc[5]) {
                Renderer.drawRect(
                    Renderer.color(0, 0, 0, 128),
                    this.loc[0] - (this.loc[3] ? this.ewidth : 0) - 3 * this.loc[2], this.loc[1] - 3 * this.loc[2],
                    this.ewidth + 6 * this.loc[2], this.eheight + 6 * this.loc[2]
                );
            }
            renderScale(this.loc[0], this.loc[1], this.example, this.loc[2], this.loc[3], this.loc[4]);

            // GUI Instructions
            renderScale((width - INSTRUCT_WIDTH) / 2, height / 2, GUI_INSTRUCT, 1);
        }).unregister();

        // Register editing stuff
        this.dragging = register("dragged", (_, __, x, y) => {
            this.loc[0] = parseInt(x);
            this.loc[1] = parseInt(y);
        }).unregister();
        
        this.keying = register("guiKey", (_, keyCode) => {
            if (keyCode === 1) {
                this.moving.unregister();
                this.dragging.unregister();
                this.keying.unregister();
            } else this.handleKey(keyCode);
        }).unregister();

        // Register a command to open the GUI when executed.
        register("command", () => {
            this.gui.open();
            this.moving.register();
            this.dragging.register();
            this.keying.register();
        }).setName(command);
    }

    handleKey(keyCode) {
        if (keyCode === 13) this.loc[2] = Math.round((this.loc[2] + 0.05) * 100) / 100;  // Increase Scale (+ key)
        else if (keyCode === 12) this.loc[2] = Math.round((this.loc[2] - 0.05) * 100) / 100;  // Decrease Scale (- key)
        else if (keyCode === 19) this.loc[2] = 1;  // Reset Scale (r key)
        else if (keyCode === 38) this.loc[3] = !this.loc[3];  // Swap align (l key)
        else if (keyCode === 35) this.loc[4] = !this.loc[4];  // Swap flex (h key)
        else if (keyCode === 48) his.loc[5] = !this.loc[5];  // Swap flex (b key)
        else return;

        this.setSize("message");
        this.setSize("example");
    }

    /**
     * Replaces current overlay message with provided message.
     * 
     * @param {String} message - Message to be updated to.
     */
    setMessage(message) {
        this.message = message;
        this.setSize("message");
    }

    /**
     * Sets width and height of overlay.
     * Fixes getStringWidth not setting bolded size correctly.
     */
    setSize(type) {
        // Set flex size
        let message = type === "message" ? this.message : this.example;
        message = this.loc[4] ? message.replace(/\n/g, "  ") : message;
        const lines = message?.split("\n");

        // Check if message is not empty
        if (!(lines?.length)) {
            if (type === "message") {
                this.width = 0;
                this.height = 0;
            } else {
                this.ewidth = 0;
                this.eheight = 0;
            }
            return;
        }

        // Set message height
        if (type === "message") this.height = lines.length * 8.8 * this.loc[2];
        else this.eheight = lines.length * 8.8 * this.loc[2];

        // Find line with largest width
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

        // Set message width
        if (type === "message") this.width = maxWidth * this.loc[2];
        else this.ewidth = maxWidth * this.loc[2];
    }
}
