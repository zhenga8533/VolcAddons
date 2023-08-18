// Importing various constants and utilities
import { AQUA, BOLD, DARK_AQUA, DARK_RED, GRAY, HEADER, ITALIC, RED } from "./utils/constants";
import {
    @TextProperty,
	@PercentSliderProperty,
	@SliderProperty,
	@SwitchProperty,
    @ButtonProperty,
    @Vigilant,
    @CheckboxProperty,
    @SelectorProperty,
} from '../Vigilance/index';


// Define the settings class using the @Vigilant decorator
@Vigilant("VolcAddons", "VolcAddons", {
    // Function to compare categories for sorting settings
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Party", "Economy", "Combat", "Mining", "Hub", "Crimson Isles", "Kuudra", "Garden", "Rift"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {
    constructor() {
        this.initialize(this);

        // Set category descriptions for different groups of settings

        // General Category
        this.setCategoryDescription("General",
        `${HEADER}
${ITALIC}Related Commands: /va <help, settings, gui, clear, coords, waypoint, whitelist, blacklist, blocklist>
${DARK_RED}${BOLD}CAUTION: Some features are technically chat macros, so use at own risk!`);

        // Economy Category
        this.setCategoryDescription("Economy",
        `${HEADER}
${ITALIC}Related Commands: /va <attribute, calc>`);

        // Combat Category
        this.setCategoryDescription("Combat",
        `${HEADER}
    ${ITALIC}Related Commands: /va be`);

        // Hub Category
        this.setCategoryDescription("Hub",
        `${HEADER}
${ITALIC}Related Commands: /va warplist`);

        // Crimson Isles Category
        this.setCategoryDescription("Crimson Isles",
        `${HEADER}
${ITALIC}Related Commands: /va <calc, apex>`);

        // Kuudra Category
        this.setCategoryDescription("Kuudra",
        `${HEADER}
${ITALIC}Related Commands: /va <attribute, splits>`);

        // Garden Category
        this.setCategoryDescription("Garden",
        `${HEADER}
${ITALIC}Related Commands: /va calc compost`);

        // Rift Category
        this.setCategoryDescription("Rift",
        `${HEADER}
${ITALIC}Related Commands: /va <enigma, npc, zone>`);

        // Leader / Party Commands
        this.addDependency(`Allinvite Command ${DARK_AQUA}?<allinvite, allinv>`, "Leader Command Options");
        this.addDependency(`Demote Command ${DARK_AQUA}?demote`, "Leader Command Options");
        this.addDependency(`Warp Command ${DARK_AQUA}?warp`, "Leader Command Options");
        this.addDependency(`Transfer Command ${DARK_AQUA}?transfer`, "Leader Command Options");
        this.addDependency(`Promote Command ${DARK_AQUA}?promote`, "Leader Command Options");
        this.addDependency(`Stream Command ${DARK_AQUA}?<streamopen, stream> [num]`, "Leader Command Options");

        // Party Commands
        this.addDependency(`Coords Command ${DARK_AQUA}?coords`, "Party Command Options");
        this.addDependency(`Slander Command ${DARK_AQUA}?<racist, gay, cringe>`, "Party Command Options");
        this.addDependency(`Dice Command ${DARK_AQUA}?<dice, roll>`, "Party Command Options");
        this.addDependency(`Coinflip Command ${DARK_AQUA}?<coin, flip, coinflip, cf>`, "Party Command Options");
        this.addDependency(`8ball Command ${DARK_AQUA}?8ball`, "Party Command Options");
        this.addDependency(`RPS Command ${DARK_AQUA}?rps`, "Party Command Options");
        this.addDependency(`Women Command ${DARK_AQUA}?<w, waifu, women>`, "Party Command Options");
        this.addDependency(`Invite Command ${DARK_AQUA}?invite`, "Party Command Options");
        this.addDependency(`Help Command ${DARK_AQUA}?help`, "Party Command Options");
        this.addDependency(`Limbo Command ${DARK_AQUA}?<limbo, lobby, l>`, "Party Command Options");
        this.addDependency(`Leave Command ${DARK_AQUA}?leave`, "Party Command Options");

        // Kuudra Alerts
        this.addDependency("Kuudra Alert Options", "Kuudra Alerts");
        const kuudraAlerts = [
            "No Key", "Unready", "Choose Route", "Pickup Supply", "Building", "Fresh Tools", "Fuel Percent", "Stunner Eaten", "Stunner",
            "Mount Ballista", "Cannonear", "Stun", "Dropship", "Token"
        ];
        kuudraAlerts.forEach(alert => {
            this.addDependency(`${alert} Alert`, "Kuudra Alerts");
            this.addDependency(`${alert} Alert`, "Kuudra Alert Options");
        });

        // Etc
        this.addDependency("Burrow Amogus Alert", "Burrow Detection");
        this.addDependency("Burrow Chat Alert", "Burrow Detection");
        this.addDependency("Vanquisher Detection Sound", "Vanquisher Detection");
    }
    

    // ████████████████████████████████████████████████████ GENERAL FEATURES ████████████████████████████████████████████████████

    // --- Essential ---
    @TextProperty({
        name: "API Key",
        description: `Input your API key (this will be changed later).\nYou may need to run ${AQUA}/ct load ${GRAY}after inputting key.`,
        category: "General",
        subcategory: "Essential",
        protected: true
    })
    apiKey = "";

    @ButtonProperty({
        name: "Discord",
        description: "Just posting releases here, don't expect too much :).",
        category: "General",
        subcategory: "Essential",
        placeholder: "Yamete Kudasai"
    })
    discordLink() {
        java.awt.Desktop.getDesktop().browse(new java.net.URI("https://discord.gg/ftxB4kG2tw"));
    }

    @ButtonProperty({
        name: "GitHub Updater",
        description: "Download the Forge.jar file for new release alerts and effortless updating!",
        category: "General",
        subcategory: "Essential",
        placeholder: "Download"
    })
    downloadForge() {
        const url = "https://raw.githubusercontent.com/zhenga8533/VolcAddons/main/forge/VolcAddons-1.0.jar";
        java.awt.Desktop.getDesktop().browse(new java.net.URI(url));
    }

    @ButtonProperty({
        name: "Move GUI",
        description: `Moves all current active GUIs.\nRuns ${AQUA}/va gui${GRAY}.`,
        category: "General",
        subcategory: "Essential",
        placeholder: "Move GUI"
    })
    moveGUI() {
        ChatLib.command("va gui", true);
    }

    // --- General ---
    @SwitchProperty({
        name: "Abiphone Blocker",
        description: `Blocks abiphone callers in ${AQUA}/va blocklist${GRAY}.`,
        category: "General",
        subcategory: "General"
    })
    abiphoneBlocker = false;
    
    @SwitchProperty({
        name: "Custom Emotes",
        description: `Replaces parts of chat messages containing emotes in ${AQUA}/emotes${GRAY}.
Add custom emotes with ${AQUA}/va emote${GRAY}.`,
        category: "General",
        subcategory: "General"
    })
    enableEmotes = false;

    @SliderProperty({
        name: "Draw Waypoint",
        description: `Creates waypoints out of patcher formated coords in chat. Set seconds until waypoints expire or as 0 to turn OFF ${RED}(mob waypoints last 1/3 as long)${GRAY}.`,
        category: "General",
        subcategory: "General",
        min: 0,
        max: 120
    })
    drawWaypoint = 0;

    @SwitchProperty({
        name: "Remove Selfie Mode",
        description: "Removes selfie mode from perspective toggle.",
        category: "General",
        subcategory: "General"
    })
    removeSelfie = false;

    @SliderProperty({
        name: "Skill Tracker",
        description: `Tracks and displays skill XP's rate of gain. Set minutes of inactivity required for tracker to reset or as 0 to turn OFF.
Move GUI with ${AQUA}/moveSkills ${GRAY}or reset tracker with ${AQUA}/resetSkills${GRAY}.`,
        category: "General",
        subcategory: "General",
        min: 0,
        max: 10
    })
    skillTracker = 0;

    // --- Server ---
    @SliderProperty({
        name: "Recent Server Alert",
        description: `Alerts player when they rejoin a recent server. Set minutes until a server is no longer "recent" or as 0 to turn OFF.`,
        category: "General",
        subcategory: "Server",
        min: 0,
        max: 30
    })
    serverAlert = 0;

    @SwitchProperty({
        name: "Server Status",
        description: `Tracks and displays user ping, TPS, and FPS.\nMove GUI with ${AQUA}/moveStatus${GRAY}.`,
        category: "General",
        subcategory: "Server"
    })
    serverStatus = false;

    // --- Timer ---
    @TextProperty({
        name: "Reminder Text",
        description: "Set the warning text that appears when timer expires.",
        category: "General",
        subcategory: "Timer",
        placeholder: "konnichiwa."
    })
    reminderText = "";
    @SliderProperty({
        name: "Reminder Time",
        description: "Set minutes until timer expires or as 0 to turn OFF.",
        category: "General",
        subcategory: "Timer",
        min: 0,
        max: 120
    })
    reminderTime = 0;


    // ████████████████████████████████████████████████████ PARTY ████████████████████████████████████████████████████

    // --- Party ---
    @SwitchProperty({
        name: "Auto Ghost Party",
        description: "Prevents creating ghost parties when inviting multiple players.",
        category: "Party",
        subcategory: "Party"
    })
    antiGhostParty = false;

    @SwitchProperty({
        name: "Auto Join Reparty",
        description: "Accepts reparty invites sent within 60 seconds.",
        category: "Party",
        subcategory: "Party"
    })
    joinRP = false;
    
    @SwitchProperty({
        name: "Auto Transfer Back",
        description: "Prevents player from being party leader by instantly transferring party back.",
        category: "Party",
        subcategory: "Party"
    })
    autoTransfer = false;

    @SwitchProperty({
        name: "Whitelist Rejoin",
        description: `Accepts party invites from players on the whitelist.
Add players with ${AQUA}/va whitelist${GRAY}.`,
        category: "Party",
        subcategory: "Party"
    })
    joinWhitelist = false;

    // --- Party Commands ---
    @SwitchProperty({
        name: "Leader Chat Commands",
        description: `Allows players in party to use leader commands.\nBanish players with ${AQUA}/va blacklist${GRAY}.`,
        category: "Party",
        subcategory: "Party Commands"
    })
    leaderCommands = false;
    @SwitchProperty({
        name: "Leader Command Options",
        description: "Toggle to display leader commands control panel.",
        category: "Party",
        subcategory: "Party Commands"
    })
    leaderOptions = false;
    @CheckboxProperty({
        name: `Allinvite Command ${DARK_AQUA}?<allinvite, allinv>`,
        category: "Party",
        subcategory: "Party Commands"
    })
    allinvCommand = true;
    @CheckboxProperty({
        name: `Demote Command ${DARK_AQUA}?demote`,
        category: "Party",
        subcategory: "Party Commands"
    })
    demoteCommand = true;
    @CheckboxProperty({
        name: `Promote Command ${DARK_AQUA}?promote`,
        category: "Party",
        subcategory: "Party Commands"
    })
    promoteCommand = true;
    @CheckboxProperty({
        name: `Stream Command ${DARK_AQUA}?<streamopen, stream> [num]`,
        category: "Party",
        subcategory: "Party Commands"
    })
    streamCommand = true;
    @CheckboxProperty({
        name: `Transfer Command ${DARK_AQUA}?transfer`,
        category: "Party",
        subcategory: "Party Commands"
    })
    transferCommand = true;
    @CheckboxProperty({
        name: `Warp Command ${DARK_AQUA}?warp`,
        category: "Party",
        subcategory: "Party Commands"
    })
    warpCommand = true;

    @SelectorProperty({
        name: "Party Chat Commands",
        description: `Allows players to use party commands.\nBanish players with ${AQUA}/va blacklist${GRAY}.`,
        category: "Party",
        subcategory: "Party Commands",
        options: ["OFF", "All", "Party", "Guild", "DM"]
    })
    partyCommands = 0;
    @SwitchProperty({
        name: "Party Command Options",
        description: "Toggle to display party commands control panel.",
        category: "Party",
        subcategory: "Party Commands"
    })
    partyOptions = false;
    @CheckboxProperty({
        name: `Coords Command ${DARK_AQUA}?coords`,
        category: "Party",
        subcategory: "Party Commands"
    })
    coordsCommand = true;
    @CheckboxProperty({
        name: `8ball Command ${DARK_AQUA}?8ball`,
        category: "Party",
        subcategory: "Party Commands"
    })
    ballCommand = true;
    @CheckboxProperty({
        name: `Coinflip Command ${DARK_AQUA}?<coin, flip, coinflip, cf>`,
        category: "Party",
        subcategory: "Party Commands"
    })
    coinCommand = true;
    @CheckboxProperty({
        name: `Dice Command ${DARK_AQUA}?<dice, roll>`,
        category: "Party",
        subcategory: "Party Commands"
    })
    diceCommand = true;
    @CheckboxProperty({
        name: `Help Command ${DARK_AQUA}?help`,
        category: "Party",
        subcategory: "Party Commands"
    })
    helpCommand = true;
    @CheckboxProperty({
        name: `Invite Command ${DARK_AQUA}?invite`,
        category: "Party",
        subcategory: "Party Commands"
    })
    inviteCommand = true;
    @CheckboxProperty({
        name: `Limbo Command ${DARK_AQUA}?<limbo, lobby, l>`,
        category: "Party",
        subcategory: "Party Commands"
    })
    limboCommand = false;
    @CheckboxProperty({
        name: `Leave Command ${DARK_AQUA}?leave`,
        category: "Party",
        subcategory: "Party Commands"
    })
    leaveCommand = false;
    @CheckboxProperty({
        name: `RPS Command ${DARK_AQUA}?rps`,
        category: "Party",
        subcategory: "Party Commands"
    })
    rpsCommand = true;
    @CheckboxProperty({
        name: `Slander Command ${DARK_AQUA}?<racist, gay, cringe>`,
        category: "Party",
        subcategory: "Party Commands"
    })
    slanderCommand = true;
    @CheckboxProperty({
        name: `Women Command ${DARK_AQUA}?<w, waifu, women>`,
        category: "Party",
        subcategory: "Party Commands"
    })
    womenCommand = true;


    // ████████████████████████████████████████████████████ ECONOMY ████████████████████████████████████████████████████
    
    // --- Economy ---
    @SliderProperty({
        name: "Coin Tracker",
        description: `Tracks and displays purse's rate of gain. Set minutes until tracker resets or as 0 to turn OFF.
Move GUI with ${AQUA}/moveCoins ${GRAY}or reset tracker with ${AQUA}/resetCoins${GRAY}.`,
        category: "Economy",
        subcategory: "Economy",
        min: 0,
        max: 10
    })
    coinTracker = 0;

    @SliderProperty({
        name: "Economy Refresh",
        description: `Set minutes until Auction/Bazaar data gets updated.\nRuns ${AQUA}/updateEconomy${GRAY}.`,
        category: "Economy",
        subcategory: "Economy",
        min: 0,
        max: 180
    })
    economyRefresh = 60;

    // --- Item Cost ---
    @SliderProperty({
        name: "Container Value",
        description: "Displays item values in any chest GUI. Set number of item prices to display or as 0 to turn OFF.",
        category: "Economy",
        subcategory: "Pricing",
        min: 0,
        max: 54
    })
    containerValue = 0;

    @SelectorProperty({
        name: "Item Price",
        description: "Displays complete item price including enchants, modifiers, and attributes.",
        category: "Economy",
        subcategory: "Pricing",
        options: ["OFF", "Advanced View", "Tooltip View", "Omnipotent View"]
    })
    itemPrice = 0;


    // ████████████████████████████████████████████████████ COMBAT ████████████████████████████████████████████████████

    // --- Combat ---
    @SwitchProperty({
        name: "Damage Tracker",
        description: `Spams chat with every damage tick ${RED}(this is meant for training dummies)${GRAY}.`,
        category: "Combat",
        subcategory: "Combat"
    })
    damageTracker = false;
    
    @PercentSliderProperty({
        name: "Low Health Alert",
        description: "Set percent hp threshold until alert appears or as 0 to turn OFF.",
        category: "Combat",
        subcategory: "Combat"
    })
    healthAlert = 0.0;

    @SwitchProperty({
        name: "Ragnarok Detection",
        description: "Displays an alert title when Ragnarock Axe finishes casting or is canceled.",
        category: "Combat",
        subcategory: "Combat"
    })
    ragDetect = false;

    // --- Dungeon ---
    @SelectorProperty({
        name: "Dungeon Rejoin",
        description: `Rejoins last completed dungeon when 4 players join your party ${RED}(does NOT reparty)${GRAY}.`,
        category: "Combat",
        subcategory: "Dungeon",
        options: ["OFF", "No DT", "Social Farm", "Visitor Magnet"]
    })
    dungeonRejoin = 0;

    @SwitchProperty({
        name: "Watcher Alert",
        description: "Alerts player when all Watcher mobs are spawned and killed.",
        category: "Combat",
        subcategory: "Dungeon"
    })
    watcherAlert = false;

    // --- Gyrokinetic Wand ---
    @SwitchProperty({
        name: "Cells Alignment Alert",
        description: "Alerts player when Cells Alignment is about to run out.",
        category: "Combat",
        subcategory: "Gyrokinetic Wand"
    })
    gyroAlert = false;
    @SwitchProperty({
        name: "Cells Alignment Timer",
        description: `Displays the time left before Cells Alignment ends.\nMove GUI with ${AQUA}/moveAlignTimer${GRAY}.`,
        category: "Combat",
        subcategory: "Gyrokinetic Wand"
    })
    gyroTimer = false;

    // --- Slayer ---
    @SelectorProperty({
        name: "Announce Boss Chat",
        description: "Sends coordinates of user slayer boss spawns to chat.",
        category: "Combat",
        subcategory: "Slayer",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    bossAlert = 0;
    @SelectorProperty({
        name: "Announce Miniboss Chat",
        description: `Sends coordinates of user slayer miniboss spawns to chat ${RED}(sounds must be ON)${GRAY}.`,
        category: "Combat",
        subcategory: "Slayer",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    miniAlert = 0;


    // ████████████████████████████████████████████████████ MINING ████████████████████████████████████████████████████
    @SliderProperty({
        name: "Powder Tracker",
        description: `Displays powders' rate of gain ${RED}(ONLY chests)${GRAY}. Set minutes of inactivity required for tracker to reset or as 0 to turn OFF.
Move GUI with ${AQUA}/movePowder ${GRAY}or reset tracker with ${AQUA}/resetPowder${GRAY}.`,
        category: "Mining",
        subcategory: "Powder",
        min: 0,
        max: 10
    })
    powderTracker = 0;


    // ████████████████████████████████████████████████████ HUB ████████████████████████████████████████████████████

    // --- Diana ---
    @SwitchProperty({
        name: "Diana Waypoint",
        description: `Estimates theoretical burrow location using particles and pitch of Ancestral Spade cast ${RED}(POV Soopy servers are down)${GRAY}.
Particles must be ON and use ${AQUA}/togglemusic ${GRAY}to turn music OFF.`,
        category: "Hub",
        subcategory: "Diana"
    })
    dianaWaypoint = false;
    @SwitchProperty({
        name: "Diana Warp",
        description: `Press F ${RED}(change in controls) ${GRAY}to warp to location closest to estimation.\nSet wanted warps with ${AQUA}/va warplist${GRAY}.`,
        category: "Hub",
        subcategory: "Diana"
    })
    dianaWarp = false;

    // --- Griffin Burrow ---
    @SwitchProperty({
        name: "Burrow Detection",
        description: "Detects and creates waypoints to the burrow particles around you.",
        category: "Hub",
        subcategory: "Griffin Burrow"
    })
    dianaBurrow = false;
    @SwitchProperty({
        name: "Burrow Amogus Alert",
        description: "Calls an emergency meeting once a burrow is detected.",
        category: "Hub",
        subcategory: "Griffin Burrow"
    })
    dianaAmogus = false;
    @SwitchProperty({
        name: "Burrow Chat Alert",
        description: "Sends a message in chat once a burrow is detected.",
        category: "Hub",
        subcategory: "Griffin Burrow"
    })
    dianaChat = false;

    // --- Inquisitor ---
    @SwitchProperty({
        name: "Detect Inquisitor",
        description: "Alerts player of nearby Inquisitors.",
        category: "Hub",
        subcategory: "Inquisitor"
    })
    detectInq = false;
    @SelectorProperty({
        name: "Announce Inquisitor Chat",
        description: "Sends coordinates of user Inquisitor spawns to chat.",
        category: "Hub",
        subcategory: "Inquisitor",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    inqAlert = 0;

    @SelectorProperty({
        name: "Inquisitor Counter",
        description: `Tracks average kills of Inquisitor spawns.\nMove GUI with ${AQUA}/moveInq ${GRAY}or reset tracker with ${AQUA}/resetInq${GRAY}.`,
        category: "Hub",
        subcategory: "Inquisitor",
        options: ["OFF", "Overall View", "Session View"]
    })
    inqCounter = 0;
    

    // ████████████████████████████████████████████████████ CRIMSON ISLES ████████████████████████████████████████████████████

    // --- Fishing ---
    @SelectorProperty({
        name: "Announce Mythic Creature Spawn",
        description: "Sends coordinates of user mythic lava creature spawns to chat.",
        category: "Crimson Isles",
        subcategory: "Fishing",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    mythicLavaAnnounce = 0;

    @SwitchProperty({
        name: "Mythic Lava Creature Detect",
        description: "Alerts player of nearby Thunders or Lord Jawbuses.",
        category: "Crimson Isles",
        subcategory: "Fishing"
    })
    mythicLavaDetect = false;

    @SwitchProperty({
        name: "Golden Fish Timer",
        description: `Sets a 4 minute timer on rod cast to track Golden Fish reset.\nMove GUI with ${AQUA}/moveTimer${GRAY}.`,
        category: "Crimson Isles",
        subcategory: "Fishing"
    })
    goldenFishAlert = false;

    // --- Vanquisher ---
    @SelectorProperty({
        name: "Announce Vanquisher Chat",
        description: `Sends coordinates of user Vanquisher spawns ${RED}(only works if Vanquisher Auto-Warp is empty)${GRAY}.`,
        category: "Crimson Isles",
        subcategory: "Vanquisher",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    vanqAlert = 0;

    @TextProperty({
        name: "Vanquisher Auto-Warp",
        description: `Parties and warps players in list to lobby on user Vanquisher spawn.\nEnable by entering party as [${AQUA}ign, ign, ...${GRAY}].`,
        category: "Crimson Isles",
        subcategory: "Vanquisher"
    })
    vanqParty = "";

    @SelectorProperty({
        name: "Vanquisher Counter",
        description: `Tracks average kills of Vanquisher spawns ${RED}(must have Book of Stats)${GRAY}.
Move GUI with ${AQUA}/moveCounter ${GRAY}or reset tracker with ${AQUA}/resetCounter${GRAY}.`,
        category: "Crimson Isles",
        subcategory: "Vanquisher",
        options: ["OFF", "Overall View", "Session View"]
    })
    vanqCounter = 0;

    @SwitchProperty({
        name: "Vanquisher Detection",
        description: `Alerts player of nearby Vanquishers.\nMove GUI with ${AQUA}/moveVanq${GRAY}.`,
        category: "Crimson Isles",
        subcategory: "Vanquisher"
    })
    vanqDetect = false;
    @SwitchProperty({
        name: "Vanquisher Detection Sound",
        description: "Calls an emergency meeting once a Vanquisher is detected.",
        category: "Crimson Isles",
        subcategory: "Vanquisher"
    })
    vanqSound = false;


    // ████████████████████████████████████████████████████ KUUDRA ████████████████████████████████████████████████████

    // --- Kuudra ---
    @SwitchProperty({
        name: "Kuudra HP Display",
        description: "Displays Kuudra's HP as a percent and renders it on the boss.",
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    kuudraHP = false;

    @SwitchProperty({
        name: "Kuudra Spawn",
        description: `Displays a title for where Kuudra spawns in p4 ${RED}(requires animation skip, so don't fail @BananaTheBot)${GRAY}.`,
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    kuudraSpawn = false;

    @SwitchProperty({
        name: "Kuudra Splits",
        description: `Displays and records Kuudra splits.\nMove GUI with ${AQUA}/moveSplits ${GRAY}or view splits with ${AQUA}/va splits${GRAY}.`,
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    kuudraSplits = false;

    @SwitchProperty({
        name: "Show Crate Waypoints",
        description: "Creates waypoints to nearby supplies and fuels.",
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    kuudraCrates = false;

    @SwitchProperty({
        name: "Show Supply Piles",
        description: "Creates waypoints to uncompleted supply piles.",
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    kuudraBuild = false;

    // --- Kuudra Alert ---
    @SwitchProperty({
        name: "Kuudra Alerts",
        description: "Alerts player of important events Kuudra.",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    kuudraAlerts = false;
    @SwitchProperty({
        name: "Kuudra Alert Options",
        description: "Toggle to display alerts control panel.",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    alertsToggle = false;
    @CheckboxProperty({
        name: "No Key Alert",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    keyAlert = true;
    @CheckboxProperty({
        name: "Unready Alert",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    unreadyAlert = true;
    @CheckboxProperty({
        name: "Choose Route Alert",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    routeAlert = true;
    @CheckboxProperty({
        name: "Pickup Supply Alert",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    supplyAlert = true;
    @CheckboxProperty({
        name: "Building Alert",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    buildingAlert = true;
    @CheckboxProperty({
        name: "Fresh Tools Alert",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    freshAlert = true;
    @CheckboxProperty({
        name: "Fuel Percent Alert",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    fuelAlert = true;
    @CheckboxProperty({
        name: "Fresh Tools Alert",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    freshAlert = true;
    @CheckboxProperty({
        name: "Stunner Eaten Alert",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    eatenAlert = true;
    @TextProperty({
        name: "Stunner Alert",
        description: "Tracks who is stunning Kuudra (leave empty to track everyone).",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    kuudraStunner = "";
    @CheckboxProperty({
        name: "Mount Ballista Alert",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    ballistaAlert = true;
    @TextProperty({
        name: "Cannonear Alert",
        description: "Tracks who is shooting the ballista (leave empty to track everyone).",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    kuudraCannonear = "";
    @CheckboxProperty({
        name: "Stun Alert",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    stunAlert = true;
    @CheckboxProperty({
        name: "Dropship Alert",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    dropshipAlert = true;
    @SliderProperty({
        name: "Token Alert",
        description: "Set token threshold before alert goes off or as 0 to turn OFF (only alerts once per run).",
        category: "Kuudra",
        subcategory: "Kuudra Alert",
        min: 0,
        max: 1000
    })
    tokenAlert = 0;
    
    // --- Kuudra Profit ---
    @SwitchProperty({
        name: "Kuudra Profit",
        description: `Display overall profit of Kuudra chests.\nMove GUI with ${AQUA}/moveKP${GRAY}.`,
        category: "Kuudra",
        subcategory: "Kuudra Profit"
    })
    kuudraProfit = false;
    @SelectorProperty({
        name: "Kuudra Profit Tracker",
        description: `Display Kuudra hourly rate of gain. Move GUI with ${AQUA}/moveKPT or reset tracker with ${AQUA}/resetKPT${GRAY}.`,
        category: "Kuudra",
        subcategory: "Kuudra Profit",
        options: ["OFF", "Overall View", "Session View"]
    })
    kuudraProfitTracker = 0;
    @SwitchProperty({
        name: "Tabasco Enjoyer",
        description: "Toggle OFF if you are a cringer without max chili pepper collection.",
        category: "Kuudra",
        subcategory: "Kuudra Profit"
    })
    maxChili = true;
    

    // ████████████████████████████████████████████████████ GARDEN ████████████████████████████████████████████████████

    // --- Garden ---
    @SwitchProperty({
        name: "Composter Alert",
        description: "Alerts player when the composter is inactive.",
        category: "Garden",
        subcategory: "Garden"
    })
    gardenCompost = false;

    @SwitchProperty({
        name: "Garden Warp Override",
        description: `Overrides any warp command with a ${AQUA}/warp garden ${GRAY}if theres an awaiting visitor.`,
        category: "Garden",
        subcategory: "Garden"
    })
    warpGarden = false;

    @SwitchProperty({
        name: "Garden Tab Display",
        description: `Displays garden visitors outside of tab menu.\nMove GUI with ${AQUA}/moveVisitors${GRAY}.`,
        category: "Garden",
        subcategory: "Garden"
    })
    gardenTab = false;

    @SwitchProperty({
        name: "Next Visitor Display",
        description: `Displays the time until a visitor can arrive.\nMove GUI with ${AQUA}/moveNext${GRAY}.`,
        category: "Garden",
        subcategory: "Garden"
    })
    nextVisitor = false;
    
    // --- Garden Webhook ---
    @TextProperty({
        name: "Discord Webhook",
        description: "Input Discord Webhook link to send the Garden Statistics to.",
        category: "Garden",
        subcategory: "Garden Webhook",
        protected: true
    })
    gardenWebhook = "";
    @SliderProperty({
        name: "Webhook Timer",
        description: "Set minutes until data is sent to webhook or as 0 to turn OFF.",
        category: "Garden",
        subcategory: "Garden Webhook",
        min: 0,
        max: 120
    })
    webhookTimer = 0;


    // ████████████████████████████████████████████████████ RIFT ████████████████████████████████████████████████████
    
    // --- Awooga v2 ---
    @SwitchProperty({
        name: "Weird Tuba Timer",
        description: `Display the time remaining on weird(er) tuba buff.\nMove GUI with ${AQUA}/moveTubaTimer${GRAY}.`,
        category: "Rift",
        subcategory: "Awooga v2",
    })
    tubaTimer = false;
    @SwitchProperty({
        name: "Weird Tuba Alert",
        description: "Alerts player when Weird Tuba can be recast.",
        category: "Rift",
        subcategory: "Awooga v2",
    })
    tubaAlert = false;
    
    // --- Rift ---
    @SwitchProperty({
        name: "DDR Helper",
        description: "Replaces Dance Room titles with custom ones.",
        category: "Rift",
        subcategory: "Rift",
    })
    ddrHelper = false;

    @SliderProperty({
        name: "Enigma Soul Waypoints",
        description: "Set distance at which Enigma Soul waypoints will register or as 0 to turn OFF.",
        category: "Rift",
        subcategory: "Rift",
        min: 0,
        max: 1000
    })
    enigmaWaypoint = 0;
    
    @SwitchProperty({
        name: "Montezuma Soul Waypoints",
        description: "Displays waypoints of nearby discord kittens.",
        category: "Rift",
        subcategory: "Rift",
    })
    catWaypoint = false;

    // --- Vampire ---
    @SelectorProperty({
        name: "Announce Mania Phase",
        description: "Sends coordinates when user's Vampire boss goes into mania.",
        category: "Rift",
        subcategory: "Vampire",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    announceMania = 0;
    
    @SwitchProperty({
        name: "Effigy Waypoint",
        description: "Displays waypoints of inactive Blood Effigies.",
        category: "Rift",
        subcategory: "Vampire",
    })
    effigyWaypoint = false;

    @SwitchProperty({
        name: "Enlarge Impel Message",
        description: "Converts Impel messages to be disturbingly noticable.",
        category: "Rift",
        subcategory: "Vampire",
    })
    vampireImpel = false;
    
    @SwitchProperty({
        name: "Vampire Hitbox",
        description: "Renders a small box around the vampire and colors it in when boss is steakable.",
        category: "Rift",
        subcategory: "Vampire",
    })
    vampireHitbox = false;
    
    @SwitchProperty({
        name: "Vampire Attack Display",
        description: `Displays time of Mania, Twinclaws, and Ichor attacks.\nMove GUI with ${AQUA}/moveVamp${GRAY}.`,
        category: "Rift",
        subcategory: "Vampire",
    })
    vampireAttack = false;
}

export default new Settings    
