import { GREEN, ITALIC, LOGO } from "./Constants";
import location from "./Location";
import Settings from "./Settings";
import { drawBox, renderScale } from "./functions/render";

/**
 * Variables used to move all active GUIs.
 */
const gui = new Gui();

const BORDER_COLOR = Renderer.color(128, 128, 128, 128);
const RECT_COLOR = Renderer.color(0, 0, 0, 128);
const EDIT_COLOR = Renderer.color(64, 64, 64, 128);
const HOVER_BOX = Renderer.color(0, 255, 255, 64);
const HOVER_BORDER = Renderer.color(0, 255, 255, 255);
const EDIT_BOX = Renderer.color(255, 255, 0, 64);
const EDIT_BORDER = Renderer.color(255, 255, 0, 255);

let overlays = [];
let overlaid = [];
let currentOverlay = undefined;
let guiView = 0;

/**
 * Renders overlays on the GUI if it's open.
 */
const moving = register("renderOverlay", () => {
  if (!Settings.vaToggle) return;

  // Hover detection
  let hovered = false;
  const mouseX = Client.getMouseX();
  const mouseY = Client.getMouseY();

  overlays.forEach((o) => {
    if (!Settings[o.setting]) return;

    // Draw example text and box
    const scale = o.loc[2];
    const editing = o === currentOverlay;
    const x = o.loc[0] - (o.loc[3] ? o.ewidth : 0);
    const y = o.loc[1];
    const highlight =
      !hovered &&
      mouseX > x - 3 * scale &&
      mouseX < x + o.ewidth + 3 * scale &&
      mouseY > y - 3 * scale &&
      mouseY < y + o.eheight + 3 * scale;
    if (highlight) hovered = true;

    drawBox(
      x - 3 * scale,
      y - 3 * scale,
      0,
      o.ewidth + 5 * scale,
      o.eheight + 5 * scale,
      editing ? EDIT_BOX : highlight ? HOVER_BOX : o.loc[5] ? RECT_COLOR : EDIT_COLOR,
      editing ? EDIT_BORDER : highlight ? HOVER_BORDER : BORDER_COLOR
    );
    renderScale(o.loc[0], o.loc[1], o.example, o.loc[2], o.loc[3], o.loc[4], 0);
  });
}).unregister();

/**
 * Handles overlay selection when clicking on the screen.
 */
const clicking = register("guiMouseClick", (x, y, button) => {
  const clicked = overlays.find((o) => {
    const scale = o.loc[2];
    const oX = o.loc[0] - (o.loc[3] ? o.ewidth : 0);
    const oY = o.loc[1];

    return x > oX - 3 * scale && x < oX + o.ewidth + 3 * scale && y > oY - 3 * scale && y < oY + o.eheight + 3 * scale;
  });

  if (button === 0) currentOverlay = clicked;
  else if (button === 1 && clicked !== undefined) overlays.splice(overlays.indexOf(clicked), 1);
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
    guiView = (guiView + 1) % 5;
    if (guiView === 0) {
      // All
      overlays = [...overlaid];
      ChatLib.chat(`${LOGO + GREEN}Successfully changed to global view!`);
    } else if (guiView === 1) {
      // World
      overlays = overlaid.filter((overlay) => overlay.requires.has("all") || overlay.requires.has(location.getWorld()));
      ChatLib.chat(`${LOGO + GREEN}Successfully changed to world view!`);
    } else if (guiView === 2) {
      // Visible
      overlays = overlays.filter((overlay) => overlay.message !== "");
      ChatLib.chat(`${LOGO + GREEN}Successfully changed to visible view!`);
    } else if (guiView === 3) {
      // Overlay
      overlays = overlaid.filter((overlay) => overlay.trigger === "renderOverlay");
      ChatLib.chat(`${LOGO + GREEN}Successfully changed to overlay view!`);
    } else if (guiView === 4) {
      // GUI
      overlays = overlaid.filter((overlay) => overlay.trigger === "guiRender");
      ChatLib.chat(`${LOGO + GREEN}Successfully changed to GUI view!`);
    }
  } else if (keyCode === 1) {
    currentOverlay = undefined;
    moving.unregister();
    clicking.unregister();
    dragging.unregister();
    keying.unregister();
    overlays = overlaid;
    guiView = 0;
    return;
  }

  if (currentOverlay !== undefined) currentOverlay.handleKey(keyCode);
}).unregister();

/**
 * Opens gui to move all overlays
 */
export function openGUI() {
  overlaid = [...overlays];
  gui.open();
  moving.register();
  clicking.register();
  dragging.register();
  keying.register();
}

/**
 * Overlay render in one register
 */
const renders = {
  guiRender: [],
  renderOverlay: [],
};
Object.keys(renders).forEach((key) => {
  register(key, () => {
    if (!Settings.vaToggle) return;

    renders[key].forEach((render) => {
      if (Settings[render.setting] && !render.special() && !gui.isOpen() && !render.gui.isOpen() && render.message) {
        if (!(render.requires.has(location.getWorld()) || render.requires.has("all"))) return;

        if (render.loc[5] && render.width !== 0) {
          drawBox(
            render.loc[0] - (render.loc[3] ? render.ewidth : 0) - 3 * render.loc[2],
            render.loc[1] - 3 * render.loc[2],
            0,
            render.width + 5 * render.loc[2],
            render.height + 5 * render.loc[2],
            RECT_COLOR,
            BORDER_COLOR
          );
        }
        renderScale(render.loc[0], render.loc[1], render.message, render.loc[2], render.loc[3], render.loc[4], 0);
      }
    });
  });
});

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
  constructor(
    setting,
    loc,
    command,
    example = "Test",
    requires = ["all"],
    trigger = "renderOverlay",
    special = () => false
  ) {
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
    this.trigger = trigger;
    this.special = special;
    this.gui = new Gui();

    // loc array changes for versions < 2.9.4
    if (this.loc[3] === undefined) this.loc.push(false);
    if (this.loc[4] === undefined) this.loc.push(false);
    if (this.loc[5] === undefined) this.loc.push(true);

    // The actual rendering register for the GUI.
    renders[trigger]?.push(this);

    // Set registers for editing the GUI.
    this.moving = register("renderOverlay", () => {
      const width = Renderer.screen.getWidth();
      const height = Renderer.screen.getHeight();

      // Coords and scale
      const coords = `${ITALIC}x: ${Math.round(this.loc[0])}, y: ${Math.round(this.loc[1])}, s: ${this.loc[2].toFixed(
        2
      )}`;
      const align = this.loc[0] + Renderer.getStringWidth(coords) > width;
      renderScale(this.loc[0] + (align ? -2 : 2), this.loc[1] - 10, coords, 1, align, false, 300);

      Renderer.translate(0, 0, 300);
      Renderer.drawLine(Renderer.WHITE, this.loc[0], 1, this.loc[0], height, 0.5);
      Renderer.translate(0, 0, 300);
      Renderer.drawLine(Renderer.WHITE, width, this.loc[1], 1, this.loc[1], 0.5);

      // Draw example text
      if (this.loc[5]) {
        drawBox(
          this.loc[0] - (this.loc[3] ? this.ewidth : 0) - 3 * this.loc[2],
          this.loc[1] - 3 * this.loc[2],
          0,
          this.ewidth + 5 * this.loc[2],
          this.eheight + 5 * this.loc[2],
          this.loc[5] ? RECT_COLOR : EDIT_COLOR,
          BORDER_COLOR
        );
      }
      renderScale(this.loc[0], this.loc[1], this.example, this.loc[2], this.loc[3], this.loc[4], 0);
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
    if (keyCode === 13) this.loc[2] = Math.round((this.loc[2] + 0.05) * 100) / 100;
    // Increase Scale (+ key)
    else if (keyCode === 12) this.loc[2] = Math.round((this.loc[2] - 0.05) * 100) / 100;
    // Decrease Scale (- key)
    else if (keyCode === 38) this.loc[3] = !this.loc[3]; // Swap align (l key)
    else if (keyCode === 35) this.loc[4] = !this.loc[4]; // Swap flex (h key)
    else if (keyCode === 48) this.loc[5] = !this.loc[5]; // Swap flex (b key)
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
   *
   * @param {String} type - "message" to set message height or "example" to set example height.
   */
  setSize(type) {
    // Set flex size
    let message = type === "message" ? this.message : this.example;
    message = this.loc[4] ? message.replace(/\n/g, "  ") : message;
    const lines = message?.split("\n");

    // Check if message is not empty
    if (!lines?.length) {
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
    if (type === "message") this.height = lines.length * 9 * this.loc[2];
    else this.eheight = lines.length * 9 * this.loc[2];

    // Find line with largest width
    let maxWidth = 0;
    lines.forEach((line) => {
      if (line.includes("§l")) {
        const splitLine = line.split("§l");
        let stringWidth = 0;

        for (let i = 0; i < splitLine.length; i++) {
          if (i === 0) stringWidth += Renderer.getStringWidth(splitLine[i]);
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
