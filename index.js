// Utility Modules
import "./utils/player";
import settings from "./utils/settings";
import toggles from "./utils/toggles";
import "./utils/waypoints";
import { AQUA, BOLD, CAT_SOULS, CONTRACT, DARK_AQUA, DARK_GRAY, DARK_RED, ENIGMA_SOULS, FAIRY_SOULS, GOLD, GRAY, GREEN, LOGO, RED, RESET, RIFT_NPCS, RIFT_ZONES, SMA, UNDERLINE, WHITE } from "./utils/constants";
import { getInParty, getIsLeader, getParty } from "./utils/party";
import { openGUI } from "./utils/overlay";
import { delay } from "./utils/thread";
import { getLatestReleaseVersion } from "./utils/updates";
import { data, resetGUI, updateList } from "./utils/variables";
import { findZone, getTier, getWorld } from "./utils/worlds";
// Utility Variable Control
const CHANGED_SETTINGS = new Set(["itemPrice", "bossAlert", "miniAlert", "vanqCounter"]);
for (const key in settings) if (CHANGED_SETTINGS.has(key) && typeof settings[key] !== "number") settings[key] = 0;
if (typeof settings.partyCommands !== "boolean") settings.partyCommands = false;

// General Features
import "./features/general/ArmorDisplay";
import "./features/general/Autocorrect";
import "./features/general/ChangeMessage";
import "./features/general/ChatWebhook";
import "./features/general/ChunkBorders";
import "./features/general/Cooldowns";
import "./features/general/FairySouls";
import "./features/general/ImageViewer";
import "./features/general/JyrreTimer";
import { getStatus } from "./features/general/Performance";
import "./features/general/ReminderTimer";
import "./features/general/RemoveSelfie";
import "./features/general/Searchbar";
import "./features/general/ServerAlert";
import "./features/general/SkillTracker";
import "./features/general/SkyCrypt";
import "./features/general/SlotBinding";
import "./features/general/SpamHider";
import { getStat } from "./features/general/Statistics";
import { createWaypoint } from "./features/general/UserWaypoints";
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
import "./features/economy/TradeValue";
// Combat Features
import { getBestiary } from "./features/combat/Bestiary";
import "./features/combat/ComboDisplay";
import "./features/combat/DamageTracker";
import "./features/combat/EntityDetect";
import "./features/combat/GyroTimer";
import "./features/combat/HealthAlert";
import "./features/combat/KillCounter";
import "./features/combat/ManaDrain";
import "./features/combat/RagDetect";
import "./features/combat/SlayerDetect";
// Mining Features
import "./features/mining/CommissionsDisplay";
import "./features/mining/FossilHelper";
import "./features/mining/PowderChest";
import "./features/mining/PowderTracker";
import "./features/mining/ShaftAnnounce";
import "./features/mining/WishingCompass";
// Farming Features
import { calcCompost } from "./features/farming/ComposterCalc";
import "./features/farming/FarmingWebhook";
import "./features/farming/GardenBox";
import "./features/farming/GardenTab";
import "./features/farming/JacobHighlight";
import "./features/farming/PestTracking";
// Event Features
import "./features/event/BingoCard";
import "./features/event/BurrowDetect";
import "./features/event/GreatSpook";
import "./features/event/InquisitorDetect";
import "./features/event/MythRitual";
// Crimson Isle Features
import "./features/crimsonIsle/GoldenFishTimer";
import "./features/crimsonIsle/MythicDetect";
import "./features/crimsonIsle/TrophyCounter";
import "./features/crimsonIsle/VanqFeatures";
// Dungeon Features
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
import "./features/rift/VampireSlayer";
import { riftWaypointEdit, soulEdit } from "./features/rift/RiftWaypoints";
import { getNetworth } from "./features/economy/Networth";

// Launch Tests
if (!FileLib.exists("VolcAddons", "data")) new java.io.File("config/ChatTriggers/modules/VolcAddons/data").mkdir();
if (!FileLib.exists("VolcAddons", "data/contract.txt")) FileLib.write("VolcAddons", "data/contract.txt", CONTRACT);

const once = register("worldLoad", () => {
    once.unregister();
    delay(() => {
        // NEW UPDATE - Display update message when a new version is detected
        if (JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version != data.version) {
            data.version = JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version;
            ChatLib.chat(`\n${LOGO + WHITE + BOLD}LATEST UPDATE ${GRAY}[v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}]!`);
            JSON.parse(FileLib.read("VolcAddons", "changelog.json")).forEach(change => ChatLib.chat(change));
            ChatLib.chat("");
        }

        // FIRST RUN - Display welcome message for new users
        if (data.newUser) {
            ChatLib.chat(`\n${GOLD + BOLD + UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version + RESET}`);
            ChatLib.chat("LF GRAPES! (P.S. do /volcaddons, /volc, /va, /itee)");
            ChatLib.chat("Instruction manual (i think) => /va help\n");
            data.newUser = false;
        }
    }, 1000);
});

// HELP - Display help message for available commands
function getHelp() {
    ChatLib.chat(`\n${GOLD + BOLD + UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version + RESET}\n`);
    
    // General Commands
    ChatLib.chat(`${DARK_AQUA + BOLD}GENERAL COMMANDS:${RESET}`);
    ChatLib.chat(`${AQUA + BOLD}Settings: ${WHITE}/va ${GRAY}<${WHITE}gui, settings, toggles, version, help${GRAY}>`);
    ChatLib.chat(`${AQUA + BOLD}Waypoints: ${WHITE}/va ${GRAY}<${WHITE}waypoint, enigma, npc, zone, cat${GRAY}>`);
    ChatLib.chat(`${AQUA + BOLD}Lists: ${WHITE}/va ${GRAY}<${WHITE}cd, wl, bl, el, vl, dl, sl, il${GRAY}>`);
    ChatLib.chat(`${AQUA + BOLD}Economy: ${WHITE}/va ${GRAY}<${WHITE}calc, attribute, nw${GRAY}>`);
    ChatLib.chat(`${AQUA + BOLD}Misc: ${WHITE}/va ${GRAY}<${WHITE}splits, be${GRAY}>`);
    ChatLib.chat(`${AQUA + BOLD}Etc: ${WHITE}/<sk, pesttp>\n`);

    // Feature Commands
    ChatLib.chat(`${DARK_AQUA + BOLD}GENERAL FEATURES:${RESET}`);
    ChatLib.chat(`${AQUA + BOLD}Status Commands: ${WHITE}/va ${GRAY}<${WHITE}ping, fps, tps, yaw, pitch${GRAY}>`);
    ChatLib.chat(`${AQUA + BOLD}Stats Commands: ${WHITE}/va ${GRAY}<${WHITE}pet, stats, pt, sf${GRAY}>`);
    ChatLib.chat(`${AQUA + BOLD}Party Commands: ${WHITE}Refer to '/va toggles'`);
}

// Dev Mode
const devKey = new KeyBind("Developer Mode", data.devKey, "./VolcAddons.xdd");
register("gameUnload", () => { data.devKey = devKey.getKeyCode() });
devKey.registerKeyPress(() => {
    if (devKey.getKeyCode() === 0) return;

    const view = Player.lookingAt();
    if (view instanceof Entity) {
        // Get entity data
        const entity = view.entity;
        const extraData = {
            nbt: entity.getEntityData(),
            persistantID: entity.persistentID,
            entityClass: entity.class,
            entityAttribute: entity.func_70668_bt(),
            maxHP: entity.func_110148_a(SMA.field_111267_a).func_111125_b(),
            pitch: entity.field_70125_A,
            yaw: entity.field_70177_z,
            ticksAlive: entity.field_70173_aa
        };
        const textComponent = entity.func_145748_c_();
        let extraString = "";
        for (data in extraData) extraString += `${data}=${extraData[data]}, `;
        ChatLib.command(`ct copy ${view.toString()} ⦿ ${textComponent} ⦿ ExtraData[${extraString}]`, true);
        ChatLib.chat(`${LOGO + GREEN}Successfully copied entity data!`);
    } else {
        ChatLib.command(`ct copy ${view.toString()}`, true);
        ChatLib.chat(`${LOGO + GREEN}Successfully copied block data!`);
    }
});
register("guiKey", (_, keyCode, gui) => {
    if (keyCode !== devKey.getKeyCode()) return;
    const slot = gui?.getSlotUnderMouse()?.field_75222_d;
    if (slot === undefined) return;
    const item = Player.getContainer().getStackInSlot(slot);
    if (item === null) return;
    ChatLib.command(`ct copy ${item.getNBT()}`, true);
    ChatLib.chat(`${LOGO + GREEN}Successfully copied ${GRAY}[${item.getName() + GRAY}] ${GREEN}NBT!`);
});

// Open settings
function openSettings() {
    try {
        settings.openGUI();
    } catch (err) {
        ChatLib.chat(`${LOGO + RED}Error opening settings... Please run '/ct reload' to fix!`);
        register("gameUnload", () => {
            FileLib.delete("VolcAddons", "config.toml");
        }).setPriority(Priority.LOWEST);
    }
}

// /va ...args
register ("command", (...args) => {
    if (args === undefined) {
        openSettings();
        return;
    }

    // Parsing command and executing appropriate actions
    const command = args[0] === undefined ? undefined : args[0].toLowerCase();
    switch (command) {
        // Settings
        case undefined:
        case "settings":
            openSettings();
            break;
        case "toggle":
        case "toggles":
        case "control":
            toggles.openGUI();
            break;
        // Help
        case "help":
            getHelp();
            break;
        // Update
        case "update":
        case "version":
            getLatestReleaseVersion();
            break;
        // Contract
        case "contract":
            const Desktop = Java.type('java.awt.Desktop');
            const File = Java.type("java.io.File");
            Desktop.getDesktop().open(new File(Config.modulesFolder + "/VolcAddons/data/contract.txt"));
            ChatLib.chat(`${LOGO + RED}My wealth and treasure? If you want it, I'll let you have it! Look for it! I left it all at that place!`);
            break;
        case "wdr":
        case "sin":
            if (!FileLib.read("./VolcAddons/data", "contract.txt").split("\n")[51]?.includes(Player.getName())) {
                ChatLib.chat(`${LOGO + RED}The contract, signed it must be. Access granted, for you to see. ${DARK_GRAY}/va contract`);
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
        // Send coords
        case "coords":
        case "xyz":
            const randID = '@' + (Math.random() + 1).toString(36).substring(5);
            ChatLib.say(`x: ${Math.round(Player.getX())}, y: ${Math.round(Player.getY())}, z: ${Math.round(Player.getZ())} ${randID}`);
            break;
        // Testing (please work)
        case "test":
            ChatLib.chat(`${LOGO + DARK_AQUA + BOLD}Important Values:`)
            ChatLib.chat(`- ${AQUA + BOLD}World: ${WHITE + getWorld()}`);
            ChatLib.chat(`- ${AQUA + BOLD}Zone: ${WHITE + findZone()}`);
            const tier = getTier();
            if (tier !== 0) ChatLib.chat(`- ${AQUA + BOLD}Tier: ${WHITE + getTier()}`);
            ChatLib.chat(`- ${AQUA + BOLD}Leader: ${WHITE + getIsLeader()}`);
            ChatLib.chat(`- ${AQUA + BOLD}Party: ${WHITE + getInParty()}`);
            const party = getParty();
            if (party.size !== 0) ChatLib.chat(`- ${AQUA + BOLD}Members: ${WHITE + party.join(' ')}`);
            break;
        // Networth
        case "networth":
        case "nw":
            getNetworth(args[1] || Player.getName(), args[2]);
            break;
        // Bestiary Stuff
        case "bestiary":
        case "be":
            getBestiary(args);
            break;
        // Attribute Pricing
        case "attribute":
        case "attributes":
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
        // Kuudra Splits
        case "splits": // Kuudra splits
        case "split":
            getSplits(args);
            break;
        // User Waypoints
        case "waypoints":
        case "waypoint":
        case "wp":
            createWaypoint(args);
            break;
        // Bazaar Calculations
        case "calculate":
        case "calc":
            try {
                const MINION_ARGS = new Set(["hypergolic", "hg", "inferno", "gabagool", "gaba", "vampire", "vamp"]);
                switch(args[1]) {
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
                            ChatLib.chat(`${LOGO + RED}Please input as: ${WHITE}/va calc ${GRAY}<${WHITE}gdrag, hg, inferno, gaba, tabasco, vampire, compost${GRAY}>`);
                        }
                        break;
                }
            } catch (err) { ChatLib.chat(LOGO + DARK_RED + (err.cause ?? err)) }
            break;
        // Configure fairy souls
        case "fairy":
        case "soul":
            soulEdit(args, "fairy", "fairySouls", FAIRY_SOULS, getWorld());
            break;
        // Configure enigma souls
        case "enigma":
            soulEdit(args, "enigma", "enigmaSouls", ENIGMA_SOULS);
            break;
        // Configure enigma souls
        case "montezuma":
        case "mont":
        case "cat":
            soulEdit(args, "cat", "catSouls", CAT_SOULS);
            break;
        // Configure npc waypoints
        case "npc":
            riftWaypointEdit(args, "npc", RIFT_NPCS);
            break;
        // Configure zone waypoints
        case "zone":
            riftWaypointEdit(args, "zone", RIFT_ZONES);
            break;
        // Party Commands and Else Case
        default:
            args = args.map(w => w.toLowerCase());
            // Other args to check
            const PARTY_COMMANDS = new Set([
                "cringe", "gay", "racist", "femboy", "trans", "transphobic", "dice", "roll", "coin", "flip", "coinflip",
                "cf", "8ball", "rps", "waifu", "w", "women", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug", 
                "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet", "blush", "smile", "wave", "highfive", "handhold", "nom", 
                "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance", "cringe"
            ]);
            const INSTANCES = new Set(["f", "m", "t"]);
            const STATUS_ARGS = new Set(["ping", "tps", "fps", "cps", "yaw", "pitch", "dir", "direction", "day"]);
            const STAT_ARGS = new Set(["pet", "stats", "soulflow", "sf", "playtime", "pt", "legion"]);

            if (PARTY_COMMANDS.has(command) || (INSTANCES.has(command[0]) && !isNaN(command[1]))) executeCommand(Player.getName(), args, false);
            else if (STATUS_ARGS.has(command)) getStatus(command);
            else if (STAT_ARGS.has(command)) getStat(command);
            else {
                ChatLib.chat(`${LOGO + RED}Unkown command: "${command}" was not found!`);
                ChatLib.chat(`${LOGO + RED}Use '/va help' for a full list of commands.`);
            }
            break;
    }
}).setName("va", true).setAliases("volcaddons", "volc", "itee");
