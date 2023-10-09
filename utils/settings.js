import { AQUA, BLUE, BOLD, DARK_RED, GRAY, GREEN, HEADER, ITALIC, RED } from "./constants";
import toggles from "./toggles";
import {
    @TextProperty,
	@PercentSliderProperty,
	@SliderProperty,
	@SwitchProperty,
    @ButtonProperty,
    @Vigilant,
    @CheckboxProperty,
    @SelectorProperty,
    @ColorProperty,
    Color
} from '../../Vigilance/index';


// Define the settings class using the @Vigilant decorator
@Vigilant("VolcAddons", "VolcAddons", {
    // Function to compare categories for sorting settings
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Party", "Economy", "Combat", "Mining", "Farming", "Hub", "Crimson Isles", "Dungeon", "Kuudra", "Rift"];
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
${DARK_RED + BOLD}CAUTION: Some features are technically chat macros, so use at own risk!`);

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
        `${HEADER}`);

        // Rift Category
        this.setCategoryDescription("Rift",
        `${HEADER}
${ITALIC}Related Commands: /va <enigma, npc, zone>`);

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

    @SwitchProperty({
        name: "Skyblock Toggle",
        description: `Toggle ${GREEN}ON ${GRAY}for features to only function in Skyblock or ${RED}OFF ${GRAY}to function anywhere.`,
        category: "General",
        subcategory: "Essential"
    })
    skyblockToggle = true;
    
    @ButtonProperty({
        name: "Discord",
        description: `${RED}Please be mindful of Discord links in chat as they may pose a security risk! ${GRAY}Server very cool, much wow.`,
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
        name: "Custom Emotes",
        description: `Replaces parts of chat messages containing emotes in ${AQUA}/emotes${GRAY}.
Add custom emotes with ${AQUA}/va emote${GRAY}.`,
        category: "General",
        subcategory: "General"
    })
    enableEmotes = false;

    @SliderProperty({
        name: "Draw Waypoint",
        description: `Creates waypoints out of patcher formated coords in chat. Set seconds until waypoints expire or as 0 to turn ${RED}OFF ${BLUE}(mob waypoints last 1/3 as long)${GRAY}.`,
        category: "General",
        subcategory: "General",
        min: 0,
        max: 120
    })
    drawWaypoint = 0;

    @PercentSliderProperty({
        name: "Image Viewer",
        description: `Patcher image viewer but works for every Imgur/Discord image and is laggier :).
Set percent of screen taken or as 0 to turn ${RED}OFF${GRAY}.`,
        category: "General",
        subcategory: "General"
    })
    imageRatio = 0.0;

    @SwitchProperty({
        name: "Remove Selfie Mode",
        description: "Removes selfie mode from perspective toggle.",
        category: "General",
        subcategory: "General"
    })
    removeSelfie = false;

    @SliderProperty({
        name: "Skill Tracker",
        description: `Tracks and displays skill XP's rate of gain. Set minutes of inactivity required for tracker to reset or as 0 to turn ${RED}OFF${GRAY}.
Move GUI with ${AQUA}/moveSkills ${GRAY}or reset tracker with ${AQUA}/resetSkills${GRAY}.`,
        category: "General",
        subcategory: "General",
        min: 0,
        max: 10
    })
    skillTracker = 0;

    // --- Server ---
    @SliderProperty({
        name: "Hide Far Entities",
        description: `Set maximum distance away from player an entity can be or as 0 to turn ${RED}OFF${GRAY}.`,
        category: "General",
        subcategory: "Server",
        min: 0,
        max: 128
    })
    hideFarEntity = 0;
    @SliderProperty({
        name: "Hide Close Players",
        description: `Set minimum distance away from player a player can be or as 0 to turn ${RED}OFF${GRAY}.`,
        category: "General",
        subcategory: "Server",
        min: 0,
        max: 128
    })
    hideCloseEntity = 0;
    @TextProperty({
        name: "Hide on bush",
        description: `Enter world names as [${AQUA}world1, world2, ...${GRAY}] for entity hiders to work on or leave empty for all worlds.`,
        category: "General",
        subcategory: "Server",
        placeholder: "world1, world2, ..."
    })
    hideWorlds = "";

    @SwitchProperty({
        name: "Hide All Particles",
        description: "Prevents any particle from rendering, including those not in settings.",
        category: "General",
        subcategory: "Server"
    })
    hideParticles = false;

    @SwitchProperty({
        name: "Server Alert",
        description: "Alerts player when they rejoin a previously joined server.",
        category: "General",
        subcategory: "Server"
    })
    serverAlert = true;

    @SwitchProperty({
        name: "Server Status",
        description: `Tracks various server/player statistics.\nMove GUI with ${AQUA}/moveStatus${GRAY}.`,
        category: "General",
        subcategory: "Server"
    })
    serverStatus = false;

    @ButtonProperty({
        name: "Open Status Toggles",
        description: "Press button to open toggles control panel.",
        category: "General",
        subcategory: "Server"
    })
    openStatus() {
        toggles.openGUI();
    }

    // --- Timer ---
    @SwitchProperty({
        name: "Item Cooldown Alert",
        description: `${GRAY}Alerts player once item cooldown timer expires.\nAdd cooldowns with ${AQUA}/va cd${GRAY}.`,
        category: "General",
        subcategory: "Timer"
    })
    cooldownAlert = false;

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
        description: `Set minutes until timer expires or as 0 to turn ${RED}OFF${GRAY}.`,
        category: "General",
        subcategory: "Timer",
        min: 0,
        max: 120
    })
    reminderTime = 0;

    // --- Webhook ---
    @TextProperty({
        name: "Discord Webhook",
        description: "Input Discord Webhook link to send the chat messages to.",
        category: "General",
        subcategory: "Webhook",
        protected: true
    })
    chatWebhook = "";

    @ButtonProperty({
        name: "Open Webhook Toggles",
        description: "Press button to open toggles control panel.",
        category: "General",
        subcategory: "Webhook"
    })
    openWebhooks() {
        toggles.openGUI();
    }


    // ████████████████████████████████████████████████████ PARTY ████████████████████████████████████████████████████

    // --- Party ---
    @SwitchProperty({
        name: "Anti Ghost Party",
        description: "Prevents creating ghost parties when inviting multiple players.",
        category: "Party",
        subcategory: "Party"
    })
    antiGhostParty = true;

    @SwitchProperty({
        name: "Auto Join Reparty",
        description: "Accepts reparty invites sent within 60 seconds.",
        category: "Party",
        subcategory: "Party"
    })
    joinRP = false;
    
    @SelectorProperty({
        name: "Auto Transfer",
        description: "Transfers party when certain conditions are met.",
        category: "Party",
        subcategory: "Party",
        options: ["OFF", "On Transfer", "On Kick"]
    })
    autoTransfer = 0;

    @TextProperty({
        name: "Server Kick Announce",
        description: `Set the message to be sent to the party if you get lobby kicked or as nothing to turn ${RED}OFF${GRAY}.`,
        category: "Party",
        subcategory: "Party"
    })
    kickAnnounce = "";

    @SwitchProperty({
        name: "Whitelist Rejoin",
        description: `Accepts party invites from players on the whitelist.
Add players with ${AQUA}/va whitelist${GRAY}.`,
        category: "Party",
        subcategory: "Party"
    })
    joinWhitelist = true;

    // --- Party Commands ---
    @SwitchProperty({
        name: "Leader Chat Commands",
        description: `Allows players in party to use leader commands.\nBanish players with ${AQUA}/va blacklist${GRAY}.`,
        category: "Party",
        subcategory: "Party Commands"
    })
    leaderCommands = false;
    @SelectorProperty({
        name: "Party Chat Commands",
        description: `Allows players to use party commands.\nBanish players with ${AQUA}/va blacklist${GRAY}.`,
        category: "Party",
        subcategory: "Party Commands",
        options: ["OFF", "All", "Party", "Guild", "DM"]
    })
    partyCommands = 0;
    @ButtonProperty({
        name: "Open Command Toggles",
        description: "Press button to open toggles control panel.",
        category: "Party",
        subcategory: "Party Commands"
    })
    openParty() {
        toggles.openGUI();
    }


    // ████████████████████████████████████████████████████ ECONOMY ████████████████████████████████████████████████████
    
    // --- Economy ---
    @SelectorProperty({
        name: "Bits Alert",
        description: `${DARK_RED}NEW! ${GRAY}Alerts player when they are no longer generating bits.`,
        category: "Economy",
        subcategory: "Economy",
        options: ["OFF", "Chat", "Title", "Both"]
    })
    bitsAlert = 0;

    @SliderProperty({
        name: "Coin Tracker",
        description: `Tracks and displays purse's rate of gain. Set minutes until tracker resets or as 0 to turn ${RED}OFF${GRAY}.
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
        max: 120
    })
    economyRefresh = 30;

    // --- Item Cost ---
    @SliderProperty({
        name: "Container Value",
        description: `Displays item values in any inventory. Set number of item prices to display or as 0 to turn ${RED}OFF${GRAY}.`,
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

    @SelectorProperty({
        name: "Price Type",
        description: `${DARK_RED}NEW! ${GRAY}Choose the type of bazaar pricing used in item calculations.`,
        category: "Economy",
        subcategory: "Pricing",
        options: ["Order", "Insta"]
    })
    priceType = 0;


    // ████████████████████████████████████████████████████ COMBAT ████████████████████████████████████████████████████

    // --- Bestiary ---
    @SwitchProperty({
        name: "Bestiary GUI",
        description: "Shows bestiary level as stack size and highlight uncompleted bestiary milestones.",
        category: "Combat",
        subcategory: "Bestiary"
    })
    bestiaryGUI = true;

    @SwitchProperty({
        name: "Broodmother Detect",
        description: `Alerts player when Broodmother spawns in lobby and displays time until next spawn.\nMove GUI with ${AQUA}/moveBrood${GRAY}.`,
        category: "Combat",
        subcategory: "Bestiary"
    })
    broodmotherDetect = false;
    
    @SwitchProperty({
        name: "Scuffed Kill Counter",
        description: `Tracks average amount of specific mob kills an hour ${BLUE}(must have Book of Stats)${GRAY}.`,
        category: "Combat",
        subcategory: "Bestiary"
    })
    killCounter = false;

    // --- Combat ---
    @SwitchProperty({
        name: "Combo Display",
        description: "Replaces Grandma Wolf combo chat messages with a custom GUI.",
        category: "Combat",
        subcategory: "Combat"
    })
    comboDisplay = false;
    
    @SelectorProperty({
        name: "Damage Tracer",
        description: `Spams chat with unique damage ticks ${BLUE}(this is meant for training dummies)${GRAY}.`,
        category: "Combat",
        subcategory: "Combat",
        options: ["OFF", "Simple", "Analytical"]
    })
    damageTracker = 0;
    
    @PercentSliderProperty({
        name: "Low Health Alert",
        description: `Set percent hp threshold until alert appears or as 0 to turn ${RED}OFF${GRAY}.`,
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
    ragDetect = true;

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
        options: ["OFF", "All Chat", "Party Chat", "Self"]
    })
    bossAlert = 0;
    @SelectorProperty({
        name: "Announce Miniboss Chat",
        description: `Sends coordinates of user slayer miniboss spawns to chat ${BLUE}(sounds must be ${GREEN}ON${BLUE})${GRAY}.`,
        category: "Combat",
        subcategory: "Slayer",
        options: ["OFF", "All Chat", "Party Chat", "Self"]
    })
    miniAlert = 0;

    @SwitchProperty({
        name: "Miniboss Highlight",
        description: `${DARK_RED}NEW! ${GRAY}Shows colorful hitboxes around slayer minibosses.`,
        category: "Combat",
        subcategory: "Slayer"
    })
    miniHighlight = false;

    @SliderProperty({
        name: "Slayer Spawn Warning",
        description: `Warns player when slayer boss is about to spawn. Set warning percentage or as 0 to turn ${RED}OFF${GRAY}.`,
        category: "Combat",
        subcategory: "Slayer",
        min: 0,
        max: 100
    })
    slayerSpawn = 0;


    // ████████████████████████████████████████████████████ MINING ████████████████████████████████████████████████████

    // --- Jinx ---
    @SwitchProperty({
        name: "2x Powder Alert",
        description: "Posts a webhook to the VolcAddons Discord when 2x Powder Event starts.",
        category: "Mining",
        subcategory: "Jinx"
    })
    powderAlert = true;

    @SliderProperty({
        name: "Powder Chest Detect",
        description: `Highlights and counts nearby powder chests. Set block range of detection radius or as 0 to turn ${RED}OFF${GRAY}.
Move GUI with ${AQUA}/moveChest${GRAY}.`,
        category: "Mining",
        subcategory: "Jinx",
        min: 0,
        max: 128
    })
    powderChest = 0;

    @SelectorProperty({
        name: "Powder Chest Hider",
        description: "Removes specified chat messages from powder chest openings.",
        category: "Mining",
        subcategory: "Jinx",
        options: ["OFF", "Items", "Powder", "All"]
    })
    powderHider = 0;

    @SliderProperty({
        name: "Powder Tracker",
        description: `Displays powders' rate of gain. Set minutes of inactivity required for tracker to reset or as 0 to turn ${RED}OFF${GRAY}.
Move GUI with ${AQUA}/movePowder ${GRAY}or reset tracker with ${AQUA}/resetPowder${GRAY}.`,
        category: "Mining",
        subcategory: "Jinx",
        min: 0,
        max: 10
    })
    powderTracker = 0;


    // ████████████████████████████████████████████████████ FARMING ████████████████████████████████████████████████████

    // --- Farming ---
    @SwitchProperty({
        name: "Jacob Reward Highlight",
        description: "Highlights unclaimed Jacob event rewards.",
        category: "Farming",
        subcategory: "Farming"
    })
    jacobReward = true;

    // --- Garden ---
    @SelectorProperty({
        name: "Composter Display",
        description: "Alerts player when composter is inactive or display time until it is inactive.",
        category: "Farming",
        subcategory: "Garden",
        options: ["OFF", "Inactive Title", "Time Overlay"]
    })
    compostTab = 0;

    @SwitchProperty({
        name: "Garden Warp Override",
        description: `Overrides any warp command with a ${AQUA}/warp garden ${GRAY}if theres an awaiting visitor.`,
        category: "Farming",
        subcategory: "Garden"
    })
    warpGarden = false;

    @SwitchProperty({
        name: "Garden Tab Display",
        description: `Displays garden visitors outside of tab menu.\nMove GUI with ${AQUA}/moveVisitors${GRAY}.`,
        category: "Farming",
        subcategory: "Garden"
    })
    gardenTab = false;

    @SwitchProperty({
        name: "Next Visitor Display",
        description: `Displays the time until a visitor can arrive.\nMove GUI with ${AQUA}/moveNext${GRAY}.`,
        category: "Farming",
        subcategory: "Garden"
    })
    nextVisitor = false;
    
    // --- Garden Webhook ---
    @TextProperty({
        name: "Discord Webhook",
        description: "Input Discord Webhook link to send the Garden Statistics to.",
        category: "Farming",
        subcategory: "Garden Webhook",
        protected: true
    })
    gardenWebhook = "";
    @SliderProperty({
        name: "Webhook Timer",
        description: `Set minutes until data is sent to webhook or as 0 to turn ${RED}OFF${GRAY}.`,
        category: "Farming",
        subcategory: "Garden Webhook",
        min: 0,
        max: 120
    })
    webhookTimer = 0;


    // ████████████████████████████████████████████████████ HUB ████████████████████████████████████████████████████

    // --- Diana ---
    @SwitchProperty({
        name: "Diana Waypoint",
        description: `Estimates theoretical burrow location using particles and pitch of Ancestral Spade cast ${BLUE}(POV Soopy servers are down)${GRAY}.
Particles must be ${GREEN}ON ${GRAY}and use ${AQUA}/togglemusic ${GRAY}to turn music ${RED}OFF${GRAY}.`,
        category: "Hub",
        subcategory: "Diana"
    })
    dianaWaypoint = false;
    @SwitchProperty({
        name: "Diana Warp",
        description: `Press F ${BLUE}(change in controls) ${GRAY}to warp to location closest to estimation.\nSet wanted warps with ${AQUA}/va warplist${GRAY}.`,
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
        options: ["OFF", "All Chat", "Party Chat", "Self"]
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
        options: ["OFF", "All Chat", "Party Chat", "Self"]
    })
    mythicLavaAnnounce = 0;

    @SwitchProperty({
        name: "Detect Mythic Lava Creature",
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

    @SelectorProperty({
        name: "Trophy Fish Counter",
        description: `Tracks number of trophy fishes caught and displays rates when on "Session View".
Move GUI with ${AQUA}/moveTrophy ${GRAY}or reset tracker with ${AQUA}/resetTrophy${GRAY}.`,
        category: "Crimson Isles",
        subcategory: "Fishing",
        options: ["OFF", "Overall View", "Session View"]
    })
    trophyCounter = 0;

    // --- Vanquisher ---
    @SelectorProperty({
        name: "Announce Vanquisher Chat",
        description: `Sends coordinates of user Vanquisher spawns ${BLUE}(only works if Vanquisher Auto-Warp is empty)${GRAY}.`,
        category: "Crimson Isles",
        subcategory: "Vanquisher",
        options: ["OFF", "All Chat", "Party Chat", "Self"]
    })
    vanqAlert = 0;

    @TextProperty({
        name: "Vanquisher Auto-Warp",
        description: `Parties and warps players in list to lobby on user Vanquisher spawn.\nEnable by entering party as [${AQUA}ign1, ign2, ...${GRAY}].`,
        category: "Crimson Isles",
        subcategory: "Vanquisher",
        placeholder: "ign1, ign2, ..."
    })
    vanqParty = "";

    @SelectorProperty({
        name: "Vanquisher Counter",
        description: `Tracks average kills of Vanquisher spawns ${BLUE}(must have Book of Stats)${GRAY}.
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

    // ████████████████████████████████████████████████████ DUNGEON ████████████████████████████████████████████████████

    // --- Star Detect ---
    @SelectorProperty({
        name: "Star Mob Highlight",
        description: "Detects star mobs and highlights them in the chosen method.",
        category: "Dungeon",
        subcategory: "Star Detect",
        options: ["OFF", "Highlight", "Box", "Outline"]
    })
    starDetect = 0;
    @ColorProperty({
        name: "Star Highlight Color",
        description: "Choose the highlight color.",
        category: "Dungeon",
        subcategory: "Star Detect",
    })
    starColor = Color.GREEN;


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
        description: `Displays a title for where Kuudra spawns in p4 ${BLUE}(requires animation skip, so don't fail @BananaTheBot)${GRAY}.`,
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
    @ButtonProperty({
        name: "Open Alert Toggles",
        description: "Press button to open toggles control panel.",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    openAlerts() {
        toggles.openGUI();
    }
    
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
        description: `Toggle ${RED}OFF ${GRAY}if you are a cringer without max chili pepper collection.`,
        category: "Kuudra",
        subcategory: "Kuudra Profit"
    })
    maxChili = false;


    // ████████████████████████████████████████████████████ RIFT ████████████████████████████████████████████████████
    
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
        description: `Set distance at which Enigma Soul waypoints will register or as 0 to turn ${RED}OFF${GRAY}.`,
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
        options: ["OFF", "All Chat", "Party Chat", "Self"]
    })
    announceMania = 0;
    
    @SwitchProperty({
        name: "Effigy Waypoint",
        description: "Displays waypoints of inactive Blood Effigies.",
        category: "Rift",
        subcategory: "Vampire",
    })
    effigyWaypoint = true;

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

export default new Settings;
