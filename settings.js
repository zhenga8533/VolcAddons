// Importing various constants and utilities
import { BOLD, DARK_RED, HEADER, ITALIC } from "./utils/constants";
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
        const categories = ["General", "Economy", "Combat", "Mining", "Hub", "Crimson Isles", "Kuudra", "Garden", "Rift"];
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
${BOLD}DM 'grapefruited' on Discord if you have any questions!
${DARK_RED}${BOLD}CAUTION: Some features are technically chat macros, so use at own risk!

${ITALIC}Related Commands: /va <help, settings, gui, clear, coords, waypoint, whitelist, blacklist, blocklist>`);

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
        this.addDependency("Warp Command (?warp)", "Leader Command Options");
        this.addDependency("Transfer Command (?transfer)", "Leader Command Options");
        this.addDependency("Promote Command (?promote)", "Leader Command Options");
        this.addDependency("Demote Command (?demote)", "Leader Command Options");
        this.addDependency("Allinvite Command (?<allinvite, allinv>)", "Leader Command Options");
        this.addDependency("Stream Command (?<streamopen, stream> [num])", "Leader Command Options");

        // Party Commands
        this.addDependency("Coords Command (?coords)", "Party Command Options");
        this.addDependency("Slander Command (?<racist, gay, cringe>)", "Party Command Options");
        this.addDependency("Dice Command (?<dice, roll>)", "Party Command Options");
        this.addDependency("Coinflip Command (?<coin, flip, coinflip, cf>)", "Party Command Options");
        this.addDependency("8ball Command (?8ball)", "Party Command Options");
        this.addDependency("RPS Command (?rps)", "Party Command Options");
        this.addDependency("Women Command (?<w, waifu, women>)", "Party Command Options");
        this.addDependency("Invite Command (?invite)", "Party Command Options");
        this.addDependency("Help Command (?help)", "Party Command Options");
        this.addDependency("Limbo Command (?<limbo, lobby, l>)", "Party Command Options");
        this.addDependency("Leave Command (?leave)", "Party Command Options");

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
        description: "https://developer.hypixel.net, you may need to /ct load after you set this!",
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
        description: "Download the Forge.jar file that alerts user when there is a new GitHub release and downloads on user input!",
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
        description: "Moves all current active GUIs, runs => /va gui.",
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
        description: "Blocks abiphone callers in /va blocklist.",
        category: "General",
        subcategory: "General"
    })
    abiphoneBlocker = false;
    
    @SwitchProperty({
        name: "Custom Emotes",
        description: "Replaces chat messages containing emotes in '/emotes list' and => /va emote <add, remove> [trigger] [emote]",
        category: "General",
        subcategory: "General"
    })
    enableEmotes = false;

    @SliderProperty({
        name: "Draw Waypoint",
        description: "Creates waypoints out of coords in chat. Set how many seconds until waypoints expire (Mob waypoints last 1/3 as long).",
        category: "General",
        subcategory: "General",
        min: 0,
        max: 120
    })
    drawWaypoint = 0;

    @SwitchProperty({
        name: "Remove Selfie Mode",
        description: "Removes the selfie mode from f5.",
        category: "General",
        subcategory: "General"
    })
    removeSelfie = false;

    @SliderProperty({
        name: "Skill Tracker",
        description: "Displays rate of xp gain for skills. Set minutes until tracker resets or as 0 to turn off (Use larger numbers when using wither impact). /moveSkills to move or /resetSkills to reset!",
        category: "General",
        subcategory: "General",
        min: 0,
        max: 10
    })
    skillTracker = 0;

    // --- Party ---
    @SwitchProperty({
        name: "Auto Join Reparty",
        description: "Automatically rejoin reparty invites within 60 seconds.",
        category: "General",
        subcategory: "Party"
    })
    joinRP = false;
    
    @SwitchProperty({
        name: "Auto Transfer Back",
        description: "Automatically transfers party back if someone transfer to you.",
        category: "General",
        subcategory: "Party"
    })
    autoTransfer = false;

    @SwitchProperty({
        name: "Whitelist Rejoin",
        description: "Automatically rejoin invites from players on the whitelist (/va whitelist <add/remove> [ign]).",
        category: "General",
        subcategory: "Party"
    })
    joinWhitelist = false;

    // --- Party Commands ---
    @SwitchProperty({
        name: "Leader Chat Commands",
        description: "Allows everyone besides /va blacklist to use leader commands.",
        category: "General",
        subcategory: "Party Commands"
    })
    leaderCommands = false;
    @SwitchProperty({
        name: "Leader Command Options",
        description: "Toggle to show what commands to show/hide.",
        category: "General",
        subcategory: "Party Commands"
    })
    leaderOptions = false;
    @CheckboxProperty({
        name: "Allinvite Command (?<allinvite, allinv>)",
        category: "General",
        subcategory: "Party Commands"
    })
    allinvCommand = true;
    @CheckboxProperty({
        name: "Demote Command (?demote)",
        category: "General",
        subcategory: "Party Commands"
    })
    demoteCommand = true;
    @CheckboxProperty({
        name: "Promote Command (?promote)",
        category: "General",
        subcategory: "Party Commands"
    })
    promoteCommand = true;
    @CheckboxProperty({
        name: "Stream Command (?<streamopen, stream> [num])",
        category: "General",
        subcategory: "Party Commands"
    })
    streamCommand = true;
    @CheckboxProperty({
        name: "Transfer Command (?transfer)",
        category: "General",
        subcategory: "Party Commands"
    })
    transferCommand = true;
    @CheckboxProperty({
        name: "Warp Command (?warp)",
        category: "General",
        subcategory: "Party Commands"
    })
    warpCommand = true;

    @SelectorProperty({
        name: "Party Chat Commands",
        description: "Allows everyone besides /va blacklist to use the party commands.",
        category: "General",
        subcategory: "Party Commands",
        options: ["OFF", "All", "Party", "Guild", "DM"]
    })
    partyCommands = 0;
    @SwitchProperty({
        name: "Party Command Options",
        description: "Toggle to show what commands to show/hide.",
        category: "General",
        subcategory: "Party Commands"
    })
    partyOptions = false;
    @CheckboxProperty({
        name: "Coords Command (?coords)",
        category: "General",
        subcategory: "Party Commands"
    })
    coordsCommand = true;
    @CheckboxProperty({
        name: "8ball Command (?8ball)",
        category: "General",
        subcategory: "Party Commands"
    })
    ballCommand = true;
    @CheckboxProperty({
        name: "Coinflip Command (?<coin, flip, coinflip, cf>)",
        category: "General",
        subcategory: "Party Commands"
    })
    coinCommand = true;
    @CheckboxProperty({
        name: "Dice Command (?<dice, roll>)",
        category: "General",
        subcategory: "Party Commands"
    })
    diceCommand = true;
    @CheckboxProperty({
        name: "Help Command (?help)",
        category: "General",
        subcategory: "Party Commands"
    })
    helpCommand = true;
    @CheckboxProperty({
        name: "Invite Command (?invite)",
        category: "General",
        subcategory: "Party Commands"
    })
    inviteCommand = true;
    @CheckboxProperty({
        name: "Limbo Command (?<limbo, lobby, l>)",
        category: "General",
        subcategory: "Party Commands"
    })
    limboCommand = false;
    @CheckboxProperty({
        name: "Leave Command (?leave)",
        category: "General",
        subcategory: "Party Commands"
    })
    leaveCommand = false;
    @CheckboxProperty({
        name: "RPS Command (?rps)",
        category: "General",
        subcategory: "Party Commands"
    })
    rpsCommand = true;
    @CheckboxProperty({
        name: "Slander Command (?<racist, gay, cringe>)",
        category: "General",
        subcategory: "Party Commands"
    })
    slanderCommand = true;
    @CheckboxProperty({
        name: "Women Command (?<w, waifu, women>)",
        category: "General",
        subcategory: "Party Commands"
    })
    womenCommand = true;

    // --- Server ---
    @SliderProperty({
        name: "Recent Server Alert",
        description: "Alerts player when they join a server they have joined in the past 'X' minutes. Set as 0 to turn off.",
        category: "General",
        subcategory: "Server",
        min: 0,
        max: 30
    })
    serverAlert = 0;

    @SwitchProperty({
        name: "Server Status",
        description: "Displays user ping/TPS/FPS as a HUD. /moveStatus to move.",
        category: "General",
        subcategory: "Server"
    })
    serverStatus = false;

    // --- Timer ---
    @TextProperty({
        name: "Reminder Text",
        description: "What will appear on screen when timer runs out.",
        category: "General",
        subcategory: "Timer",
        placeholder: "konnichiwa."
    })
    reminderText = "";
    @SliderProperty({
        name: "Reminder Time",
        description: "Alerts the player every 'X' minutes. Set as 0 to turn off.",
        category: "General",
        subcategory: "Timer",
        min: 0,
        max: 120
    })
    reminderTime = 0;


    // ████████████████████████████████████████████████████ ECONOMY ████████████████████████████████████████████████████
    
    // --- Economy ---
    @SliderProperty({
        name: "Coin Tracker",
        description: "Displays rate of coin gain in purse. Set minutes until tracker resets or as 0 to turn off. /moveCoins to move or /resetCoins to reset!",
        category: "Economy",
        subcategory: "Economy",
        min: 0,
        max: 10
    })
    coinTracker = 0;

    @SliderProperty({
        name: "Economy Refresh",
        description: "Set how often Hypixel economy trackets reloads. Runs => /updateEconomy.",
        category: "Economy",
        subcategory: "Economy",
        min: 0,
        max: 180
    })
    economyRefresh = 60;

    // --- Item Cost ---
    @SliderProperty({
        name: "Container Value",
        description: "Displays item values in any chest GUI. Select number of item values to show in overlay or set as 0 to turn off.",
        category: "Economy",
        subcategory: "Pricing",
        min: 0,
        max: 54
    })
    containerValue = 0;

    @SelectorProperty({
        name: "Item Price",
        description: "Calculates and displays complete item price, including enchants, modifiers, and attributes.",
        category: "Economy",
        subcategory: "Pricing",
        options: ["OFF", "Advanced View", "Tooltip View", "Omnipotent View"]
    })
    itemPrice = 0;


    // ████████████████████████████████████████████████████ COMBAT ████████████████████████████████████████████████████

    // --- Combat ---
    @SwitchProperty({
        name: "Broken Hyperion",
        description: "Uses 'Book of Stats' and 'Champion' to track when Wither Impact breaks.",
        category: "Combat",
        subcategory: "Combat"
    })
    brokenHyp = false;

    @SwitchProperty({
        name: "Damage Tracker",
        description: "Spams in chat every damage tick that happens around you. (meant for training dummies)",
        category: "Combat",
        subcategory: "Combat"
    })
    damageTracker = false;
    
    @PercentSliderProperty({
        name: "Low Health Alert",
        description: "Alerts the player if their health drops lower than the percent input (set 0% to toggle off).",
        category: "Combat",
        subcategory: "Combat"
    })
    healthAlert = 0.0;

    @SwitchProperty({
        name: "Ragnarok Detection",
        description: "Alerts the player when Ragnarok Ability finishes casting.",
        category: "Combat",
        subcategory: "Combat"
    })
    ragDetect = false;

    // --- Dungeon ---
    @SelectorProperty({
        name: "Dungeon Rejoin",
        description: "Automatically rejoins last completed dungeon when 4 players join your party. (does not reparty)",
        category: "Combat",
        subcategory: "Dungeon",
        options: ["OFF", "No DT", "Social Farm", "Visitor Magnet"]
    })
    dungeonRejoin = 0;

    @SwitchProperty({
        name: "Watcher Alert",
        description: "Calls an emergency meeting after all watcher mobs are spawned/killed.",
        category: "Combat",
        subcategory: "Dungeon"
    })
    watcherAlert = false;

    // --- Gyrokinetic Wand ---
    @SwitchProperty({
        name: "Cells Alignment Alert",
        description: "Alerts the player when gyro is about to run out.",
        category: "Combat",
        subcategory: "Gyrokinetic Wand"
    })
    gyroAlert = false;
    @SwitchProperty({
        name: "Cells Alignment Timer",
        description: "Displays the time left before Cells Alignment ends. /moveAlignTimer to move.",
        category: "Combat",
        subcategory: "Gyrokinetic Wand"
    })
    gyroTimer = false;

    // --- Slayer ---
    @SelectorProperty({
        name: "Announce Boss Chat",
        description: "Sends coords of any slayer bosses that you spawn to chat.",
        category: "Combat",
        subcategory: "Slayer",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    bossAlert = 0;
    @SelectorProperty({
        name: "Announce Miniboss Chat",
        description: "Sends coords of any slayer minibosses that you spawn to chat. (sounds must be on)",
        category: "Combat",
        subcategory: "Slayer",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    miniAlert = 0;


    // ████████████████████████████████████████████████████ MINING ████████████████████████████████████████████████████
    @SliderProperty({
        name: "Powder Tracker",
        description: "Displays rate of powder gain (only chests). Set minutes until tracker resets or as 0 to turn off. /movePowder to move and /resetPowder to reset!",
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
        description: "Estimates Diana burrows from particles and pitch of Ancestral Spade (particles => ON, /togglemusic => OFF) [POV Soopy servers are down]",
        category: "Hub",
        subcategory: "Diana"
    })
    dianaWaypoint = false;
    @SwitchProperty({
        name: "Diana Warp",
        description: "Press F (change button in controls) to warp to closest location to guess. Do /va warplist to set warps.",
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
        description: "Calls an emergency meeting if a burrow gets detected.",
        category: "Hub",
        subcategory: "Griffin Burrow"
    })
    dianaAmogus = false;
    @SwitchProperty({
        name: "Burrow Chat Alert",
        description: "Shows a message in chat if a burrow gets detected.",
        category: "Hub",
        subcategory: "Griffin Burrow"
    })
    dianaChat = false;

    // --- Inquisitor ---
    @SwitchProperty({
        name: "Detect Inquisitor",
        description: "Alerts player of a Inquisitor if they get near one.",
        category: "Hub",
        subcategory: "Inquisitor"
    })
    detectInq = false;
    @SelectorProperty({
        name: "Announce Inquisitor Chat",
        description: "Sends coords of any Inquisitors that you spawn to chat.",
        category: "Hub",
        subcategory: "Inquisitor",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    inqAlert = 0;

    @SelectorProperty({
        name: "Inquisitor Counter",
        description: "Counts average kills until Inquisitor spawns. /moveInq to move or /resetInq to reset!",
        category: "Hub",
        subcategory: "Inquisitor",
        options: ["OFF", "Overall View", "Session View"]
    })
    inqCounter = 0;
    

    // ████████████████████████████████████████████████████ CRIMSON ISLES ████████████████████████████████████████████████████

    // --- Fishing ---
    @SelectorProperty({
        name: "Announce Mythic Creature Spawn",
        description: "Sends coords of any mythic lava creature that you spawn to chat.",
        category: "Crimson Isles",
        subcategory: "Fishing",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    mythicLavaAnnounce = 0;

    @SwitchProperty({
        name: "Mythic Lava Creature Detect",
        description: "Detects when you get near a Jawbus or Thunder.",
        category: "Crimson Isles",
        subcategory: "Fishing"
    })
    mythicLavaDetect = false;

    @SwitchProperty({
        name: "Golden Fish Timer",
        description: "Sets the 3 minute timer between each rod cast for a golden fish spawn. /moveTimer to move.",
        category: "Crimson Isles",
        subcategory: "Fishing"
    })
    goldenFishAlert = false;

    // --- Vanquisher ---
    @SelectorProperty({
        name: "Announce Vanquisher Chat",
        description: "Sends coords of any Vanquishers that you spawn to chat. (Only works if Vanquisher Auto-Warp is empty!)",
        category: "Crimson Isles",
        subcategory: "Vanquisher",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    vanqAlert = 0;

    @TextProperty({
        name: "Vanquisher Auto-Warp",
        description: "Automatically invites your party to your lobby when you spawn a vanquisher. Enable by entering party as [name, name, ...]",
        category: "Crimson Isles",
        subcategory: "Vanquisher"
    })
    vanqParty = "";

    @SelectorProperty({
        name: "Vanquisher Counter",
        description: "Counts kills until Vanquisher spawns (Uses Book of Stats). /moveCounter to move or /resetCounter to reset!",
        category: "Crimson Isles",
        subcategory: "Vanquisher",
        options: ["OFF", "Overall View", "Session View"]
    })
    vanqCounter = 0;

    @SwitchProperty({
        name: "Vanquisher Detection",
        description: "Alerts player of a vanquisher if they get near one. /moveVanq to move.",
        category: "Crimson Isles",
        subcategory: "Vanquisher"
    })
    vanqDetect = false;
    @SwitchProperty({
        name: "Vanquisher Detection Sound",
        description: "Plays a sound whenever a vanquisher gets detected.",
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
        description: "Tells you where Kuudra is going to spawn in p4. Requires animation skip, so don't fail @BananaTheBot.",
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    kuudraSpawn = false;

    @SwitchProperty({
        name: "Kuudra Splits",
        description: "Displays Kuudra splits and records best splits in t5 (/va splits). /moveSplits to move.",
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    kuudraSplits = false;

    @SwitchProperty({
        name: "Show Supply/Fuel Waypoints",
        description: "Creates waypoints for the supplies/fuels near you.",
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    kuudraCrates = false;

    @SwitchProperty({
        name: "Show Supply Piles",
        description: "Creates waypoints for the supplies that are not fully built.",
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    kuudraBuild = false;

    // --- Kuudra Alert ---
    @SwitchProperty({
        name: "Kuudra Alerts",
        description: "Alerts the player of events in Kuudra instance.",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    kuudraAlerts = false;
    @SwitchProperty({
        name: "Kuudra Alert Options",
        description: "Toggle to show what alert to show/hide.",
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
        description: "Tracks who is stunning Kuudra for 'Kuudra Alerts'. (leave empty if you want to track anyone who gets eaten)",
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
        description: "Tracks who is shooting the ballista for 'Kuudra Alerts'. (leave empty if you want to track anyone who mounts cannon)",
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
        description: "Alerts the player once they reach 'X' tokens. Set as 0 to turn off. (Only alerts once per run)",
        category: "Kuudra",
        subcategory: "Kuudra Alert",
        min: 0,
        max: 1000
    })
    tokenAlert = 0;
    
    // --- Kuudra Profit ---
    @SwitchProperty({
        name: "Kuudra Profit",
        description: "Display an overlay for accurate (i think) Kuudra chest prices.",
        category: "Kuudra",
        subcategory: "Kuudra Profit"
    })
    kuudraProfit = false;
    @SelectorProperty({
        name: "Kuudra Profit Tracker (WIP)",
        description: "Tracks hourly Kuudra profit, very untested. /moveKPT to move tracker.",
        category: "Kuudra",
        subcategory: "Kuudra Profit",
        options: ["OFF", "Overall View", "Session View"]
    })
    kuudraProfitTracker = 0;
    @SwitchProperty({
        name: "Tabasco Enjoyer",
        description: "Turn off if you are a cringer without max chili pepper collection.",
        category: "Kuudra",
        subcategory: "Kuudra Profit"
    })
    maxChili = true;
    

    // ████████████████████████████████████████████████████ GARDEN ████████████████████████████████████████████████████

    // --- Garden ---
    @SwitchProperty({
        name: "Composter Alert",
        description: "Displays an alert when the composter becomes inactive.",
        category: "Garden",
        subcategory: "Garden"
    })
    gardenCompost = false;

    @SwitchProperty({
        name: "Garden Warp Override",
        description: "Overrides any warp command with a garden warp if theres a visitor.",
        category: "Garden",
        subcategory: "Garden"
    })
    warpGarden = false;

    @SwitchProperty({
        name: "Garden Tab Display",
        description: "Displays the garden visitors outside of tab menu. /moveVisitors to move.",
        category: "Garden",
        subcategory: "Garden"
    })
    gardenTab = false;

    @SwitchProperty({
        name: "Next Visitor Display",
        description: "Displays the time until a visitor will visit. /moveNext to move.",
        category: "Garden",
        subcategory: "Garden"
    })
    nextVisitor = false;


    // ████████████████████████████████████████████████████ RIFT ████████████████████████████████████████████████████
    
    // --- Awooga v2 ---
    @SwitchProperty({
        name: "Weird Tuba Timer",
        description: "Display the time remaining on weird(er) tuba buff. /moveTubaTimer to move.",
        category: "Rift",
        subcategory: "Awooga v2",
    })
    tubaTimer = false;
    @SwitchProperty({
        name: "Weird Tuba Alert",
        description: "Alerts you when Weird Tuba is off cooldown.",
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
        description: "Display the distance at which soul waypoints will render. (Set as 0 to turn off)",
        category: "Rift",
        subcategory: "Rift",
        min: 0,
        max: 1000
    })
    enigmaWaypoint = 0;
    
    @SwitchProperty({
        name: "Montezuma Soul Waypoints",
        description: "Displays waypoints for nearby discord kittens.",
        category: "Rift",
        subcategory: "Rift",
    })
    catWaypoint = false;

    // --- Vampire ---
    @SelectorProperty({
        name: "Announce Mania Phase",
        description: "Sends coords when vampire goes into mania.",
        category: "Rift",
        subcategory: "Vampire",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    announceMania = 0;
    
    @SwitchProperty({
        name: "Effigy Waypoint",
        description: "Spawns a waypoint on inactive effigies.",
        category: "Rift",
        subcategory: "Vampire",
    })
    effigyWaypoint = false;

    @SwitchProperty({
        name: "Enlarge Impel Message",
        description: "Converts impel to be disturbingly noticable.",
        category: "Rift",
        subcategory: "Vampire",
    })
    vampireImpel = false;
    
    @SwitchProperty({
        name: "Vampire Hitbox",
        description: "Draws a small box around the vampire for the disabled.",
        category: "Rift",
        subcategory: "Vampire",
    })
    vampireHitbox = false;
    
    @SwitchProperty({
        name: "Vampire Attack Display",
        description: "Tracks the Mania, Twinclaws, and Ichor directly on user screen. /moveVamp to move.",
        category: "Rift",
        subcategory: "Vampire",
    })
    vampireAttack = false;
}

export default new Settings    
