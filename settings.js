import { BOLD, GOLD, ITALIC, WHITE } from "./constants";
import {
    @TextProperty,
	@PercentSliderProperty,
	@SwitchProperty,
    @ButtonProperty,
    @Vigilant,
} from '../Vigilance/index';

@Vigilant("VolcAddons", "VolcAddons", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Hub", "Crimson Isles", "Kuudra", "Garden"];
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
`
        )
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
        description: "Estimates Diana burrows from particles and pitch of Ancestral Spade (particles => ON, /togglemusic => OFF) [Budget Version]",
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

    @SwitchProperty({
        name: "Announce Inquisitor",
        description: "Sends coords of any inquisitors that you spawn to party chat.",
        category: "Hub",
        subcategory: "Inquisitor"
    })
    dianaAlert = false;

    @SwitchProperty({
        name: "Announce Inquisitor (All Chat Toggle)",
        description: "Sends coords in all chat instead of party chat.",
        category: "Hub",
        subcategory: "Inquisitor"
    })
    dianaAlertAll = false;
    
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

    @SwitchProperty({
        name: "Vanquisher Alert",
        description: "Sends coords of Vanquisher in patcher format. (Only works if Vanquisher Auto-Warp is empty!)",
        category: "Crimson Isles",
        subcategory: "Vanquisher Alert"
    })
    vanqAlert = false;

    @SwitchProperty({
        name: "Vanquisher Alert (All Chat Toggle)",
        description: "Sends coords in all chat instead of party chat.",
        category: "Crimson Isles",
        subcategory: "Vanquisher Alert"
    })
    vanqAlertAll = false;

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
        name: "Show Supply/Fuel Waypoints",
        description: "Creates waypoints for the supplies/fuels near you (kinda shit).",
        category: "Kuudra",
        subcategory: "Kuudra"
    })
    kuudraCrates = false;

    @SwitchProperty({
        name: "Kuudra Alerts",
        description: "Alerts the player of events in Kuudra instance.",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    kuudraAlerts = false;

    @TextProperty({
        name: "Kuudra Alerts (Cannonear IGN)",
        description: "Tracks who is shooting the ballista for <Kuudra Alerts> to work. (leave empty if you want to track anyone who mounts cannon)",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    kuudraCannonear = "";

    @TextProperty({
        name: "Kuudra Alerts (Stunner IGN)",
        description: "Tracks who is stunning Kuudra for <Kuudra Alerts> to work. (leave empty if you want to track anyone who gets eaten)",
        category: "Kuudra",
        subcategory: "Kuudra Alert"
    })
    kuudraStunner = "";

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
}

export default new Settings    
