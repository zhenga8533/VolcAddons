import settings from "./settings";
import { AQUA, DARK_AQUA, DARK_GRAY, GRAY, GREEN, LOGO, RED, WHITE, YELLOW } from "./constants";
import { convertToPascalCase, convertToTitleCase, unformatNumber } from "./functions/format";
import { updateAuction } from "../features/economy/Economy";
import { updateEntityList } from "../features/combat/EntityDetect";
import { setWarps } from "../features/event/MythRitual";
import { updateWidgetList } from "../features/general/WidgetDisplay";
import { setRegisters } from "./register";
import { data } from "./variables";


let lines = [5858, 5859];

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
    const command = args[1]
    const item = listName === "moblist" || listName === "spamlist" ? args.slice(2).join(' ') : args.slice(2).join(' ').toLowerCase();

    // Object pairs
    const held = Player?.getHeldItem()?.getItemNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")?.getString("id");
    const value = listName === "cdlist" || listName === "valuelist" ? unformatNumber(args[3] ?? args[2]) : args.slice(3).join(' ');
    const key = listName === "colorlist" ? convertToPascalCase(args[2]) :
        (listName === "cdlist" || listName === "valuelist") && held !== undefined ? held : args[2];

    switch (command) {
        case "add": // ADD TO LIST
            if (isArray && !list.includes(item)) {
                list.push(item);
                ChatLib.chat(`${LOGO + GREEN}Successfully added "${WHITE + item + GREEN}" to the ${listName}!`);
            } else if (!isArray && !(key in list)) {
                list[key] = value;
                ChatLib.chat(`${LOGO + GREEN}Successfully linked "${WHITE + value + GREEN}" to [${WHITE + key + GREEN}]!`);
            } else ChatLib.chat(`${LOGO + RED}[${WHITE + (isArray ? item : key + RED)}] is already in the ${listName}!`);
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
            else Object.keys(list).forEach(key => delete list[key]);
            ChatLib.chat(`${LOGO + GREEN}Successfully cleared the ${listName}!`);
            break;
        case "view": // DISPLAY LIST
        case "list":
            ChatLib.clearChat(lines);
            lines = [5858, 5859];
            let id = 5860;
            const page = parseInt(args[2] ?? 1);
            const length = isArray ? list.length : Object.keys(list).length;
            const total = Math.ceil(length / 12) || 1;

            // Print out header
            new Message("\n&c&m-----------------------------------------------------").setChatLineId(5858).chat();
            const lArrow = new TextComponent("&r&e&l<<&r&9")
                .setClickAction("run_command")
                .setClickValue(`/va ${listName} list ${page - 1}`)
                .setHoverValue(`${YELLOW}Click to view page ${page - 1}.`);
            const rArrow = new TextComponent("&r&e&l>>")
                .setClickAction("run_command")
                .setClickValue(`/va ${listName} list ${page + 1}`)
                .setHoverValue(`${YELLOW}Click to view page ${page + 1}.`);
            const header = new Message("&r&9                     ").setChatLineId(5859);

            header.addTextComponent(page > 1 ? lArrow : "   ");
            header.addTextComponent(` §6${convertToTitleCase(listName)} §8(§fPage §7${page} §fof §7${total}§8) `);
            if (page < total) header.addTextComponent(rArrow);
            header.addTextComponent("\n").chat();

            // Loop through variables
            const pageIndex = (page - 1) * 12;
            if (isArray) {
                for (let i = pageIndex; i < Math.min(pageIndex + 12, length); i++) {
                    new Message(` ${DARK_GRAY}⁍ `, new TextComponent(`${AQUA + list[i]}`)
                        .setClickAction("run_command")
                        .setClickValue(`/va ${listName} remove ${list[i]}`)
                        .setHoverValue(`${YELLOW}Click to remove ${AQUA + list[i] + YELLOW} from list.`)
                    ).setChatLineId(++id).chat();
                    lines.push(id);
                }
            } else {
                const keys = Object.keys(list);
                for (let i = pageIndex; i < Math.min(pageIndex + 12, length); i++) {
                    let key = keys[i];
                    new Message(` ${DARK_GRAY}⁍ `, new TextComponent(`${AQUA + key}`)
                        .setClickAction("run_command")
                        .setClickValue(`/va ${listName} remove ${key}`)
                        .setHoverValue(`${YELLOW}Click to remove ${AQUA + key + YELLOW} from list.`),
                        `${GRAY} => ${YELLOW + list[key]}`
                    ).setChatLineId(++id).chat();
                    lines.push(id);
                }
            }

            // Footer
            new Message("&c&m-----------------------------------------------------&r").setChatLineId(++id).chat();
            lines.push(id);
            return;
        case "reset": // RESET LIST TO DEFAULT
            if (listName === "dianalist") data.dianalist = ["hub", "da", "castle", "museum", "wizard"];
            else if (listName === "attributelist") data.attributelist = ["arachno", "attack_speed", "blazing", "combo", "elite", "ender", "ignition", "life_recovery", 
                "mana_steal", "midas_touch", "undead", "warrior", "deadeye", "arachno_resistance", "blazing_resistance", "breeze", "dominance", "ender_resistance", 
                "experience", "fortitude", "life_regeneration", "lifeline", "magic_find", "mana_pool", "mana_regeneration", "mending", "speed", "undead_resistance", "veteran",
                "blazing_fortune", "fishing_experience", "infection", "double_hook", "fisherman", "fishing_speed", "hunter", "trophy_hunter"];
            else if (listName === "moblist") if (listName === "moblist") data.moblist = ["vanquisher", "jawbus", "thunder", "inquisitor"];
            else if (isArray) list.length = 0;
            else Object.keys(list).forEach(key => delete list[key]);
            ChatLib.chat(`${LOGO + GREEN}Successfully reset the ${listName}!`);
            break;
        case "value":
            if (listName === "attributelist") {
                data.attributelist = ["breeze", "dominance", "fortitude", "lifeline", "magic_find", "mana_pool", "mana_regeneration", "mending", "speed", "veteran",
                    "blazing_fortune", "fishing_experience"];
                ChatLib.chat(`${LOGO + GREEN}Successfully limited to valuable attributes!`);
                break;
            }
        default:
            ChatLib.chat(`\n${LOGO + RED}Error: Invalid argument "${command}"!`);
            let base = `${LOGO + RED}Please input as: ${WHITE}/va ${listName} ${GRAY}<${WHITE}view, clear, add, remove`;

            if (listName === "cdlist") base += `[cd]
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
            else if (listName === "valuelist") base += `${GRAY}> ${WHITE}*[item_id] [value]\n${DARK_GRAY}This will set the value of your currently held item.`;
            else if (listName === "spamlist")
                base += `${GRAY}> ${WHITE}[phrase]\n${DARK_GRAY}Remember to add variables with ${"${var}"}, for example:\n ${DARK_GRAY}va sl add Guild > ${"${player}"} left.`;
            else if (listName === "attributelist") base += `, value> ${WHITE}[attribute_name]`
            else base += "> [item]";
            
            ChatLib.chat(base);
            return;
    }
    
    ChatLib.command(`va ${listName} list`, true);

    if (listName === "moblist" || listName === "colorlist") updateEntityList();
    else if (listName === "dianalist") setWarps();
    else if (listName === "valuelist") updateAuction();
    else if (listName === "widgetlist") updateWidgetList(); 
    else if (listName === "prefixlist") ChatLib.chat(`${LOGO + GREEN}Please use ${AQUA}/ct load ${GREEN}to reload registers!`);
    setRegisters(off = settings.skyblockToggle && !Scoreboard.getTitle().removeFormatting().includes("SKYBLOCK"));
}