import {
    @TextProperty,
	@SliderProperty,
	@SwitchProperty,
    @Vigilant,
} from '../Vigilance/index';
import {COLORS} from "./constants"
import {FORMATS} from "./constants"

@Vigilant("Moditee", "Moditee", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Crimson Isles"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {
    constructor() {
        this.initialize(this)
        this.setCategoryDescription("General", 
            `
            ${FORMATS.BOLD}${COLORS.DARK_AQUA}Moditee ${JSON.parse(FileLib.read("Moditee", "metadata.json")).version}

            ${COLORS.WHITE}Made By Volcaronitee
            `
        )
    }

    // GENERAL
    @SwitchProperty({
        name: "Party Chat Command",
        description: "Allows everyone to use leader commands + some fun ones :).",
        category: "General"
    })
    partyCommands = false

    @SwitchProperty({
        name: "Remove Selfie Mode",
        description: "Removes the selfie mode from f5.",
        category: "General"
    })
    removeSelfie = false

    @SwitchProperty({
        name: "Enable Whitelist Rejoin",
        description: "Automatically rejoin invites from players on the whitelist (/itee whitelist <add/remove> <ign>).",
        category: "General"
    })
    joinWhitelist = false
    
    // CRIMSON ISLES
    @SwitchProperty({
        name: "Broken Hyperion",
        description: "Tracks kill and xp to signal when Hyperion ability breaks.",
        category: "Crimson Isles",
        subcategory: "Combat"
    })
    brokenHyp = false

    @SwitchProperty({
        name: "Vanquisher Alert",
        description: "Sends coords of Vanquisher in patcher format. (Only works if Vanquisher Auto-Warp is empty!)",
        category: "Crimson Isles",
        subcategory: "Combat"
    })
    vanqAlert = false

    @SwitchProperty({
        name: "Vanquisher Alert (All Chat Toggle)",
        description: "Posts coords in all chat instead of party chat.",
        category: "Crimson Isles",
        subcategory: "Combat"
    })
    vanqAlertAll = false

    @TextProperty({
        name: "Vanquisher Auto-Warp",
        description: "Automatically invites your party to your lobby when spawn a vanquisher. Enable by entering party as <name, name, ...>",
        category: "Crimson Isles",
        subcategory: "Combat"
    })
    vanqParty = ""

    // sub: kuudra
    @TextProperty({
        name: "Kuudra Reparty",
        description: "Enter IGN of person to 3/1 dt skip. (leave blank if not trading!)",
        category: "Crimson Isles",
        subcategory: "Kuudra"
    })
    kuudraRP = ""

    @SwitchProperty({
        name: "Kuudra Alerts",
        description: "Alerts the player of sus Kuudra actions and important events.",
        category: "Crimson Isles",
        subcategory: "Kuudra"
    })
    kuudraAlerts = false

    @TextProperty({
        name: "Kuudra Alerts (Cannonear IGN)",
        description: "Tracks who is shooting the ballista for <Kuudra Alerts> to work. (leave empty if you want to track anyone who mounts cannon)",
        category: "Crimson Isles",
        subcategory: "Kuudra"
    })
    kuudraCannonear = ""

    @TextProperty({
        name: "Kuudra Alerts (Stunner IGN)",
        description: "Tracks who is stunning Kuudra for <Kuudra Alerts> to work. (leave empty if you want to track anyone who gets eaten)",
        category: "Crimson Isles",
        subcategory: "Kuudra"
    })
    kuudraStunner = ""
}

export default new Settings    
