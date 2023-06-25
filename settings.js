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

@Vigilant("VolcAddons", "VolcAddons", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Combat", "Hub", "Dungeon", "Crimson Isles", "Kuudra", "Garden", "Rift"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {
    constructor() {
        this.initialize(this)
        this.setCategoryDescription("General", 
`${HEADER}
${BOLD}DM 'grapefruited' on Discord if you have any questions!
${DARK_RED}${BOLD}CAUTION: Some features are technically chat macros, so use at own risk!

${ITALIC}Related Commands: /va <help, settings, clear, coords, waypoint, whitelist, blacklist, blocklist>`);
        this.setCategoryDescription("Combat",
`${HEADER}`);
        this.setCategoryDescription("Hub",
`${HEADER}
${ITALIC}Related Commands: /va warplist`);
        this.setCategoryDescription("Crimson Isles",
`${HEADER}
${ITALIC}Related Commands: /va <calc, apex>`);
        this.setCategoryDescription("Kuudra",
`${HEADER}
${ITALIC}Related Commands: /va splits`);
        this.setCategoryDescription("Garden",
`${HEADER}`);
        this.setCategoryDescription("Rift",
`${HEADER}
${ITALIC}Related Commands: /va <enigma, npc, zone>`);

        // HUDs
        this.addDependency("Move Timer HUD", "Golden Fish Timer");
        this.addDependency("Move Gyro Timer HUD", "Cells Alignment Timer");
        this.addDependency("Move Splits HUD", "Kuudra Splits");
        this.addDependency("Move Visitors HUD", "Garden Tab Display");
        this.addDependency("Move Next Visitor HUD", "Next Visitor Display");
        this.addDependency("Move Vampire HUD", "Vampire Attack Display");
        this.addDependency("Move Tuba HUD", "Weird Tuba Timer");
        
        // Leader / Party Commands
        this.addDependency("Leader Command Options", "Leader Chat Commands");
        this.addDependency("Warp Command (?warp)", "Leader Command Options");
        this.addDependency("Transfer Command (?transfer)", "Leader Command Options");
        this.addDependency("Promote Command (?promote)", "Leader Command Options");
        this.addDependency("Demote Command (?demote)", "Leader Command Options");
        this.addDependency("Allinvite Command (?<allinvite, allinv>)", "Leader Command Options");
        this.addDependency("Stream Command (?<streamopen, stream> [num])", "Leader Command Options");

        this.addDependency("Party Command Chat", "Party Chat Commands");
        this.addDependency("Party Command Options", "Party Chat Commands");
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
        this.addDependency("No Key Alert", "Kuudra Alert Options");
        this.addDependency("Unready Alert", "Kuudra Alert Options");
        this.addDependency("Choose Route Alert", "Kuudra Alert Options");
        this.addDependency("Pickup Supply Alert", "Kuudra Alert Options");
        this.addDependency("Building Alert", "Kuudra Alert Options");
        this.addDependency("Fresh Tools Alert", "Kuudra Alert Options");
        this.addDependency("Fuel Percent Alert", "Kuudra Alert Options");
        this.addDependency("Stunner Eaten Alert", "Kuudra Alert Options");
        this.addDependency("Stunner IGN", "Kuudra Alerts");
        this.addDependency("Mount Ballista Alert", "Kuudra Alert Options");
        this.addDependency("Cannonear IGN", "Kuudra Alerts");
        this.addDependency("Stun Alert", "Kuudra Alert Options");
        this.addDependency("Dropship Alert", "Kuudra Alert Options");
        this.addDependency("Token Alert", "Kuudra Alerts");

        // Etc
        this.addDependency("Burrow Amogus Alert", "Burrow Detection");
        this.addDependency("Burrow Chat Alert", "Burrow Detection");
        this.addDependency("Vanquisher Detection Sound", "Vanquisher Detection");
    }
    

    // GENERAL FEATURES

    // General
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
    
    @SliderProperty({
        name: "Recent Server Alert",
        description: "Alerts player when they join a server they have joined in the past 'X' minutes. Set as 0 to turn off.",
        category: "General",
        subcategory: "General",
        min: 0,
        max: 30
    })
    serverAlert = 0;

    @SwitchProperty({
        name: "Remove Selfie Mode",
        description: "Removes the selfie mode from f5.",
        category: "General",
        subcategory: "General"
    })
    removeSelfie = false;

    // Timer
    @TextProperty({
        name: "Reminder Text",
        description: "What will appear on screen when timer runs out.",
        category: "General",
        subcategory: "Timer"
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

    // Party
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

    // Party Commands
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

    @SwitchProperty({
        name: "Party Chat Commands",
        description: "Allows everyone besides /va blacklist to use the party commands.",
        category: "General",
        subcategory: "Party Commands"
    })
    partyCommands = false;
    @SelectorProperty({
        name: "Party Command Chat",
        description: "Select which chat party commands can be detected in.",
        category: "General",
        subcategory: "Party Commands",
        options: ["All", "Party", "Guild", "DM"]
    })
    partyChat = 0;
    @SwitchProperty({
        name: "Party Command Options",
        description: "Toggle to show what commands to show/hide.",
        category: "General",
        subcategory: "Party Commands"
    })
    partyOptions = false;
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
    
    // Skills
    @SliderProperty({
        name: "Skill Tracker",
        description: "Displays rate of xp gain for skills. Set minutes until tracker pauses or as 0 to turn off. (Use larger numbers when using wither impact)",
        category: "General",
        subcategory: "Skills",
        min: 0,
        max: 10
    })
    trackSkills = 0;
    @ButtonProperty({
        name: "Move Skills Display",
        description: "Move the location of the Skill Tracker. Runs => /moveSkills",
        category: "General",
        subcategory: "Skills"
    })
    moveSkills() {
        ChatLib.command("moveSkills", true);
    }
    @ButtonProperty({
        name: "Reset Skills Tracker",
        description: "Resets tracking for every skill. Runs => /resetSkills",
        category: "General",
        subcategory: "Skills"
    })
    resetSkills() {
        ChatLib.command("resetSkills", true);
    }


    // COMBAT

    // Combat
    @SwitchProperty({
        name: "Broken Hyperion",
        description: "Uses 'Book of Stats' and 'Champion' to track when Wither Impact breaks.",
        category: "Combat",
        subcategory: "Combat"
    })
    brokenHyp = false;
    
    @PercentSliderProperty({
        name: "Low Health Alert",
        description: "Alerts the player if their health drops lower than the percent input (set 0% to toggle off).",
        category: "Combat",
        subcategory: "Combat"
    })
    healthAlert = 0.0;

    @SwitchProperty({
        name: "Ragnarok Detection",
        description: "Detects when Ragnarok Ability finishes casting (sounds must be on).",
        category: "Combat",
        subcategory: "Combat"
    })
    ragDetect = false;

    // Gyrokinetic Wand
    @SwitchProperty({
        name: "Cells Alignment Alert",
        description: "Alerts the player when gyro is about to run out.",
        category: "Combat",
        subcategory: "Gyrokinetic Wand"
    })
    gyroAlert = false;
    @SwitchProperty({
        name: "Cells Alignment Timer",
        description: "Displays the time left before Cells Alignment ends.",
        category: "Combat",
        subcategory: "Gyrokinetic Wand"
    })
    gyroTimer = false;
    @ButtonProperty({
        name: "Move Gyro Timer HUD",
        description: "Move the location of the Cells Alignement Timer. Runs => /moveAlignTimer",
        category: "Combat",
        subcategory: "Gyrokinetic Wand"
    })
    moveGyroTimer() {
        ChatLib.command("moveAlignTimer", true);
    }

    // Slayer
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


    // HUB

    // Diana
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
    dianaAlert = 0;
    

    // CRIMSON ISLES

    // Fishing
    @SwitchProperty({
        name: "Golden Fish Timer",
        description: "Sets the 3 minute timer between each rod cast for a golden fish spawn.",
        category: "Crimson Isles",
        subcategory: "Fishing"
    })
    goldenFishAlert = false;
    @ButtonProperty({
        name: "Move Timer HUD",
        description: "Move the location of the Golden Fish Timer. Runs => /moveTimer",
        category: "Crimson Isles",
        subcategory: "Fishing"
    })
    moveTimer() {
        ChatLib.command("moveTimer", true);
    }

    // Vanquisher
    @SelectorProperty({
        name: "Announce Vanquisher Chat",
        description: "Sends coords of any Vanquishers that you spawn to chat. (Only works if Vanquisher Auto-Warp is empty!)",
        category: "Crimson Isles",
        subcategory: "Vanquisher Alert",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    vanqAlert = 0;

    @TextProperty({
        name: "Vanquisher Auto-Warp",
        description: "Automatically invites your party to your lobby when you spawn a vanquisher. Enable by entering party as [name, name, ...]",
        category: "Crimson Isles",
        subcategory: "Vanquisher Alert"
    })
    vanqParty = "";

    @SwitchProperty({
        name: "Vanquisher Detection",
        description: "Alerts player of a vanquisher if they get near one.",
        category: "Crimson Isles",
        subcategory: "Vanquisher Alert"
    })
    vanqDetect = false;
    @ButtonProperty({
        name: "Move Vanquisher HUD",
        description: "Move the location of the Vanquisher Detection. Runs => /moveVanq",
        category: "Crimson Isles",
        subcategory: "Vanquisher Alert"
    })
    moveVanq() {
        ChatLib.command("moveVanq", true);
    }
    @SwitchProperty({
        name: "Vanquisher Detection Sound",
        description: "Plays a sound whenever a vanquisher gets detected.",
        category: "Crimson Isles",
        subcategory: "Vanquisher Alert"
    })
    vanqSound = false;

    @SelectorProperty({
        name: "Vanquisher Counter",
        description: "Counts kills until Vanquisher spawns. (Uses Book of Stats)",
        category: "Crimson Isles",
        subcategory: "Vanquisher Counter",
        options: ["OFF", "Overall View", "Session View"]
    })
    vanqCounter = 0;
    @ButtonProperty({
        name: "Move Counter HUD",
        description: "Move the location of the Vanquisher Counter. Runs => /moveCounter",
        category: "Crimson Isles",
        subcategory: "Vanquisher Counter"
    })
    moveCounter() {
        ChatLib.command("moveCounter", true);
    }
    @ButtonProperty({
        name: "Clear Session",
        description: "Resets all Vanquisher counter stats. Runs => /resetCounter",
        category: "Crimson Isles",
        subcategory: "Vanquisher Counter"
    })
    resetCounter() {
        ChatLib.command("resetCounter", true);
    }


    // DUNGEONS
    
    @SwitchProperty({
        name: "Dungeon Rejoin",
        description: "Automatically farms social xp and rejoins last completed dungeon when 4 players join your party. (does not reparty)",
        category: "Dungeon",
        subcategory: "Dungeon"
    })
    dungeonRejoin = false;


    // KUUDRA

    // Kuudra
    @TextProperty({
        name: "Kuudra Reparty",
        description: "Enter IGNs to reparty, if 3/1: [ign] | if 2/2 <[leader ign], [ign], [partner ign]>",
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    kuudraRP = "";
    
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

    // Kuudra Alert
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
        name: "Stunner IGN",
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
        name: "Cannonear IGN",
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

    // Kuudra Splits
    @SwitchProperty({
        name: "Kuudra Splits",
        description: "Displays Kuudra splits and records best splits in t5 (?<splits/best> in party chat or /va splits to show)",
        category: "Kuudra",
        subcategory: "Kuudra Splits"
    })
    kuudraSplits = false;
    @ButtonProperty({
        name: "Move Splits HUD",
        description: "Move the location of the Kuudra Splits. Runs => /moveSplits",
        category: "Kuudra",
        subcategory: "Kuudra Splits"
    })
    moveSplits() {
        ChatLib.command("moveSplits", true);
    }
    

    // GARDEN

    // Garden
    @SwitchProperty({
        name: "Composter Alert",
        description: "Displays an alert when the composter becomes inactive.",
        category: "Garden",
        subcategory: "Garden"
    })
    gardenCompost = false;

    @SwitchProperty({
        name: "Garden Warper",
        description: "Overrides any warp command with a garden warp if theres a visitor.",
        category: "Garden",
        subcategory: "Garden"
    })
    warpGarden = false;

    @SwitchProperty({
        name: "Garden Tab Display",
        description: "Displays the garden visitors outside of tab menu.",
        category: "Garden",
        subcategory: "Garden"
    })
    gardenTab = false;
    @ButtonProperty({
        name: "Move Visitors HUD",
        description: "Move the location of the garden visitors display. Runs => /moveVisitors",
        category: "Garden",
        subcategory: "Garden"
    })
    moveVisitors() {
        ChatLib.command("moveVisitors", true);
    }

    @SwitchProperty({
        name: "Next Visitor Display",
        description: "Displays the time until a visitor will visit.",
        category: "Garden",
        subcategory: "Garden"
    })
    nextVisitor = false;
    @ButtonProperty({
        name: "Move Next Visitor HUD",
        description: "Move the location of the next visitor display. Runs => /moveNext",
        category: "Garden",
        subcategory: "Garden"
    })
    moveNext() {
        ChatLib.command("moveNext", true);
    }


    // RIFT
    
    // Rift
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
    
    @SwitchProperty({
        name: "Weird Tuba Timer",
        description: "Display the time remaining on weird(er) tuba buff.",
        category: "Rift",
        subcategory: "Rift",
    })
    tubaTimer = false;
    @ButtonProperty({
        name: "Move Tuba HUD",
        description: "Move the location of the Weird Tuba Timer. Runs => /moveTubaTimer",
        category: "Rift",
        subcategory: "Rift",
    })
    moveTubaTimer() {
        ChatLib.command("moveTubaTimer", true);
    }
    @SwitchProperty({
        name: "Weird Tuba Alert",
        description: "Alerts you when Weird Tuba is off cooldown.",
        category: "Rift",
        subcategory: "Rift",
    })
    tubaAlert = false;

    // Vampire
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
        name: "Vampire Attack Display",
        description: "Tracks the Mania, Twinclaws, and Ichor directly on user screen.",
        category: "Rift",
        subcategory: "Vampire",
    })
    vampireAttack = false;
    
    @ButtonProperty({
        name: "Move Vampire HUD",
        description: "Move the location of the Vampire Attack Timer. Runs => /moveVamp",
        category: "Rift",
        subcategory: "Vampire",
    })
    moveVamp() {
        ChatLib.command("moveVamp", true);
    }
}

export default new Settings    
