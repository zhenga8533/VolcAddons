import request from "../../../requestV2";
import { LOGO, RED } from "../../utils/constants";


register("command", (name) => {
    if (name === undefined) {
        ChatLib.chat(`${LOGO + RED}Couldn't find any profile with name undefined...`);
        return;
    }

    // Convert username to player UUID
    request({
        url: `https://api.mojang.com/users/profiles/minecraft/${name}`,
        json: true
    }).then(res => {
        // Call Hypixel API
        request({
            url: `https://api.hypixel.net/v2/skyblock/profile?key=4e927d63a1c34f71b56428b2320cbf95&profile=${res.id}`,
            json: true
        }).then(response => {
            if (response.profile === null) {
                ChatLib.chat(`${LOGO + RED}Couldn't find any profile with name ${name}...`);
                return;
            }
            const data = response.members[res.id];
            Object.keys(data).forEach(key => ChatLib.chat(key));
        }).catch(err => console.error(`VolcAddons: ${err.cause ?? err}`));
    }).catch(err => ChatLib.chat(`${LOGO + RED + err.errorMessage}...`));
}).setName("kv", true).setAliases("kuudraView");
