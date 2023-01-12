// Import outer scope
import settings from "./settings"
import {data} from "./variables"
import {COLORS} from "./constants"
import {FORMATS} from "./constants"

// General
import "./features/PartyCommands"
import "./features/RemoveSelfie"
import "./features/JoinWhitelist"

// Nether
import "./features/VanqAlert"
import "./features/BrokenHyp"
import "./features/KuudraAlerts"
import "./features/VanqWarp"
import "./features/KuudraReparty"

// GENERAL FUNCTION COMMANDS
register ("command", (...args) => {
    if (args[0] == undefined) {
        settings.openGUI();
    } else if (args[0].equals("help")) {
        getHelp();
    } else if (args[0].equals("settings")) {
        settings.openGUI();
    } else if (args[0].equals("whitelist")) { // ADD/REMOVE USERS FROM WHITELIST
        if (args[2] != undefined) {
            const username = args[2].toLowerCase();

            if (args[1].equals("add")) {
                if (!data.whitelist.includes(username)) {
                    data.whitelist.push(username)
                    data.save()
                    ChatLib.chat(`${COLORS["GREEN"]}Successfully added [${username}] to the whitelist!`);
                } else {
                    ChatLib.chat(`${COLORS["RED"]}Player [${username}] is already in the whitelist!`);
                }
            } else if (args[1].equals("remove")) {
                const index = data.whitelist.indexOf(username);

                if (index > -1) {
                    data.whitelist.splice(index, 1)
                    data.save()
                    ChatLib.chat(`${COLORS["GREEN"]}Successfully removed [${username}] from the whitelist!`)
                } else {
                    ChatLib.chat(`${COLORS["RED"]}Player [${username}] is not in the whitelist!`);
                }
            } else {
                ChatLib.chat(`${COLORS["AQUA"]}Please enter as /itee whitelist <add/remove> <ign>!`)
            }
        } else {
            ChatLib.chat(`${COLORS["AQUA"]}Please enter as /itee whitelist <add/remove> <ign>!`)
        }
    } else {
        settings.openGUI();
    }
}).setName("moditee").setAliases("itee")

function getHelp() {
    ChatLib.chat("");
    ChatLib.chat(`${COLORS["GOLD"]}${FORMATS["BOLD"]}${FORMATS["UNDERLINE"]}Moditee v${JSON.parse(FileLib.read("Moditee", "metadata.json")).version}${FORMATS["RESET"]}\n`);
    ChatLib.chat(`${COLORS["GRAY"]}${FORMATS["BOLD"]}GENERAL FEATURES:${FORMATS["RESET"]}`);
    ChatLib.chat(`${COLORS["WHITE"]}description1${FORMATS["RESET"]}`);
    ChatLib.chat(`${COLORS["GRAY"]}${FORMATS["BOLD"]}CRIMSON ISLE FEATURES:${FORMATS["RESET"]}`);
    ChatLib.chat(`${COLORS["WHITE"]}description2${FORMATS["RESET"]}`);
    ChatLib.chat("");
}