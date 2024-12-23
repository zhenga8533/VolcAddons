register("command", () => {
  ChatLib.chat(
    `\n§6§lVolcDebug:
 §eCT Version: §7v${ChatTriggers.MODVERSION}
 §eVolcAddons §7v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}
§8Please note that the mod may not work if CT is not v2.2.0`
  );
}).setName("VATest");

// Utility Modules
import {
  AQUA,
  BOLD,
  DARK_AQUA,
  DARK_GRAY,
  DARK_RED,
  GOLD,
  GRAY,
  GREEN,
  LOGO,
  RED,
  RESET,
  UNDERLINE,
  WHITE,
  YELLOW,
} from "./utils/Constants";
import { data, resetGUI } from "./utils/Data";
import "./utils/DevTils";
import "./utils/Launch";
import { updateList } from "./utils/ListTils";
import { openGUI } from "./utils/Overlay";
import Settings from "./utils/Settings";
import Toggles from "./utils/Toggles";
import { getLatestReleaseVersion } from "./utils/UpdateTils";

// General Features
import "./features/general/Autocorrect";
import "./features/general/BridgeFormatter";
import "./features/general/ChangeMessage";
import "./features/general/ChatWebhook";
import "./features/general/ChunkBorders";
import "./features/general/Cooldowns";
import { updateFairy } from "./features/general/FairySouls";
import "./features/general/LevelAlert";
import { getStatus } from "./features/general/Performance";
import "./features/general/ReminderTimer";
import "./features/general/RemoveSelfie";
import "./features/general/ServerAlert";
import "./features/general/SkillTracker";
import { updateSBW } from "./features/general/SkyBlockWaypoints";
import "./features/general/SkyCrypt";
import "./features/general/SpamHider";
import { getStat } from "./features/general/Statistics";
import { createWaypoint } from "./features/general/UserWaypoints";
import "./features/general/WidgetDisplay";
// Container Features
import "./features/container/AttributeAbbrev";
import { previewCommands } from "./features/container/ContainerPreview";
import "./features/container/ItemTimer";
import "./features/container/MaxCraft";
import "./features/container/Searchbar";
import { slotCommands } from "./features/container/SlotBinding";
import "./features/container/SoldHighlight";
import "./features/container/WardrobeHotkey";
// Party Features
import "./features/party/AntiGhostParty";
import "./features/party/AutoKick";
import "./features/party/AutoTransfer";
import "./features/party/JoinMessage";
import "./features/party/JoinParty";
import { executeCommand } from "./features/party/PartyCommands";
// Economy Features
import { getAttributes } from "./features/economy/AttributePricing";
import "./features/economy/BitsAlert";
import "./features/economy/CoinTracker";
import "./features/economy/ContainerValue";
import "./features/economy/Economy";
import { calcGdrag } from "./features/economy/GdragCalc";
import "./features/economy/ItemPrice";
import { calcMinions } from "./features/economy/MinionCalc";
import "./features/economy/MissingSkins";
import { getNetworth } from "./features/economy/Networth";
import "./features/economy/TradeValue";
// Combat Features
import "./features/combat/BestiaryDisplay";
import "./features/combat/ComboDisplay";
import "./features/combat/DamageTracker";
import "./features/combat/EntityDetect";
import "./features/combat/HealthAlert";
import "./features/combat/KillCounter";
import "./features/combat/ManaDrain";
import "./features/combat/RagDetect";
import "./features/combat/SlayerDetect";
// Mining Features
import "./features/mining/CommissionsDisplay";
import "./features/mining/EventTracker";
import "./features/mining/FossilHelper";
import "./features/mining/PickDisplay";
import "./features/mining/PowderChest";
import "./features/mining/PowderTracker";
import "./features/mining/ShaftAnnounce";
import "./features/mining/WishingCompass";
// Farming Features
import { calcCompost } from "./features/farming/Composter";
import "./features/farming/GardenTab";
import "./features/farming/PestTracking";
// Event Features
import "./features/event/BingoCard";
import "./features/event/BurrowDetect";
import "./features/event/CalendarTime";
import "./features/event/ChocolateFactory";
import "./features/event/GreatSpook";
import "./features/event/InquisitorDetect";
import "./features/event/MythRitual";
import { printRabbits, updateEggs } from "./features/event/RabbitEggs";
// Crimson Isle Features
import "./features/crimsonIsle/GoldenFishTimer";
import "./features/crimsonIsle/MythicDetect";
import "./features/crimsonIsle/TrophyCounter";
import "./features/crimsonIsle/VanqFeatures";
// Dungeon Features
import "./features/dungeon/CroesusHighlight";
import "./features/dungeon/DungeonProfit";
import "./features/dungeon/StarDetect";
// Kuudra Features
import "./features/kuudra/CrateEdit";
import "./features/kuudra/KuudraAlerts";
import "./features/kuudra/KuudraCrates";
import "./features/kuudra/KuudraDetect";
import "./features/kuudra/KuudraProfit";
import { getSplits } from "./features/kuudra/KuudraSplits";
import "./features/kuudra/KuudraView";
import { calcTabasco } from "./features/kuudra/TabascoCalc";
// Rift Features
import "./features/rift/DDR";
import { updateEnigma } from "./features/rift/EnigmaSouls";
import { updateCat } from "./features/rift/MontezumaSouls";
import "./features/rift/VampireSlayer";

// HELP - Display help message for available commands
function getHelp() {
  ChatLib.chat(
    `\n${GOLD + BOLD + UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version + RESET}

${DARK_AQUA + BOLD}GENERAL COMMANDS:${RESET}
 ${AQUA + BOLD}Settings: ${WHITE}/va ${GRAY}<${WHITE}gui, settings, toggles, version, help${GRAY}>
 ${AQUA + BOLD}Container: ${WHITE}/va ${GRAY}<${WHITE}button, preview, slot${GRAY}>
 ${AQUA + BOLD}Waypoints: ${WHITE}/va ${GRAY}<${WHITE}wp, fairy, enigma, egg, npc, zone, cat${GRAY}>
 ${AQUA + BOLD}Economy: ${WHITE}/va ${GRAY}<${WHITE}calc, attribute, nw${GRAY}>
 ${AQUA + BOLD}Misc: ${WHITE}/va ${GRAY}<${WHITE}dev, lists, splits${GRAY}>
 ${AQUA + BOLD}Etc: ${WHITE}/<sk, pesttp>
    
${DARK_AQUA + BOLD}GENERAL FEATURES:${RESET}
 ${AQUA + BOLD}Status Commands: ${WHITE}/va ${GRAY}<${WHITE}ping, fps, tps, yaw, pitch, xyz${GRAY}>
 ${AQUA + BOLD}Stats Commands: ${WHITE}/va ${GRAY}<${WHITE}pet, stats, pt, sf${GRAY}>
 ${AQUA + BOLD}Party Commands: ${WHITE}Refer to '/va toggles'`
  );
}

// `viewrecipe` GUI Button
const recipeKey = new KeyBind("View Recipe", data.recipeKey, "./VolcAddons.xdd");
register("gameUnload", () => {
  data.recipeKey = recipeKey.getKeyCode();
}).setPriority(Priority.HIGHEST);

register("guiKey", (_, keyCode, gui) => {
  if (keyCode === recipeKey.getKeyCode()) {
    // Check if hovering valid slot
    const slot = gui?.getSlotUnderMouse()?.field_75222_d;
    if (slot === undefined) return;

    // Check if item is null
    const item = Player.getContainer().getItems()[slot];
    if (item === null) {
      ChatLib.chat(`${LOGO + RED}Cannot viewrecipe of nothing.`);
      return;
    }

    // Viewrecipe using item NBT ID
    const id = item.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");
    ChatLib.command(`viewrecipe ${id}`);
  }
});

/**
 * Open settings GUI.
 */
function openSettings() {
  try {
    Settings.openGUI();
  } catch (err) {
    ChatLib.chat(`${LOGO + RED}Error opening Settings... Please run '/ct reload' to fix!`);
    register("gameUnload", () => {
      FileLib.delete("VolcAddons", "config.toml");
    }).setPriority(Priority.LOWEST);
  }
}

// /va ...args
register("command", (...args) => {
  if (args === undefined) {
    openSettings();
    return;
  }

  // Parsing command and executing appropriate actions
  const command = args[0] === undefined ? undefined : args[0].toLowerCase();
  const soleCommand = command.replace(/s$/, "");
  switch (soleCommand) {
    // Settings
    case undefined:
    case "setting":
      openSettings();
      break;
    case "toggle":
    case "control":
      Toggles.openGUI();
      break;
    case "dev":
      data.devMode = !data.devMode;
      const color = data.devMode ? GREEN : RED;
      ChatLib.chat(`${LOGO + color}Developer mode is now ${data.devMode ? "enabled" : "disabled"}!`);
      break;
    // Help
    case "help":
      getHelp();
      break;
    case "list":
      ChatLib.chat(
        `\n${LOGO + GOLD + BOLD} Lists:
${DARK_GRAY}- ${GOLD + BOLD}cd: ${YELLOW}cooldown-list
${DARK_GRAY}- ${GOLD + BOLD}wl: ${YELLOW}white-list
${DARK_GRAY}- ${GOLD + BOLD}bl: ${YELLOW}black-list
${DARK_GRAY}- ${GOLD + BOLD}el: ${YELLOW}emote-list
${DARK_GRAY}- ${GOLD + BOLD}vl: ${YELLOW}value-list
${DARK_GRAY}- ${GOLD + BOLD}dl: ${YELLOW}diana-list
${DARK_GRAY}- ${GOLD + BOLD}sl: ${YELLOW}spam-list
${DARK_GRAY}- ${GOLD + BOLD}il: ${YELLOW}ignore-list
${DARK_GRAY}- ${GOLD + BOLD}wgl: ${YELLOW}widget-list
${DARK_GRAY}- ${GOLD + BOLD}pl: ${YELLOW}prefix-list
${DARK_GRAY}- ${GOLD + BOLD}rl: ${YELLOW}rabbit-list`
      );
      break;
    // Update
    case "update":
    case "version":
      getLatestReleaseVersion();
      break;
    // Contract
    case "contract":
      const Desktop = Java.type("java.awt.Desktop");
      const File = Java.type("java.io.File");
      Desktop.getDesktop().open(new File(Config.modulesFolder + "/VolcAddons/data/contract.txt"));
      ChatLib.chat(
        `${
          LOGO + RED
        }My wealth and treasure? If you want it, I'll let you have it! Look for it! I left it all at that place!`
      );
      break;
    case "wdr":
    case "sin":
      if (!FileLib.read("./VolcAddons/Data", "contract.txt").split("\n")[51]?.includes(Player.getName())) {
        ChatLib.chat(
          `${LOGO + RED}The contract, signed it must be. Access granted, for you to see. ${DARK_GRAY}/va contract`
        );
        break;
      }

      data.vision = !data.vision;
      if (data.vision) ChatLib.chat(`${LOGO + GREEN}The white eye has been activated.`);
      else ChatLib.chat(`${LOGO + RED}See no evil, hear no evil, speak no evil...`);
      break;
    // Move GUI
    case "gui":
      if (args[1] === "reset") {
        resetGUI();
        ChatLib.chat(`${GREEN}Successfully reset ALL gui location settings!`);
        ChatLib.command("ct load", true);
      } else openGUI();
      break;
    // Buttons
    case "button":
      buttonCommands(args);
      break;
    // Container Preview
    case "preview":
      previewCommands(args);
      break;
    // Slot Binding
    case "slot":
    case "bind":
      slotCommands(args);
      break;
    // Send coords
    case "coord":
    case "xyz":
      const randID = "@" + (Math.random() + 1).toString(36).substring(5);
      ChatLib.say(
        `x: ${Math.round(Player.getX())}, y: ${Math.round(Player.getY())}, z: ${Math.round(Player.getZ())} ${randID}`
      );
      break;
    // Networth
    case "networth":
    case "nw":
      getNetworth(args[1] || Player.getName(), args[2]);
      break;
    // Attribute Pricing
    case "attribute":
      getAttributes(args);
      break;
    // List Controls
    case "whitelist":
    case "white":
    case "wl":
      updateList(args, "whitelist");
      break;
    case "blacklist":
    case "black":
    case "bl":
      updateList(args, "blacklist");
      break;
    case "emotelist":
    case "emote":
    case "el":
      updateList(args, "emotelist");
      break;
    case "cdlist":
    case "cdl":
    case "cooldown":
    case "cd":
      updateList(args, "cdlist");
      break;
    case "moblist":
    case "mob":
    case "ml":
      updateList(args, "moblist");
      break;
    case "colorlist":
    case "color":
    case "cl":
      updateList(args, "colorlist");
      break;
    case "dianalist":
    case "diana":
    case "dl":
      updateList(args, "dianalist");
      break;
    case "valuelist":
    case "value":
    case "vl":
      updateList(args, "valuelist");
      break;
    case "spamlist":
    case "spam":
    case "sl":
      updateList(args, "spamlist");
      break;
    case "ignorelist":
    case "ignore":
    case "il":
      updateList(args, "ignorelist");
      break;
    case "attributelist":
    case "al":
      updateList(args, "attributelist");
      break;
    case "widgetlist":
    case "wgl":
      updateList(args, "widgetlist");
      break;
    case "prefixlist":
    case "pl":
      updateList(args, "prefixlist");
      break;
    case "rabbitlist":
    case "rabbit":
    case "rl":
      printRabbits(args[1], args[2]);
      break;
    // Kuudra Splits
    case "split":
      getSplits(args);
      break;
    // User Waypoints
    case "waypoint":
    case "wp":
      createWaypoint(args);
      break;
    case "npc":
      updateSBW("NPC", args[1], args.slice(2).join(" "));
      break;
    case "location":
    case "zone":
      updateSBW(args[0], args[1], args.slice(2).join(" "));
      break;
    // Bazaar Calculations
    case "calculate":
    case "calc":
      try {
        const MINION_ARGS = new Set(["hypergolic", "hg", "inferno", "gabagool", "gaba", "vampire", "vamp"]);
        switch (args[1]) {
          case "composter":
          case "compost":
            calcCompost(args);
            break;
          case "gdrag":
            calcGdrag(isNaN(args[2]) ? 100 : args[2]);
            break;
          case "tabasco":
            calcTabasco(args);
            break;
          default:
            if (MINION_ARGS.has(args[1])) calcMinions(args);
            else {
              ChatLib.chat(`\n${LOGO + RED}Error: Invalid argument "${args[1]}"!`);
              ChatLib.chat(
                `${
                  LOGO + RED
                }Please input as: ${WHITE}/va calc ${GRAY}<${WHITE}gdrag, hg, inferno, gaba, tabasco, vampire, compost${GRAY}>`
              );
            }
            break;
        }
      } catch (err) {
        ChatLib.chat(LOGO + DARK_RED + (err.cause ?? err));
      }
      break;
    // Configure Fairy souls
    case "fairy":
      updateFairy(args[1], args[2]);
      break;
    // Configure Enigma souls
    case "enigma":
      updateEnigma(args[1], args.splice(2).join(" "));
      break;
    // Configure Montezuma souls
    case "montezuma":
    case "mont":
    case "cat":
      updateCat(args[1], args[2]);
      break;
    // Configure egg waypoints
    case "egg":
      updateEggs(args[1], args[2]);
      break;
    // Party Commands and Else Case
    default:
      args = args.map((w) => w.toLowerCase());
      // Other args to check
      const PARTY_COMMANDS = new Set([
        "cringe",
        "gay",
        "racist",
        "femboy",
        "trans",
        "transphobic",
        "dice",
        "roll",
        "coin",
        "flip",
        "coinflip",
        "cf",
        "8ball",
        "rps",
        "waifu",
        "w",
        "women",
        "neko",
        "shinobu",
        "megumin",
        "bully",
        "cuddle",
        "cry",
        "hug",
        "awoo",
        "kiss",
        "lick",
        "pat",
        "smug",
        "bonk",
        "yeet",
        "blush",
        "smile",
        "wave",
        "highfive",
        "handhold",
        "nom",
        "bite",
        "glomp",
        "slap",
        "kill",
        "kick",
        "happy",
        "wink",
        "poke",
        "dance",
        "cringe",
        "time",
      ]);
      const INSTANCES = new Set(["f", "m", "t"]);
      const STATUS_ARGS = new Set(["ping", "tps", "fps", "cps", "yaw", "pitch", "dir", "direction", "day"]);
      const STAT_ARGS = new Set(["pet", "stats", "soulflow", "sf", "playtime", "pt", "legion"]);

      if (PARTY_COMMANDS.has(command) || (INSTANCES.has(command[0]) && !isNaN(command[1])))
        executeCommand(Player.getName(), args, false);
      else if (STATUS_ARGS.has(command)) getStatus(command);
      else if (STAT_ARGS.has(command)) getStat(command);
      else {
        ChatLib.chat(`${LOGO + RED}Unkown command: "${command}" was not found!`);
        ChatLib.chat(`${LOGO + RED}Use '/va help' for a full list of commands.`);
      }
      break;
  }
})
  .setName("va", true)
  .setAliases("volcaddons", "volc", "itee");

/**
 * Final imports
 */
import "./features/container/ArmorDisplay";
import { buttonCommands } from "./features/container/ContainerButtons";
