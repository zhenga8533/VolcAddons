import { updateEntityList } from "../features/combat/EntityDetect";
import { updateAuction } from "../features/economy/Economy";
import { setWarps } from "../features/event/MythRitual";
import { updateWidgetList } from "../features/general/WidgetDisplay";
import { AQUA, DARK_AQUA, DARK_GRAY, GRAY, GREEN, LOGO, RED, WHITE, YELLOW } from "./Constants";
import { data } from "./Data";
import { setRegisters } from "./RegisterTils";
import Settings from "./Settings";
import { convertToPascalCase, convertToTitleCase, unformatNumber } from "./functions/format";

/**
 * Prints a list of items to chat.
 *
 * @param {Object} list - The list to be printed.
 * @param {String} listName - The name of the list for displaying messages.
 * @param {Number} page - The page number to display.
 * @param {Number} pagy - Number of items per page.
 */
export function printList(list, listName, page, pagy = 12, action = true, command = "remove", hoverKey = false) {
  if (isNaN(page)) page = 1;

  ChatLib.clearChat(5858);
  const isArray = Array.isArray(list);
  const length = isArray ? list.length : Object.keys(list).length;
  const total = Math.ceil(length / pagy) || 1;
  page = MathLib.clamp(page, 1, total);

  // Print out header
  const message = new Message("\n&c&m-----------------------------------------------------&r").setChatLineId(5858);
  const header = ChatLib.getCenteredText(
    `${listName} ${page > 1 ? "<< " : ""}(Page ${page} of ${total})${page < total ? " >>" : ""}`
  );
  const whitespace = header.match(/^\s+/)[0];

  const lArrow = new TextComponent("&r&e&l<<&r&9")
    .setClickAction("run_command")
    .setClickValue(`/va ${listName} list ${page - 1}`)
    .setHoverValue(`${YELLOW}Click to view page ${page - 1}.`);
  const rArrow = new TextComponent("&r&e&l>>")
    .setClickAction("run_command")
    .setClickValue(`/va ${listName} list ${page + 1}`)
    .setHoverValue(`${YELLOW}Click to view page ${page + 1}.`);
  message.addTextComponent(whitespace);

  if (page > 1) message.addTextComponent(lArrow);
  message.addTextComponent(` §6${convertToTitleCase(listName)} §8(§fPage §7${page} §fof §7${total}§8) `);
  if (page < total) message.addTextComponent(rArrow);

  // Loop through variables
  const pageIndex = (page - 1) * pagy;
  if (length === 0) message.addTextComponent(`\n` + ChatLib.getCenteredText(YELLOW + "  404, This list is empty!"));
  else if (hoverKey) {
    const keys = Object.keys(list);
    for (let i = pageIndex; i < Math.min(pageIndex + pagy, length); i++) {
      let key = keys[i];
      message.addTextComponent(`\n ${DARK_GRAY}⁍ `);
      message.addTextComponent(
        new TextComponent(`${YELLOW + key}`)
          .setClickAction("run_command")
          .setClickValue(`/va ${listName} ${command} ${key}`)
          .setHoverValue(list[key])
      );
    }
  } else if (isArray) {
    for (let i = pageIndex; i < Math.min(pageIndex + pagy, length); i++) {
      if (action) {
        message.addTextComponent(`\n ${DARK_GRAY}⁍ `);
        message.addTextComponent(
          new TextComponent(`${YELLOW + list[i]}`)
            .setClickAction("run_command")
            .setClickValue(`/va ${listName} ${command} ${list[i]}`)
            .setHoverValue(`${YELLOW}Click to ${command} ${AQUA + list[i] + YELLOW} from list.`)
        );
      } else message.addTextComponent(`\n ${DARK_GRAY}⁍ ${YELLOW + list[i]}`);
    }
  } else {
    const keys = Object.keys(list);
    for (let i = pageIndex; i < Math.min(pageIndex + pagy, length); i++) {
      let key = keys[i];
      if (action) {
        message.addTextComponent(`\n ${DARK_GRAY}⁍ `);
        message.addTextComponent(
          new TextComponent(`${YELLOW + key}`)
            .setClickAction("run_command")
            .setClickValue(`/va ${listName} remove ${key}`)
            .setHoverValue(`${YELLOW}Click to remove ${YELLOW + key + YELLOW} from list.`)
        );
        message.addTextComponent(new TextComponent(`${GRAY} => ${YELLOW + list[key]}`));
      } else message.addTextComponent(`\n ${DARK_GRAY}⁍ ${YELLOW + key + GRAY} => ${YELLOW + list[key]}`);
    }
  }

  // Footer
  message.addTextComponent("&c&m-----------------------------------------------------&r");
  message.chat();
}

/**
 * Updates a list based on the provided arguments.
 *
 * @param {Array} args - An array of arguments provided for the list update.
 * @param {String[]} list - The list to be updated.
 * @param {String} listName - The name of the list for displaying messages.
 * @returns {String[]} - The updated list.
 */
export function updateList(args, listName) {
  const list = data[listName];
  const isArray = Array.isArray(list);
  const command = args[1];
  const item =
    listName === "moblist" || listName === "spamlist" ? args.slice(2).join(" ") : args.slice(2).join(" ").toLowerCase();

  // Object pairs
  const held = Player?.getHeldItem()
    ?.getItemNBT()
    ?.getCompoundTag("tag")
    ?.getCompoundTag("ExtraAttributes")
    ?.getString("id");
  const value = listName === "valuelist" || listName === "cdlist" ? unformatNumber(args[2]) : args.slice(3).join(" ");
  const key =
    listName === "colorlist"
      ? convertToPascalCase(args[2])
      : (listName === "cdlist" || listName === "valuelist") && held !== undefined
      ? held
      : args[2];

  switch (command) {
    case "add": // ADD TO LIST
      if (isArray && !list.includes(item)) {
        list.push(item);
        ChatLib.chat(`${LOGO + GREEN}Successfully added "${WHITE + item + GREEN}" to the ${listName}!`);
      } else if (!isArray && !(key in list)) {
        list[key] = value;
        ChatLib.chat(`${LOGO + GREEN}Successfully linked "${WHITE + value + GREEN}" to [${WHITE + key + GREEN}]!`);
      } else ChatLib.chat(`${LOGO + RED}[${WHITE + (isArray ? item : key) + RED}] is already in the ${listName}!`);
      break;
    case "remove": // REMOVE FROM LIST
      if (isArray && list.indexOf(item) > -1) {
        list.splice(list.indexOf(item), 1);
        ChatLib.chat(`${LOGO + GREEN}Successfully removed "${WHITE + item + GREEN}" from the ${listName}!`);
      } else if (!isArray && key in list) {
        delete list[key];
        ChatLib.chat(`${LOGO + GREEN}Successfully removed "${WHITE + key + GREEN}" from the ${listName}!`);
      } else ChatLib.chat(`${LOGO + RED}[${WHITE + item + RED}] is not in the ${listName}!`);
      break;
    case "clear": // CLEAR LIST
      if (isArray) list.length = 0;
      else Object.keys(list).forEach((key) => delete list[key]);
      ChatLib.chat(`${LOGO + GREEN}Successfully cleared the ${listName}!`);
      break;
    case "view": // DISPLAY LIST
    case "list":
      printList(list, listName, parseInt(args[2] ?? 1));
      return;
    case "reset": // RESET LIST TO DEFAULT
      if (listName === "dianalist") data.dianalist = ["hub", "da", "castle", "museum", "wizard"];
      else if (listName === "attributelist")
        data.attributelist = [
          "arachno",
          "attack_speed",
          "blazing",
          "combo",
          "elite",
          "ender",
          "ignition",
          "life_recovery",
          "mana_steal",
          "midas_touch",
          "undead",
          "warrior",
          "deadeye",
          "arachno_resistance",
          "blazing_resistance",
          "breeze",
          "dominance",
          "ender_resistance",
          "experience",
          "fortitude",
          "life_regeneration",
          "lifeline",
          "magic_find",
          "mana_pool",
          "mana_regeneration",
          "mending",
          "speed",
          "undead_resistance",
          "veteran",
          "blazing_fortune",
          "fishing_experience",
          "infection",
          "double_hook",
          "fisherman",
          "fishing_speed",
          "hunter",
          "trophy_hunter",
        ];
      else if (listName === "moblist")
        if (listName === "moblist") data.moblist = ["vanquisher", "jawbus", "thunder", "inquisitor"];
        else if (isArray) list.length = 0;
        else Object.keys(list).forEach((key) => delete list[key]);
      ChatLib.chat(`${LOGO + GREEN}Successfully reset the ${listName}!`);
      break;
    case "value":
      if (listName === "attributelist") {
        data.attributelist = [
          "breeze",
          "dominance",
          "fortitude",
          "lifeline",
          "magic_find",
          "mana_pool",
          "mana_regeneration",
          "mending",
          "speed",
          "veteran",
          "blazing_fortune",
          "fishing_experience",
        ];
        ChatLib.chat(`${LOGO + GREEN}Successfully limited to valuable attributes!`);
        break;
      }
    default:
      ChatLib.chat(`\n${LOGO + RED}Error: Invalid argument "${command}"!`);
      let base = `${LOGO + RED}Please input as: ${WHITE}/va ${listName} ${GRAY}<${WHITE}view, clear, add, remove`;

      if (listName === "cdlist")
        base += `[cd]
${DARK_GRAY}This will set the cooldown of your currently held item.

${DARK_AQUA}Special args (put in front, e.x 'a60'):
- ${AQUA}none ${GRAY}=> ${GRAY}right click
- ${AQUA}l ${GRAY}=> ${AQUA}left click
- ${AQUA}a ${GRAY}=> ${AQUA}no cd (e.x Plasmaflux)
- ${AQUA}s ${GRAY}=> ${AQUA}shift`;
      else if (listName === "emotelist") base += `${GRAY}> ${WHITE}[key] [value]`;
      else if (listName === "dianalist") base += `${GRAY}> <${WHITE}hub, castle, da, museum, crypt, wizard${GRAY}>>`;
      else if (listName === "moblist") base += `${GRAY}> <${WHITE}[MCEntityClass], [Stand Name]${GRAY}>>`;
      else if (listName === "colorlist") base += `${GRAY}> ${WHITE}[mob] [r] [g] [b]`;
      else if (listName === "valuelist")
        base += `${GRAY}> ${WHITE}*[item_id] [value]\n${DARK_GRAY}This will set the value of your currently held item.`;
      else if (listName === "spamlist")
        base += `${GRAY}> ${WHITE}[phrase]\n${DARK_GRAY}Remember to add variables with ${"${var}"}, for example:\n ${DARK_GRAY}va sl add Guild > ${"${player}"} left.`;
      else if (listName === "attributelist") base += `, value> ${WHITE}[attribute_name]`;
      else base += "> [item]";

      ChatLib.chat(base);
      return;
  }

  ChatLib.command(`va ${listName} list`, true);

  if (listName === "moblist" || listName === "colorlist") updateEntityList();
  else if (listName === "dianalist") setWarps();
  else if (listName === "valuelist") updateAuction();
  else if (listName === "widgetlist") updateWidgetList();
  else if (listName === "prefixlist")
    ChatLib.chat(`${LOGO + GREEN}Please use ${AQUA}/ct load ${GREEN}to reload registers!`);
  setRegisters((off = Settings.skyblockToggle && !Scoreboard.getTitle().removeFormatting().includes("SKYBLOCK")));
}

/**
 * /va edit command to directly change the waypoint arrays.
 *
 * @param {String[]} args - Array of player input values.
 * @param {String} type - Type of soul (Enigma/Montezuma).
 * @param {String} soul - Name of the soul.
 * @param {Type[]} base - Original array with all waypoints.
 * @param {String} world - Current world name
 */
export function soulEdit(args, type, soul, base, world) {
  switch (args[1]) {
    case "reset":
      data[soul] = base;
      ChatLib.chat(`${LOGO + GREEN}Succesfully reset ${type} waypoint!`);
      break;
    case "clear":
      data[soul] = world === undefined ? [] : {};
      ChatLib.chat(`${LOGO + GREEN}Succesfully cleared ${type} waypoint!`);
      break;
    case "pop":
      const souls = data[soul][world];
      if (souls === undefined || souls.length === 0) {
        ChatLib.chat(`${LOGO + RED}There are no ${type} souls to pop!`);
        return;
      }

      const closest = getClosest([Player.getX(), Player.getY(), Player.getZ()], souls);
      if (closest !== undefined) souls.splice(souls.indexOf(closest[0]), 1);
      ChatLib.chat(`${LOGO + GREEN}Succesfully popped closest ${type} soul!`);
      break;
    default:
      ChatLib.chat(`\n${LOGO + RED}Error: Invalid argument "${args[1]}"!`);
      ChatLib.chat(`${LOGO + RED}Please input as: ${WHITE}/va ${type} ${GRAY}<${WHITE}reset, clear, pop${GRAY}>`);
      break;
  }
}
