// Utility Modules
import "./utils/player";
import settings from "./utils/settings";
import toggles from "./utils/toggles";
import "./utils/waypoints";
import { AQUA, BOLD, CAT_SOULS, CONTRACT, ENIGMA_SOULS, GOLD, GRAY, GREEN, ITALIC, LOGO, RED, RESET, RIFT_NPCS, RIFT_ZONES, UNDERLINE, WHITE } from "./utils/constants";
import { formatNumber, unformatNumber } from "./utils/functions";
import { getInParty, getIsLeader, getParty } from "./utils/party";
import { openGUI } from "./utils/overlay";
import { delay } from "./utils/thread";
import { getLatestReleaseVersion } from "./utils/updates";
import { data, updateList } from "./utils/variables";
import { findZone, getTier, getWorld } from "./utils/worlds";
// Utility Variable Control
data.autosave();
const CHANGED_SETTINGS = new Set(["partyCommands", "itemPrice", "bossAlert", "miniAlert", "vanqCounter"]);
for (const key in settings) if (CHANGED_SETTINGS.has(key) && typeof settings[key] !== "number") settings[key] = 0;

// General Features
import "./features/general/AntiGhostParty";
import "./features/general/ArmorDisplay";
import "./features/general/AutoTransfer";
import "./features/general/ChangeMessage";
import "./features/general/ChatWebhook";
import "./features/general/Cooldowns";
import "./features/general/ImageViewer";
import "./features/general/JoinParty";
import "./features/general/MouseReset";
import { executeCommand } from "./features/general/PartyCommands";
import { getStatus } from "./features/general/Performance";
import "./features/general/ReminderTimer";
import "./features/general/RemoveSelfie";
import "./features/general/Searchbar";
import "./features/general/ServerAlert";
import "./features/general/SkillTracker";
import "./features/general/SlotBinding";
import { getStat } from "./features/general/Statistics";
import { createWaypoint } from "./features/general/UserWaypoints";
// Economy Features
import "./features/economy/BitsAlert";
import "./features/economy/CoinTracker";
import "./features/economy/ContainerValue";
import "./features/economy/Economy";
import { calcGdrag } from "./features/economy/GdragCalc";
import "./features/economy/ItemPrice";
import { calcMinions } from "./features/economy/MinionCalc";
// Combat Features
import { getBestiary } from "./features/combat/Bestiary";
import "./features/combat/ComboDisplay";
import "./features/combat/DamageTracker";
import "./features/combat/EntityDetect";
import "./features/combat/GyroTimer";
import "./features/combat/HealthAlert";
import "./features/combat/KillCounter";
import "./features/combat/RagDetect";
import "./features/combat/SlayerDetect";
// Mining Features
import "./features/mining/PowderChest";
import "./features/mining/PowderTracker";
// Farming Features
import { calcCompost } from "./features/garden/ComposterCalc";
import "./features/garden/FarmingWebhook";
import { getNextVisitor } from "./features/garden/GardenTab";
import "./features/garden/GardenWarp";
import "./features/garden/JacobHighlight";
// Hub Features
import { setWarps } from "./features/hub/DianaWaypoint";
import "./features/hub/InquisitorDetect";
// Crimson Isle Features
import "./features/crimsonIsle/GoldenFishTimer";
import "./features/crimsonIsle/MythicDetect";
import "./features/crimsonIsle/TrophyCounter";
import "./features/crimsonIsle/VanqFeatures";
// Dungeon Features
import "./features/dungeon/StarDetect";
// Kuudra Features
import { getAttributes } from "./features/kuudra/AttributePricing";
import { calcTabasco } from "./features/kuudra/TabascoCalc";
import "./features/kuudra/KuudraAlerts";
import "./features/kuudra/KuudraCrates";
import "./features/kuudra/KuudraDetect";
import "./features/kuudra/KuudraProfit";
import { getSplits } from "./features/kuudra/KuudraSplits";
// Rift Features
import "./features/rift/DDR";
import "./features/rift/VampireSlayer";
import { riftWaypointEdit, soulEdit } from "./features/rift/RiftWaypoints";


// Launch Tests
if (!FileLib.exists("VolcAddons", "data")) new java.io.File("config/ChatTriggers/modules/VolcAddons/data").mkdir();
if (!FileLib.exists("VolcAddons", "data/contract.txt")) FileLib.write("VolcAddons", "data/contract.txt", CONTRACT);

const once = register("worldLoad", () => {
    // FIRST RUN - Display welcome message for new users
    if (data.newUser) {
        ChatLib.chat(`\n${GOLD + BOLD + UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version + RESET}`);
        ChatLib.chat("LF GRAPES! (P.S. do /volcaddons, /volc, /va, /itee)");
        ChatLib.chat("Instruction manual (i think) => /va help or DM 'grapefruited' on Discord!\n");
    
        data.newUser = false; // Marking that the user is no longer new
    }

    // NEW UPDATE - Display update message when a new version is detected
    delay(() => {
        if (JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version != data.version) {
            data.version = JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version;
            ChatLib.chat(`\n${LOGO + WHITE + BOLD}LATEST UPDATE ${GRAY}[v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}]!`);
            JSON.parse(FileLib.read("VolcAddons", "changelog.json")).forEach(change => ChatLib.chat(change));
            ChatLib.chat("");
        }
    }, 1000);
    once.unregister();
});

// HELP - Display help message for available commands
function getHelp() {
    ChatLib.chat(`\n${GOLD + BOLD + UNDERLINE}VolcAddons v${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version + RESET}\n`);
    
    // General Commands
    ChatLib.chat(`${AQUA + BOLD}GENERAL COMMANDS:${RESET}`);
    ChatLib.chat(`${GRAY + BOLD}Settings: ${RESET}/va <help, settings, gui, clear ${ITALIC}(resets text settings)${RESET}>`);
    ChatLib.chat(`${GRAY + BOLD}Waypoints: ${RESET}/va <coords, waypoint, clear, enigma, npc, zone>`);
    ChatLib.chat(`${GRAY + BOLD}Lists: ${RESET}/va <cd, whitelist, blacklist, emotelist, warplist>`);
    ChatLib.chat(`${GRAY + BOLD}Kuudra: ${RESET}/va splits`);
    ChatLib.chat(`${GRAY + BOLD}Economy: ${RESET}/va <calc, apex>\n`);

    // General Features
    ChatLib.chat(`${AQUA + BOLD}GENERAL FEATURES:${RESET}`);
    ChatLib.chat(`${GRAY + BOLD}Party Commands: ${RESET}?<warp, transfer, promote, demote, allinv>`);
    ChatLib.chat(`${GRAY + BOLD}Other Commands: ${RESET}?<w, dice, flip, 8ball, rps, cringe, gay, racist, trans, transphobic, femboy>\n`);
    
    // Crimson Isle Features
    ChatLib.chat(`${AQUA + BOLD}OTHER FEATURES:${RESET}`);
    ChatLib.chat(`Should be self explanatory, DM 'grapefruited' on discord if any questions...`);
}

// Dev Mode
const devKey = new KeyBind("Developer Mode", data.devKey, "./VolcAddons.xdd");
let SMA = Java.type('net.minecraft.entity.SharedMonsterAttributes');
register("gameUnload", () => { data.devKey = devKey.getKeyCode() });
devKey.registerKeyPress(() => {
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
        }
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
register("guiKey", (char, keyCode, gui) => {
    if (keyCode !== devKey.getKeyCode()) return;
    const slot = gui.getSlotUnderMouse()?.field_75222_d;
    if (slot === undefined) return;
    const item = Player.getContainer().getStackInSlot(slot);
    if (item === null) return;
    ChatLib.command(`ct copy ${item.getNBT()}`, true);
    ChatLib.chat(`${LOGO + GREEN}Successfully copied ${GRAY}[${item.getName() + GRAY}] ${GREEN}NBT!`);
});

// /va ...args
register ("command", (...args) => {
    if (args === undefined) {
        settings.openGUI();
        return;
    }

    // Parsing command and executing appropriate actions
    const command = args[0] === undefined ? undefined : args[0].toLowerCase();
    switch (command) {
        // Settings
        case undefined:
        case "settings":
            settings.openGUI();
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
        case "upadtes":
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
                ChatLib.chat(`${LOGO + RED}The contract, signed it must be. Access granted, for you to see. ${GRAY}/va contract`);
                break;
            }

            data.vision = !data.vision;
            if (data.vision) ChatLib.chat(`${LOGO + GREEN}The white eye has been activated.`);
            else ChatLib.chat(`${LOGO + RED}See no evil, hear no evil, speak no evil...`);
            break;
        // Move GUI
        case "gui":
            openGUI();
            break;
        // Clear setting text properties
        case "clear":
            settings.vanqParty = "";
            settings.kuudraRP = "";
            settings.kuudraCannonear = "";
            settings.kuudraStunner = "";
            settings.reminderText = "";
            ChatLib.chat(`${LOGO + GREEN}Successfully cleared all text property settings!`);
            break;
        // Set API key
        case "api": 
            if (args[1]) {
                settings.apiKey = args[1]
                ChatLib.chat(`${LOGO + GREEN}Succesfully set API key as ${settings.apiKey}!`);
            } else
                ChatLib.chat(`${LOGO + RED}Please input as /va api [key]!`);
            break;
        // Waypoint
        case "coords":
        case "xyz":
            const randID = '@' + (Math.random() + 1).toString(36).substring(5);
            ChatLib.say(`x: ${Math.round(Player.getX())}, y: ${Math.round(Player.getY())}, z: ${Math.round(Player.getZ())} ${randID}`);
            break;
        // Testing (please work)
        case "test":
            ChatLib.chat("World: " + getWorld());
            ChatLib.chat("Zone: " + findZone());
            ChatLib.chat("Tier: " + getTier());
            ChatLib.chat("Leader: " + getIsLeader());
            ChatLib.chat("Party: " + getInParty());
            if (getParty().size !== 0) ChatLib.chat("Members: " + getParty().join(' '));
            ChatLib.chat("Garden: " + getNextVisitor());
            break;
        // Bestiary Stuff
        case "be":
        case "bestiary":
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
            updateList(args, data.whitelist, "whitelist");
            break;
        case "blacklist":
        case "black":
        case "bl":
            updateList(args, data.blacklist, "blacklist");
            break;
        case "emotelist":
        case "emote":
        case "el":
            updateList(args, data.emotelist, "emotelist");
            break;
        case "cooldownlist":
        case "cdlist":
        case "cdl":
        case "cd":
            updateList(args, data.cooldownlist, "cdlist");
            break;
        case "moblist":
        case "mob":
        case "ml":
            updateList(args, data.moblist, "moblist");
            break;
        case "colorlist":
        case "color":
        case "cl":
            updateList(args, data.colorlist, "colorlist");
            break;
        case "warplist":
        case "warp":
            updateList(args, data.warplist, "warplist");
            setWarps();
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
                        else ChatLib.chat(`${LOGO + AQUA}Please enter as /va calc <gdrag, hypergolic, inferno, gabagool, tabasco, vampire, compost>`);
                        break;
                }
            } catch (err) { ChatLib.chat(`${LOGO + RED + err}`); }
            break;
        // Set Apex Price
        case "apex":
            data.apexPrice = unformatNumber(args[1]) || data.apexPrice;
            ChatLib.chat(`${LOGO + GREEN}Successfully changed Apex price to ${formatNumber(data.apexPrice)}!`);
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
            const PARTY_COMMANDS = new Set(
                ["cringe", "gay", "racist", "femboy", "trans", "transphobic", "dice", "roll", "coin", "flip", "coinflip",
                "cf", "8ball", "rps", "waifu", "w", "women"]
            );
            const INSTANCES = new Set(["f", "m", "t"]);
            const STATUS_ARGS = new Set(["ping", "tps", "fps", "cps"]);
            const STAT_ARGS = new Set(["pet", "stats", "soulflow", "sf"]);

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
