import request from "../../../requestV2";
import { AQUA, DARK_AQUA, DARK_RED, GRAY, LOGO, RED, YELLOW } from "../../utils/constants";
import { decode } from "../../utils/functions";


/**
 * 
 */
export function getNetworth(username, fruit) {
    // Get UUID of entered username
    request({
        url: `https://api.mojang.com/users/profiles/minecraft/${username}`,
        json: true
    }).then((res) => {
        // Request profile data through hypixel API
        request({
            url: `https://api.hypixel.net/v2/skyblock/profiles?key=4e927d63a1c34f71b56428b2320cbf95&uuid=${res.id}`,
            json: true
        }).then((response) => {
            // Ask for desired profile
            const profiles = response.profiles;
            if (fruit === undefined) {
                ChatLib.chat(`${LOGO + DARK_AQUA}Please select desired profile:`);

                for (let i = 0; i < profiles.length; i++) {
                    fruit = profiles[i].cute_name;
                    new Message(` ${GRAY + (i + 1)}. `, new TextComponent(AQUA + fruit)
                        .setClickAction("run_command")
                        .setClickValue(`/va nw ${username} ${fruit}`)
                        .setHoverValue(`${YELLOW}Click to calculate networth for ${fruit} profile.`)
                    ).chat();
                }
                return;
            }

            // Otherwise calculate networth for inputted profile
            const profile = profiles.find(prof => prof.cute_name.toLowerCase() === fruit.toLowerCase());
            if (profile === undefined) {
                ChatLib.chat(`${LOGO + RED + fruit}profile was not found!`)
                return;
            }
            const data = profile.members[res.id].inventory;
            ChatLib.chat(`\n${LOGO + RED}Calculating networth for ${username} on ${profile.cute_name}...`);

            // inv_contents value:
            const invData = decode(data.inv_contents.data);

            /*
                inv_contents
                ender_chest_contents
                backpack_icons
                bag_contents
                inv_armor
                equipment_contents
                personal_vault_contents
                wardrobe_equipped_slot
                backpack_contents
                sacks_counts
                wardrobe_contents
            */
        }).catch((err) => {
            // If there is an error, display the error message in the Minecraft chat.
            ChatLib.chat(`${LOGO + DARK_RED + err.cause ?? err}`);
        });
    }).catch((err) => {
        // If there is an error, display the error message in the Minecraft chat.
        ChatLib.chat(`${LOGO + RED + err.cause ?? err}`);
    });
}