import { BLUE, DARK_AQUA, GRAY, HEADER, RED } from "./constants";
import {
    @Vigilant,
    @TextProperty,
    @CheckboxProperty,
    @SliderProperty,
    @SelectorProperty
} from "../../Vigilance/index";

@Vigilant("VolcAddons/data", "VolcAddons' Toggles", {
    // Function to compare categories for sorting settings
    getCategoryComparator: () => (a, b) => {
        const categories = ["Server Status", "Skyblock Stats", "Leader Commands", "Party Commands", "Kuudra Alerts", "Webhook Chats"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {
    constructor() {
        this.initialize(this);
        
        this.setCategoryDescription("Skyblock Stats", `${HEADER}\n\nSkyblock Stats Control Panel...`);
        this.setCategoryDescription("Server Status", `${HEADER}\n\nServer Status Control Panel...`);
        this.setCategoryDescription("Leader Commands", `${HEADER}\n\nLeader Commands Control Panel...`);
        this.setCategoryDescription("Party Commands", `${HEADER}\n\nParty Commands Control Panel...`);
        this.setCategoryDescription("Kuudra Alerts", `${HEADER}\n\nKuudra Alerts Control Panel...`);
        this.setCategoryDescription("Webhook Chats", `${HEADER}\n\nWebhook Chats Control Panel...`);
    }

    // --- SERVER STATUS ---
    @CheckboxProperty({
        name: "Ping Display",
        category: "Server Status",
        subcategory: "Server Status",
        description: "According to all known laws of aviation, there is no way a bee should be able to fly."
    })
    pingDisplay = true;
    @CheckboxProperty({
        name: "FPS Display",
        category: "Server Status",
        subcategory: "Server Status",
        description: "Its wings are too small to get its fat little body off the ground."
    })
    fpsDisplay = true;
    @CheckboxProperty({
        name: "TPS Display",
        category: "Server Status",
        subcategory: "Server Status",
        description: "The bee, of course, flies anyway because bees don't care what humans think is impossible."
    })
    tpsDisplay = true;
    @CheckboxProperty({
        name: "CPS Display",
        category: "Server Status",
        subcategory: "Server Status",
        description: "Yellow, black. Yellow, black. Yellow, black. Yellow, black."
    })
    cpsDisplay = true;
    @CheckboxProperty({
        name: "XYZ Display",
        category: "Server Status",
        subcategory: "Server Status",
        description: "Ooh, black and yellow! Let's shake it up a little."
    })
    xyzDisplay = true;
    @CheckboxProperty({
        name: "Angle Display",
        category: "Server Status",
        subcategory: "Server Status",
        description: "JANET BENSON: Barry! Breakfast is ready!"
    })
    angleDisplay = true;
    @CheckboxProperty({
        name: "Direction Display",
        category: "Server Status",
        subcategory: "Server Status",
        description: "BARRY: Coming!"
    })
    dirDisplay = true;
    @CheckboxProperty({
        name: "Day Display",
        category: "Server Status",
        subcategory: "Server Status",
        description: "Hang on a second."
    })
    dayDisplay = true;

    // --- SKYBLOCK STATS ---
    @CheckboxProperty({
        name: "Equipped Pet Name",
        category: "Skyblock Stats",
        subcategory: "Skyblock Stats",
        description: "Nice guys finish last that's why I'll treat you like trash"
    })
    petDisplay = true;

    @CheckboxProperty({
        name: "Legion Display",
        category: "Skyblock Stats",
        subcategory: "Skyblock Stats",
        description: "It's not what I really want to do"
    })
    legionDisplay = true;

    @CheckboxProperty({
        name: `Player Stats ${BLUE}(From Tab)`,
        category: "Skyblock Stats",
        subcategory: "Skyblock Stats",
        description: "But you only date bad guys, so I'll give it my best try to treat you the way you want me to"
    })
    statsDisplay = true;
    
    @CheckboxProperty({
        name: `Playtime Tracker`,
        category: "Skyblock Stats",
        subcategory: "Skyblock Stats",
        description: "I'll never open a door or pull out a chair, you can tell me how your day was but I don't really care"
    })
    trackPlaytime = true;

    @CheckboxProperty({
        name: `Soulflow Display ${BLUE}(Uses Inventory)`,
        category: "Skyblock Stats",
        subcategory: "Skyblock Stats",
        description: "And if you ever get cold, you'll just have to hack it 'cause I'll be cold too if I gave you my jacket"
    })
    soulflowDisplay = true;

    // --- LEADER COMMANDS ---
    @CheckboxProperty({
        name: `Allinvite Command ${DARK_AQUA}?<allinvite, allinv>`,
        category: "Leader Commands",
        subcategory: "Leader Commands",
        description: "Once upon a time there was a lovely princess."
    })
    allinvCommand = true;
    @CheckboxProperty({
        name: `Demote Command ${DARK_AQUA}?demote`,
        category: "Leader Commands",
        subcategory: "Leader Commands",
        description: "But she had an enchantment upon her of a fearful sort which could only be broken by love's first kiss."
    })
    demoteCommand = true;
    @CheckboxProperty({
        name: `Instance Command ${DARK_AQUA}?<f, m, t>[1-7]`,
        category: "Leader Commands",
        subcategory: "Leader Commands",
        description: "She was locked away in a castle guarded by a terrible fire-breathing dragon."
    })
    instanceCommand = true;
    @CheckboxProperty({
        name: `Invite Command ${DARK_AQUA}?invite`,
        category: "Leader Commands",
        subcategory: "Leader Commands",
        description: "Many brave knigts had attempted to free her from this dreadful prison, but none prevailed."
    })
    inviteCommand = true;
    @CheckboxProperty({
        name: `Promote Command ${DARK_AQUA}?promote`,
        category: "Leader Commands",
        subcategory: "Leader Commands",
        description: "She waited in the dragon's keep in the highest room of the tallest tower for her true love and true love's first kiss."
    })
    promoteCommand = true;
    @CheckboxProperty({
        name: `Stream Command ${DARK_AQUA}?<streamopen, stream> [num]`,
        category: "Leader Commands",
        subcategory: "Leader Commands",
        description: "Like that's ever gonna happen."
    })
    streamCommand = true;
    @CheckboxProperty({
        name: `Transfer Command ${DARK_AQUA}?transfer`,
        category: "Leader Commands",
        subcategory: "Leader Commands",
        description: "{Paper Rusting, Toilet Flushes}"
    })
    transferCommand = true;
    @CheckboxProperty({
        name: `Warp Command ${DARK_AQUA}?warp`,
        category: "Leader Commands",
        subcategory: "Leader Commands",
        description: "What a load of - "
    })
    warpCommand = true;

    // --- PARTY COMMANDS ---
    @CheckboxProperty({
        name: "Party Chat",
        category: "Party Commands",
        subcategory: "Chat Options",
        description: "Somebody once told me the world is gonna roll me"
    })
    partyCommands = true;
    @CheckboxProperty({
        name: "Guild Chat",
        category: "Party Commands",
        subcategory: "Chat Options",
        description: "I ain't the sharpest tool in the shed"
    })
    guildCommands = true;
    @CheckboxProperty({
        name: "DM Chat",
        category: "Party Commands",
        subcategory: "Chat Options",
        description: "She was lookin' kind of dumb with her finger and her thumb"
    })
    dmCommands = true;

    @CheckboxProperty({
        name: `8ball Command ${DARK_AQUA}?8ball`,
        category: "Party Commands",
        subcategory: "Party Commands",
        description: "In the shape of an \"L\" on her forehead"
    })
    ballCommand = true;
    @CheckboxProperty({
        name: `Coinflip Command ${DARK_AQUA}?<coin, flip, coinflip, cf>`,
        category: "Party Commands",
        subcategory: "Party Commands",
        description: "The years start comin' and they don't stop comin'"
    })
    coinCommand = true;
    @CheckboxProperty({
        name: `Coords Command ${DARK_AQUA}?<coords, xyz>`,
        category: "Party Commands",
        subcategory: "Party Commands",
        description: "Fed to the rules and hit the ground runnin'"
    })
    coordsCommand = true;
    @CheckboxProperty({
        name: `Dice Command ${DARK_AQUA}?<dice, roll>`,
        category: "Party Commands",
        subcategory: "Party Commands",
        description: "Didn't make sense not to live for fun"
    })
    diceCommand = true;
    @CheckboxProperty({
        name: `Help Command ${DARK_AQUA}?help`,
        category: "Party Commands",
        subcategory: "Party Commands",
        description: "Your brain gets smart but your head gets dumb"
    })
    helpCommand = true;
    @CheckboxProperty({
        name: `Limbo Command ${DARK_AQUA}?<limbo, lobby, l>`,
        category: "Party Commands",
        subcategory: "Party Commands",
        description: "So much to do so much to see"
    })
    limboCommand = false;
    @CheckboxProperty({
        name: `Leave Command ${DARK_AQUA}?leave`,
        category: "Party Commands",
        subcategory: "Party Commands",
        description: "So what's wrong with takin' the backstreets"
    })
    leaveCommand = false;
    @CheckboxProperty({
        name: `RPS Command ${DARK_AQUA}?rps`,
        category: "Party Commands",
        subcategory: "Party Commands",
        description: "You'll never know if you don't go"
    })
    rpsCommand = true;
    @CheckboxProperty({
        name: `Slander Commands ${DARK_AQUA}(i plead the fifth.)`,
        category: "Party Commands",
        subcategory: "Party Commands",
        description: "You'll never shine if you don't glow"
    })
    slanderCommand = true;
    @CheckboxProperty({
        name: `Status Commands ${DARK_AQUA}?<fps, ping, tps>`,
        category: "Party Commands",
        subcategory: "Party Commands",
        description: "Hey, now You're an all-star"
    })
    statusCommand = true;
    @SelectorProperty({
        name: `Gyatt Command ${DARK_AQUA}?<w, waifu, women>`,
        category: "Party Commands",
        subcategory: "Party Commands",
        description: "The most important command deserves the only description. This will only control '?w', you can access any of the other commands by using '?<toggle>'. Note that it will only send on next command for speed purposes :)",
        options: ["OFF", "random", "waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug", "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet", "blush", 
            "smile", "wave", "highfive", "handhold", "nom", "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance", "cringe"]
    })
    womenCommand = 0;

    // --- KUUDRA ALERTS ---
    
    @CheckboxProperty({
        name: "No Key Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "Let's get down to business\nTo defeat the Huns"
    })
    keyAlert = true;
    @CheckboxProperty({
        name: "Unready Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "Did they send me daughters\nWhen I asked for sons?"
    })
    unreadyAlert = true;
    @CheckboxProperty({
        name: "Choose Route Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "You're the saddest bunch I ever met\nBut you can bet before we're through\nMister, I'll make a man out of you"
    })
    routeAlert = true;
    @CheckboxProperty({
        name: "Pickup Supply Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "Tranquil as a forest\nBut on fire within"
    })
    supplyAlert = true;
    @CheckboxProperty({
        name: "Building Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "Once you find your center\nYou are sure to win"
    })
    buildingAlert = true;
    @CheckboxProperty({
        name: "Fresh Tools Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "You're a spineless pale pathetic lot\nAnd you haven't got a clue"
    })
    freshAlert = true;
    @CheckboxProperty({
        name: "Fuel Percent Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "Somehow I'll make a man out of you"
    })
    fuelAlert = true;
    @CheckboxProperty({
        name: "Fresh Tools Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "I'm never gonna catch my breath\nSay goodbye to those who knew me"
    })
    freshAlert = true;
    @TextProperty({
        name: "Stunner Eaten Alert",
        description: "Tracks who is stunning Kuudra. Enter 'all' to track everyone or empty to turn off.",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "Why was I a fool in school for cutting gym?\nThis guy's got them scared to death!"
    })
    kuudraStunner = "all";
    @TextProperty({
        name: "Mount Cannon Alert",
        description: "Tracks who is shooting the ballista. Enter 'all' to track everyone or empty to turn off.",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "Hope he doesn't see right through me\nNow I really wish that I knew how to swim"
    })
    kuudraCannonear = "all";
    @CheckboxProperty({
        name: "Stun Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "We must be swift as the coursing river (Be a man)"
    })
    stunAlert = true;
    @CheckboxProperty({
        name: "Dropship Alert",
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "With all the force of a great typhoon (Be a man)"
    })
    dropshipAlert = true;
    @SliderProperty({
        name: "Token Alert",
        description: `Set token threshold before alert appears or as 0 to turn ${RED}OFF${GRAY} (only alerts once per run).`,
        category: "Kuudra Alerts",
        subcategory: "Kuudra Alerts",
        description: "With all the strength of a raging fire\nMysterious as the dark side of the moon",
        min: 0,
        max: 1000
    })
    tokenAlert = 0;

    // --- WEBHOOK CHATS ---
    @CheckboxProperty({
        name: "Public Chat",
        category: "Webhook Chats",
        subcategory: "Webhook Chats",
        description: 
`The snow glows white on the mountain tonight
Not a footprint to be seen
A kingdom of isolation
And it looks like I'm the queen`
    })
    publicChat = false;
    @CheckboxProperty({
        name: "Party Chat",
        category: "Webhook Chats",
        subcategory: "Webhook Chats",
        description: 
`The wind is howling like this swirling storm inside
Couldn't keep it in, heaven knows I tried
Don't let them in, don't let them see
Be the good girl you always have to be
Conceal, don't feel, don't let them know
Well, now they know`
    })
    partyChat = false;
    @CheckboxProperty({
        name: "Guild Chat",
        category: "Webhook Chats",
        subcategory: "Webhook Chats",
        description: 
`Let it go, let it go
Can't hold it back anymore
Let it go, let it go
Turn away and slam the door
I don't care what they're going to say
Let the storm rage on
The cold never bothered me anyway`
    })
    guildChat = false;
    @CheckboxProperty({
        name: "Private Chat",
        category: "Webhook Chats",
        subcategory: "Webhook Chats",
        description:
`It's funny how some distance makes everything seem small
And the fears that once controlled me can't get to me at all
It's time to see what I can do
To test the limits and break through
No right, no wrong, no rules for me
I'm free`
    })
    privateChat = false;
}

export default new Settings;
