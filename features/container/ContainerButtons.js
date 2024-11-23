import {
  BOLD,
  BUTTON_PRESETS,
  DARK_GRAY,
  DARK_GREEN,
  DataFlavor,
  GOLD,
  GREEN,
  GuiChest,
  GuiInventory,
  GuiTextField,
  InventoryBasic,
  LOGO,
  RED,
  Toolkit,
  UNDERLINE,
  YELLOW,
} from "../../utils/Constants";
import { data } from "../../utils/Data";
import { printList } from "../../utils/ListTils";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { parseTexture } from "../../utils/functions/misc";
import { drawBox, drawLore } from "../../utils/functions/render";

// Container offsets from top left [x, y]
const OFFSETS = {
  top: [8, -18],
  right: [178, 12],
  bottom: [8, 42],
  left: [-18, 12],
  inv1: [80, 8],
  inv2: [80, 26],
  inv3: [80, 44],
  inv4: [80, 62],
  eq: [-18, 8],
};
let clientCommands = new Set(
  net.minecraftforge.client.ClientCommandHandler.instance?.getCommandSet()?.map((key) => key.func_71517_b()) ?? ["va"]
);

const COLOR_SCHEMES = [
  [Renderer.color(139, 139, 139, 128), Renderer.color(198, 198, 198, 255)], // Default
  [Renderer.color(0, 0, 0, 0), Renderer.color(0, 0, 0, 0)], // Transparent
  [Renderer.color(255, 255, 255, 16), Renderer.color(169, 169, 169, 128)], // Semi-Transparent
  [Renderer.color(82, 92, 136, 128), Renderer.color(44, 53, 77, 255)], // FurfSky
];
const BOX_HIGHLIGHT = Renderer.color(0, 255, 255, 64);
const BORDER_HIGHLIGHT = Renderer.color(0, 255, 255, 255);

// Editing inputs and rendering
const editing = {
  id: "Top0",
  loc: "Top",
  index: 0,
  active: false,
};
const commandInput = new GuiTextField(0, Client.getMinecraft().field_71466_p, 10, 10, 176, 16);
const iconInput = new GuiTextField(0, Client.getMinecraft().field_71466_p, 10, 30, 176, 16);

// Local cache
let buttons = {};
let container;

export class Button {
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
  #hovered;
  #edit = false;

  /**
   * Boop. Another poorly written class that patches up errors as they came up ^_^
   *
   * @param {String} loc - "Top", "Right", "Bottom", or "Left" used to set offset.
   * @param {Number} index - Relative inventory index position. Will be used to determine if button should be rendered
   * @param {Function} clicked - Callback function to be called when button is pressed.
   * @param {String} command - Command args that are called in the callback. Used to cache data.
   * @param {String} icon - Minecraft item id used to draw logo. Barrier icon is reserved for edit buttons.
   */
  constructor(loc, index, clicked, command = "", icon = "barrier", lore) {
    this.#clicked = clicked;
    this.#loc = loc;
    this.#index = index;
    this.#id = loc + index.toString();
    this.#command = command;
    this.#x = OFFSETS[this.#loc][0] + 18 * (this.#index % 9);
    this.#y = OFFSETS[this.#loc][1] + 18 * ~~(this.#index / 9);
    this.#invOnly = loc.startsWith("inv");
    this.setItem(icon, lore);
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
   * Returns Button.#item
   *
   * @returns {String} - Button's icon ID.
   */
  getIcon() {
    return this.#icon;
  }

  /**
   * Updates Button.#item using icon, otherwise defaults to redstone_block.
   *
   * @param {String} icon - Name used to find Minecraft item ID.
   */
  setItem(icon, lore) {
    try {
      this.#edit = icon === "barrier";
      const texture =
        icon === "skull"
          ? Toolkit.getDefaultToolkit().getSystemClipboard().getData(DataFlavor.stringFlavor)
          : icon.length > 32
          ? icon
          : icon.length === 32
          ? data.buttons[this.#id][3]
          : undefined;

      if (texture !== undefined) {
        // Skull textures
        const tag = new NBTTagCompound(new net.minecraft.nbt.NBTTagCompound());
        tag.set("SkullOwner", parseTexture(texture));

        const item = new Item(397).setDamage(3);
        item.itemStack.func_77982_d(tag.rawNBT);
        if (lore !== undefined) item.setLore([...lore]); // Make sure lore is an array
        this.#item = item;
        this.#icon = texture;
      } else {
        this.#item = new Item("minecraft:" + icon);
        this.#icon = icon;
        this.#edit = icon === "barrier";
      }
    } catch (_) {
      ChatLib.chat(`${LOGO + RED}Error: Invalid icon ID "${icon}"!`);
      this.#item = new Item("minecraft:redstone_block");
      this.#icon = "redstone_block";
    }
  }

  /**
   * Updates Button.#command and Button.#clicked to callback.
   *
   * @param {String} command - Command to run when button is pressed.
   */
  setCommand(command) {
    this.#command = command;
    const isClient = clientCommands.has(command.split(" ")[0]);

    this.#clicked = () => {
      ChatLib.command(command, isClient);
    };
  }

  /**
   * Saves button caching data into specified data variable.
   *
   * @param {Object} cache - Data variasble to save Button data to.
   */
  save(cache) {
    if (this.#id.startsWith("eq")) return;
    cache[this.#id] = [this.#loc, this.#index, this.#command, this.#icon];
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
    const y = dy + this.#y + (this.#loc !== "bottom" ? 0 : 18 * ~~(size / 9) + (size > 45 ? 0 : 36));

    // Draw box
    const boxColor = this.#hovered ? BOX_HIGHLIGHT : COLOR_SCHEMES[Settings.containerButtons - 1][0];
    const borderColor = this.#hovered ? BORDER_HIGHLIGHT : COLOR_SCHEMES[Settings.containerButtons - 1][1];
    drawBox(x, y, this.#hovered ? 100 : 99, 16, 16, boxColor, borderColor);
    this.#item.draw(x, y, 1, 100);
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
    const y = dy + this.#y + (this.#loc !== "bottom" ? 0 : 18 * ~~(size / 9) + (size > 45 ? 0 : 36));
    if (hx < x || hx > x + 16 || hy < y || hy > y + 16) {
      this.#hovered = false;
      return;
    }

    this.#hovered = true;
    if (this.#item.getLore().length === 1) {
      Renderer.translate(0, 0, 500);
      Renderer.drawRect(
        Renderer.color(0, 0, 0, 128),
        hx + 2,
        hy - 16,
        Renderer.getStringWidth("/" + this.#command) + 6,
        14
      );
      Renderer.translate(0, 0, 500);
      Renderer.drawString(UNDERLINE + (this.#edit ? `Edit ${this.#id}` : "/" + this.#command), hx + 5, hy - 13);
    } else drawLore(hx, hy, this.#item.getLore());
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
    const y = dy + this.#y + (this.#loc !== "bottom" ? 0 : 18 * ~~(size / 9) + (size > 45 ? 0 : 36));
    if (cx < x || cx > x + 16 || cy < y || cy > y + 16) return false;

    if (editing.active) {
      if (this.#id.startsWith("eq")) return false;
      else if (button === 0) {
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
        buttons[this.#id] = new Button(
          this.#loc,
          this.#index,
          () => {
            editing.id = this.#id;
            editing.loc = this.#loc;
            editing.index = this.#index;

            inputKey.register();
            inputRender.register();
          },
          "",
          "barrier"
        );
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

  let command = commandInput.func_146179_b(); // This is also a pointer for some reason
  if (buttons.hasOwnProperty(editing.id)) {
    buttons[editing.id].setCommand(command);
    buttons[editing.id].setItem(iconInput.func_146179_b());
  } else {
    const isClient = clientCommands.has(command.split(" ")[0]);
    buttons[editing.id] = new Button(
      editing.loc,
      editing.index,
      () => {
        ChatLib.command(command, isClient);
      },
      command,
      iconInput.func_146179_b()
    );
    delete buttons[editing.id];
  }
}

const inputClick = register("guiMouseClick", (x, y, button, gui, event) => {
  commandInput.func_146192_a(x, y, button);
  iconInput.func_146192_a(x, y, button);
  if (commandInput.func_146206_l() || iconInput.func_146206_l()) cancel(event);
  else {
    saveEdit();
    const left = gui?.getGuiLeft() ?? 0;
    const top = gui?.getGuiTop() ?? 0;
    const size = Player.getContainer().getSize() + (container === "GuiInventory" ? 18 : 0);

    if (
      !Object.keys(buttons).some((key) => {
        if (buttons[key].getIndex() > size) return false;
        return buttons[key].click(left, top, x, y, button);
      })
    )
      resetEdit();
  }
}).unregister();

const inputKey = register("guiKey", (char, keyCode, _, event) => {
  if (commandInput.func_146206_l()) commandInput.func_146201_a(char, keyCode);
  else if (iconInput.func_146206_l()) iconInput.func_146201_a(char, keyCode);
  else return;

  // Cancel all but escape key
  if (keyCode !== 1) cancel(event);
  if (keyCode === 28) {
    // Enter key
    saveEdit();
    resetEdit();
  } else if (keyCode === 15) {
    // Tab key
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
  Renderer.drawString(
    `${BOLD}Editing: ${editing.id}`,
    commandInput.field_146209_f,
    commandInput.field_146210_g - 20,
    Settings.textShadow
  );
  Renderer.drawString(
    'Command (ex. "p list"):',
    commandInput.field_146209_f,
    commandInput.field_146210_g - 10,
    Settings.textShadow
  );
  commandInput.func_146194_f();
  Renderer.drawString(
    'Icon ID (ex. "redstone_block"): ',
    iconInput.field_146209_f,
    iconInput.field_146210_g - 10,
    Settings.textShadow
  );
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

    let j = i / 1; // Why tf does i act like a pointer
    buttons[id] = new Button(
      category,
      i,
      () => {
        editing.id = id;
        editing.index = j;
        editing.loc = category;

        iconInput.func_146180_a("");
        commandInput.func_146180_a("");
        commandInput.func_146195_b(true);
        inputKey.register();
        inputRender.register();
      },
      "",
      "barrier"
    );
  }
}

/**
 * Sets up button editing menu for specified container type.
 *
 * @param {String} type - "inv" or "chest" for type of container to open and process.
 */
function setButtons(type) {
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
    const top = gui?.getGuiTop() ?? 0;
    const left = gui?.getGuiLeft() ?? 0;

    // Set input field locations
    commandInput.field_146209_f = left;
    commandInput.field_146210_g = top - 80;
    iconInput.field_146209_f = left;
    iconInput.field_146210_g = top - 50;

    // Set all inv edit buttons TRBL
    createButtons(0, 9, 1, "top");
    createButtons(0, 9, 1, "bottom");
    createButtons(Settings.equipDisplay ? 36 : 0, 99, 9, "left");
    createButtons(0, 99, 9, "right");
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
  const left = gui?.getGuiLeft() ?? 0;
  const top = gui?.getGuiTop() ?? 0;
  const size = Player.getContainer().getSize() + (container === "GuiInventory" ? 18 : 0);

  Object.keys(buttons).forEach((key) => {
    if (buttons[key].getIndex() > size) return;
    buttons[key].click(left, top, x, y, button);
  });
}).unregister();

const render = register("guiRender", (x, y, gui) => {
  const top = gui?.getGuiTop() ?? 0;
  const left = gui?.getGuiLeft() ?? 0;
  const size = Player.getContainer().getSize() + (container === "GuiInventory" ? 18 : 0);

  Object.keys(buttons).forEach((key) => {
    if (buttons[key].getIndex() > size) return;
    buttons[key].draw(left, top);
    buttons[key].hover(left, top, x, y);
  });
}).unregister();

const close = register("guiClosed", () => {
  // Clear out edit buttons
  Object.keys(buttons).forEach((key) => {
    if (buttons[key].getIcon() === "barrier") delete buttons[key];
  });

  // Set registers
  render.unregister();
  click.unregister();
  close.unregister();
  inputRender.unregister();
  inputClick.unregister();
  inputKey.unregister();
  editing.active = false;
  resetEdit();
}).unregister();

registerWhen(
  register("guiOpened", (event) => {
    const gui = event.gui;
    const name = gui.class.toString().split(".");
    container = name[name.length - 1];
    if (container !== "GuiInventory" && container !== "GuiChest") return;

    if (!editing.active) click.register();
    close.register();
    render.register();
    Client.scheduleTask(1, () => {
      if (!editing.active) click.register();
      close.register();
      render.register();
    });
  }),
  () => Settings.containerButtons !== 0
);

/**
 * Persistant buttons.
 */
register("gameUnload", () => {
  data.buttons = {};
  Object.keys(buttons).forEach((key) => {
    buttons[key].save(data.buttons);
  });
}).setPriority(Priority.HIGHEST);

/**
 * Loads buttons using cached button data.
 */
function loadButtons() {
  buttons = {};
  Object.keys(data.buttons).forEach((key) => {
    const button = data.buttons[key];
    const isClient = clientCommands.has(button[2].split(" ")[0]);

    buttons[key] = new Button(
      button[0],
      button[1],
      () => {
        ChatLib.command(button[2], isClient);
      },
      button[2],
      button[3]
    );
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

  switch (command) {
    case "inv":
      setButtons("inv");
      break;
    case "chest":
      setButtons("chest");
      break;
    case "save":
      data.buttonPresets[name] = {};
      Object.keys(buttons).forEach((key) => {
        buttons[key].save(data.buttonPresets[name]);
      });
      ChatLib.chat(`${LOGO + GREEN}Successfully saved buttons data using key: "${name}".`);
      break;
    case "delete":
    case "remove":
      if (data.buttonPresets.hasOwnProperty(name)) {
        delete data.buttonPresets[name];
        ChatLib.chat(`${LOGO + GREEN}Successfully deleted button preset using key: "${name}".`);
      } else ChatLib.chat(`${LOGO + RED}Error: There are no presets using "${name}" key.`);
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
      printList(buttonKeys, "Buttons", parseInt(args[2] ?? 1));
      break;
    case "import":
    case "parse":
      const backup = data.buttons;
      try {
        const decoded = JSON.parse(
          FileLib.decodeBase64(Toolkit.getDefaultToolkit().getSystemClipboard().getData(DataFlavor.stringFlavor))
        );
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
      new Message(
        `${LOGO + DARK_GREEN}Encoded Button Data:`,
        new TextComponent(GREEN + compressed)
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
      ChatLib.chat(
        `${LOGO + GOLD + BOLD}Container Buttons Commands:
 ${DARK_GRAY}- ${GOLD}Base: ${YELLOW}/va buttons <command>

 ${DARK_GRAY}- ${GOLD}inv: ${YELLOW}Opens edit menu for GuiInventory.
 ${DARK_GRAY}- ${GOLD}chest: ${YELLOW}Opens edit meny for GuiChest.
 ${DARK_GRAY}- ${GOLD}save <key>: ${YELLOW}Save button data to presets using key.
 ${DARK_GRAY}- ${GOLD}delete <key>: ${YELLOW}Delete button preset using key.
 ${DARK_GRAY}- ${GOLD}load <key>: ${YELLOW}Load button preset using key.
 ${DARK_GRAY}- ${GOLD}list: ${YELLOW}View all available button presets.
 ${DARK_GRAY}- ${GOLD}import: ${YELLOW}Import button presets from the clipboard.
 ${DARK_GRAY}- ${GOLD}export: ${YELLOW}Export the button data as encoded data.
 ${DARK_GRAY}- ${GOLD}reset: ${YELLOW}Resets button presets.
 ${DARK_GRAY}- ${GOLD}clear: ${YELLOW}Resets current button data.
 ${DARK_GRAY}- ${GOLD}help: ${YELLOW}Displays this help message.

 ${DARK_GRAY}- ${GOLD}Edit: ${YELLOW}Left click to edit button, right click to delete button.
 ${DARK_GRAY}- ${GOLD}Note: ${YELLOW}To use skull textures, copy the texture data to clipboard and use "skull" as icon ID.
 ${DARK_GRAY}You can find copy this value by using DevKey and copying Value from the Properties tag.`
      );
      break;
  }
}
