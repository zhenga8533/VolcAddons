import { BOLD, GOLD, ITALIC, WHITE } from "./utils/constants";
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
        const categories = ["General", "Hub", "Crimson Isles", "Kuudra", "Garden", "Rift"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {
    constructor() {
        this.initialize(this)
        this.setCategoryDescription("General", 
`
${BOLD}${GOLD}VolcAddons ${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}

${WHITE}Made By Volcaronitee
${ITALIC}PSA does support nons.
`)
        this.setCategoryDescription("Rift", "NONE OF THIS IS TESTED YET!"); 

        this.addDependency("Move Timer HUD", "Golden Fish Timer");
        this.addDependency("Move Counter HUD", "Vanquisher Counter");
        this.addDependency("Clear Session", "Vanquisher Counter");
        this.addDependency("Move Gyro Timer HUD", "Cells Alignment Timer");
        this.addDependency("Move Splits HUD", "Kuudra Splits");
        this.addDependency("Move Visitors HUD", "Garden Tab Display");
        
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
    }
    
    // GENERAL
    @SwitchProperty({
        name: "Draw Waypoint",
        description: "Creates waypoints out of /patcher sendcoords and the other features here.",
        category: "General",
        subcategory: "General"
    })
    drawWaypoint = false;

    @SwitchProperty({
        name: "Remove Selfie Mode",
        description: "Removes the selfie mode from f5.",
        category: "General",
        subcategory: "General"
    })
    removeSelfie = false;

    @SwitchProperty({
        name: "Abiphone Blocker",
        description: "Blocks abiphone callers in /va blocklist.",
        category: "General",
        subcategory: "General"
    })
    abiphoneBlocker = false;

    @PercentSliderProperty({
        name: "Low Health Alert",
        description: "Alerts the player if their health drops lower than the percent input (set 0% to toggle off).",
        category: "General",
        subcategory: "General"
    })
    healthAlert = 0.0;

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

    @SwitchProperty({
        name: "Leader Chat Command",
        description: "Allows everyone to use leader commands.",
        category: "General",
        subcategory: "Party"
    })
    leaderCommands = false;

    @SwitchProperty({
        name: "Party Chat Command",
        description: "Allows everyone to use the party commands.",
        category: "General",
        subcategory: "Party"
    })
    partyCommands = false;

    @SwitchProperty({
        name: "Enable Whitelist Rejoin",
        description: "Automatically rejoin invites from players on the whitelist (/itee whitelist <add/remove> <ign>).",
        category: "General",
        subcategory: "Party"
    })
    joinWhitelist = false;

    @SwitchProperty({
        name: "Auto Join Reparty",
        description: "Automatically rejoin reparty invites within 60 seconds.",
        category: "General",
        subcategory: "Party"
    })
    joinRP = false;

    // HUB
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
        description: "Sends coords of any inquisitors that you spawn to party chat.",
        category: "Hub",
        subcategory: "Inquisitor",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    dianaAlert = 0;
    
    // CRIMSON ISLES
    @SwitchProperty({
        name: "Broken Hyperion",
        description: "Uses <Book of Stats> and <Champion> to track when Wither Impact breaks.",
        category: "Crimson Isles",
        subcategory: "Crimson Isles"
    })
    brokenHyp = false;

    @SwitchProperty({
        name: "Ragnarok Detection",
        description: "Detects when Ragnarok Ability finishes casting (sounds must be on).",
        category: "Crimson Isles",
        subcategory: "Crimson Isles"
    })
    ragDetect = false;

    @SwitchProperty({
        name: "Golden Fish Timer",
        description: "Sets the 3 minute timer between each rod cast for a golden fish spawn.",
        category: "Crimson Isles",
        subcategory: "Crimson Isles"
    })
    goldenFishAlert = false;

    @ButtonProperty({
        name: "Move Timer HUD",
        description: "Move the location of the Golden Fish Timer.",
        category: "Crimson Isles",
        subcategory: "Crimson Isles"
    })
    moveTimer() {
        ChatLib.command("moveTimer", true);
    }

    @SelectorProperty({
        name: "Announce Vanquisher Chat",
        description: "Sends coords of Vanquisher in patcher format. (Only works if Vanquisher Auto-Warp is empty!)",
        category: "Crimson Isles",
        subcategory: "Vanquisher Alert",
        options: ["OFF", "All Chat", "Party Chat"]
    })
    vanqAlert = 0;

    @TextProperty({
        name: "Vanquisher Auto-Warp",
        description: "Automatically invites your party to your lobby when you spawn a vanquisher. Enable by entering party as <name, name, ...>",
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

    @SwitchProperty({
        name: "Vanquisher Detection Sound",
        description: "Plays a sound whenever a vanquisher gets detected.",
        category: "Crimson Isles",
        subcategory: "Vanquisher Alert"
    })
    vanqSound = false;

    @SwitchProperty({
        name: "Vanquisher Counter",
        description: "Counts kills until Vanquisher spawns. (Bascially only tracks Book of Stats, coding hard)",
        category: "Crimson Isles",
        subcategory: "Vanquisher Counter"
    })
    vanqCounter = false;

    @ButtonProperty({
        name: "Move Counter HUD",
        description: "Move the location of the Vanquisher Counter.",
        category: "Crimson Isles",
        subcategory: "Vanquisher Counter"
    })
    moveCounter() {
        ChatLib.command("moveCounter", true);
    }

    @ButtonProperty({
        name: "Clear Session",
        description: "Resets all Vanquisher counter stats.",
        category: "Crimson Isles",
        subcategory: "Vanquisher Counter"
    })
    clearCounter() {
        ChatLib.command("clearCounter", true);
    }

    // KUUDRA
    @TextProperty({
        name: "Kuudra Reparty",
        description: "Enter IGNs to reparty, if 3/1: <ign> | if 2/2 <leader ign, ign, partner ign> (may break first run シ)",
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
        description: "Tells you where Kuudra is going to spawn in p4 (use at own risk). Requires animation skip, so don't fail @BananaTheBot.",
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    kuudraSpawn = false;
    
    @SwitchProperty({
        name: "Show Supply/Fuel Waypoints",
        description: "Creates waypoints for the supplies/fuels near you (actually works now).",
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

    @SwitchProperty({
        name: "Cells Alignment Timer",
        description: "Displays the time left before Cells Alignment ends.",
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    gyroTimer = false;

    @ButtonProperty({
        name: "Move Gyro Timer HUD",
        description: "Move the location of the Cells Alignement Timer.",
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    moveGyroTimer() {
        ChatLib.command("moveAlignTimer", true);
    }

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
        description: "Tracks who is stunning Kuudra for <Kuudra Alerts> to work. (leave empty if you want to track anyone who gets eaten)",
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
        description: "Tracks who is shooting the ballista for <Kuudra Alerts> to work. (leave empty if you want to track anyone who mounts cannon)",
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

    @SwitchProperty({
        name: "Kuudra Splits",
        description: "Displays Kuudra splits and records best splits in t5 (<?splits/best> in party chat or </va splits> to show)",
        category: "Kuudra",
        subcategory: "Kuudra Splits"
    })
    kuudraSplits = false;

    @ButtonProperty({
        name: "Move Splits HUD",
        description: "Move the location of the Kuudra Splits.",
        category: "Kuudra",
        subcategory: "Kuudra Splits"
    })
    moveSplits() {
        ChatLib.command("moveSplits", true);
    }
    
    // GARDEN
    @SwitchProperty({
        name: "Composter Alert",
        description: "Displays an alert when the composter becomes inactive.",
        category: "Garden",
        subcategory: "Garden"
    })
    gardenCompost = false;

    @SwitchProperty({
        name: "Garden Tab Display",
        description: "Displays the garden visitors outside of tab menu.",
        category: "Garden",
        subcategory: "Garden"
    })
    gardenTab = false;

    @ButtonProperty({
        name: "Move Visitors HUD",
        description: "Move the location of the garden visitors.",
        category: "Garden",
        subcategory: "Garden"
    })
    moveVisitors() {
        ChatLib.command("moveVisitors", true);
    }

    // RIFT
    @SliderProperty({
        name: "Enigma Soul Waypoints",
        description: "Display the distance at which soul waypoints will render. (Set as 0 to turn off)",
        category: "Rift",
        subcategory: "Rift",
        min: 0,
        max: 1000
    })
    enigmaWaypoint = 0;
}

export default new Settings    
