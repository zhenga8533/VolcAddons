import { DARK_AQUA, GRAY, HEADER, RED } from "./constants";
import {
    @Vigilant,
    @TextProperty,
    @CheckboxProperty,
    @SliderProperty
} from "../../Vigilance/index";

@Vigilant("VolcAddons/data", "VolcAddons' Toggles", {
    // Function to compare categories for sorting settings
    getCategoryComparator: () => (a, b) => {
        const categories = ["Server Status", "Leader Commands", "Party Commands", "Kuudra Alerts", "Webhook Chats"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {
    constructor() {
        this.initialize(this);
        
        this.setCategoryDescription("Server Status", `${HEADER}\n\nServer Status Control Panel...`);
        this.setCategoryDescription("Leader Commands", `${HEADER}\n\nLeader Commands Control Panel...`);
        this.setCategoryDescription("Party Commands", `${HEADER}\n\nParty Commands Control Panel...`);
        this.setCategoryDescription("Kuudra Alerts", `${HEADER}\n\nKuudra Alerts Control Panel...`);
        this.setCategoryDescription("Webhook Chats", `${HEADER}\n\nWebhook Chats Control Panel...`);
    }

    // --- STATUS COMMANDS ---
    @CheckboxProperty({
        name: `Ping Display`,
        category: "Server Status",
        subcategory: "Server Status"
    })
    pingDisplay = true;
    @CheckboxProperty({
        name: `FPS Display`,
        category: "Server Status",
        subcategory: "Server Status"
    })
    fpsDisplay = true;
    @CheckboxProperty({
        name: `TPS Display`,
        category: "Server Status",
        subcategory: "Server Status"
    })
    tpsDisplay = true;
    @CheckboxProperty({
        name: `CPS Display`,
        category: "Server Status",
        subcategory: "Server Status"
    })
    cpsDisplay = true;

    // --- LEADER COMMANDS ---
    @CheckboxProperty({
        name: `Allinvite Command ${DARK_AQUA}?<allinvite, allinv>`,
        category: "Leader Commands",
        subcategory: "Leader Commands"
    })
    allinvCommand = true;
    @CheckboxProperty({
        name: `Demote Command ${DARK_AQUA}?demote`,
        category: "Leader Commands",
        subcategory: "Leader Commands"
    })
    demoteCommand = true;
    @CheckboxProperty({
        name: `Instance Command ${DARK_AQUA}?<f, m, t>[1-7]`,
        category: "Leader Commands",
        subcategory: "Leader Commands"
    })
    instanceCommand = true;
    @CheckboxProperty({
        name: `Promote Command ${DARK_AQUA}?promote`,
        category: "Leader Commands",
        subcategory: "Leader Commands"
    })
    promoteCommand = true;
    @CheckboxProperty({
        name: `Stream Command ${DARK_AQUA}?<streamopen, stream> [num]`,
        category: "Leader Commands",
        subcategory: "Leader Commands"
    })
    streamCommand = true;
    @CheckboxProperty({
        name: `Transfer Command ${DARK_AQUA}?transfer`,
        category: "Leader Commands",
        subcategory: "Leader Commands"
    })
    transferCommand = true;
    @CheckboxProperty({
        name: `Warp Command ${DARK_AQUA}?warp`,
        category: "Leader Commands",
        subcategory: "Leader Commands"
    })
    warpCommand = true;

    // --- PARTY COMMANDS ---
    @CheckboxProperty({
        name: `8ball Command ${DARK_AQUA}?8ball`,
        category: "Party Commands",
        subcategory: "Party Commands"
    })
    ballCommand = true;
    @CheckboxProperty({
        name: `Coinflip Command ${DARK_AQUA}?<coin, flip, coinflip, cf>`,
        category: "Party Commands",
        subcategory: "Party Commands"
    })
    coinCommand = true;
    @CheckboxProperty({
        name: `Coords Command ${DARK_AQUA}?coords`,
        category: "Party Commands",
        subcategory: "Party Commands"
    })
    coordsCommand = true;
    @CheckboxProperty({
        name: `Dice Command ${DARK_AQUA}?<dice, roll>`,
        category: "Party Commands",
        subcategory: "Party Commands"
    })
    diceCommand = true;
    @CheckboxProperty({
        name: `Help Command ${DARK_AQUA}?help`,
        category: "Party Commands",
        subcategory: "Party Commands"
    })
    helpCommand = true;
    @CheckboxProperty({
        name: `Invite Command ${DARK_AQUA}?invite`,
        category: "Party Commands",
        subcategory: "Party Commands"
    })
    inviteCommand = true;
    @CheckboxProperty({
        name: `Limbo Command ${DARK_AQUA}?<limbo, lobby, l>`,
        category: "Party Commands",
        subcategory: "Party Commands"
    })
    limboCommand = false;
    @CheckboxProperty({
        name: `Leave Command ${DARK_AQUA}?leave`,
        category: "Party Commands",
        subcategory: "Party Commands"
    })
    leaveCommand = false;
    @CheckboxProperty({
        name: `RPS Command ${DARK_AQUA}?rps`,
        category: "Party Commands",
        subcategory: "Party Commands"
    })
    rpsCommand = true;
    @CheckboxProperty({
        name: `Slander Commands ${DARK_AQUA}(i plead the fifth.)`,
        category: "Party Commands",
        subcategory: "Party Commands"
    })
    slanderCommand = true;
    @CheckboxProperty({
        name: `Status Commands ${DARK_AQUA}?<fps, ping, tps>`,
        category: "Party Commands",
        subcategory: "Party Commands"
    })
    statusCommand = true;
    @CheckboxProperty({
        name: `Women Command ${DARK_AQUA}?<w, waifu, women>`,
        category: "Party Commands",
        subcategory: "Party Commands"
    })
    womenCommand = true;

    // --- KUUDRA ALERTS ---
    
    @CheckboxProperty({
        name: "No Key Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts"
    })
    keyAlert = true;
    @CheckboxProperty({
        name: "Unready Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts"
    })
    unreadyAlert = true;
    @CheckboxProperty({
        name: "Choose Route Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts"
    })
    routeAlert = true;
    @CheckboxProperty({
        name: "Pickup Supply Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts"
    })
    supplyAlert = true;
    @CheckboxProperty({
        name: "Building Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts"
    })
    buildingAlert = true;
    @CheckboxProperty({
        name: "Fresh Tools Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts"
    })
    freshAlert = true;
    @CheckboxProperty({
        name: "Fuel Percent Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts"
    })
    fuelAlert = true;
    @CheckboxProperty({
        name: "Fresh Tools Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts"
    })
    freshAlert = true;
    @TextProperty({
        name: "Stunner Eaten Alert",
        description: "Tracks who is stunning Kuudra. Enter 'all' to track everyone or empty to turn off.",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts"
    })
    kuudraStunner = "all";
    @TextProperty({
        name: "Mount Cannon Alert",
        description: "Tracks who is shooting the ballista. Enter 'all' to track everyone or empty to turn off.",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts"
    })
    kuudraCannonear = "all";
    @CheckboxProperty({
        name: "Stun Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts"
    })
    stunAlert = true;
    @CheckboxProperty({
        name: "Dropship Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts"
    })
    dropshipAlert = true;
    @SliderProperty({
        name: "Token Alert",
        description: `Set token threshold before alert appears or as 0 to turn ${RED}OFF${GRAY} (only alerts once per run).`,
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        min: 0,
        max: 1000
    })
    tokenAlert = 0;

    // --- WEBHOOK CHATS ---
    @CheckboxProperty({
        name: "Public Chat",
        category: "Webhook Chats",
        subcategory: "Webhook Chats"
    })
    publicChat = false;
    @CheckboxProperty({
        name: "Party Chat",
        category: "Webhook Chats",
        subcategory: "Webhook Chats"
    })
    partyChat = false;
    @CheckboxProperty({
        name: "Guild Chat",
        category: "Webhook Chats",
        subcategory: "Webhook Chats"
    })
    guildChat = false;
    @CheckboxProperty({
        name: "Private Chat",
        category: "Webhook Chats",
        subcategory: "Webhook Chats"
    })
    privateChat = false;
}

export default new Settings;
