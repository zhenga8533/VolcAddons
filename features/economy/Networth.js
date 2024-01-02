import request from "../../../requestV2";
import { AQUA, DARK_AQUA, DARK_GRAY, DARK_RED, GRAY, GREEN, LOGO, RED, YELLOW } from "../../utils/constants";
import { decode, formatNumber } from "../../utils/functions";
import { getItemValue } from "./ItemPrice";


function getInvValue(inv, type) {
    if (inv === undefined) {
        ChatLib.chat(` - ${RED + type} API is turned off!`);
        return 0;
    }

    let items = decode(inv);
    let total = 0;

    for (let i = 0; i < items.func_74745_c(); i++) {
        let nbt = new NBTTagCompound(items.func_150305_b(i));
        total += getItemValue(nbt, false);
    }

    ChatLib.chat(` ${DARK_GRAY}- ${AQUA + type} Value: ${GREEN + formatNumber(total)}`);
    return total;
}


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
                    new Message(` ${GRAY + (i + 1)}. `, new TextComponent((profiles[i].selected ? GREEN : AQUA) + fruit)
                        .setClickAction("run_command")
                        .setClickValue(`/va nw ${username} ${fruit}`)
                        .setHoverValue(`${YELLOW}Click to calculate networth for ${fruit} profile.`)
                    ).chat();
                }
                return;
            }

            // Check for correct profile and API
            const profile = profiles.find(prof => prof.cute_name.toLowerCase() === fruit.toLowerCase());
            if (profile === undefined) {
                ChatLib.chat(`${LOGO + RED + fruit} profile was not found!`);
                return;
            }
            const data = profile.members[res.id].inventory;
            if (data === undefined) {
                ChatLib.chat(`${LOGO + RED + username}'s inventory API is turned off!`);
                return;
            }

            Object.keys(data).forEach(key => print(key));

            // Otherwise calculate networth for inputted profile
            ChatLib.chat(`\n${LOGO + RED}Calculating networth for ${username} on ${profile.cute_name}...\n`);
            let total = 0;

            // Inventory value:
            total += getInvValue(data.inv_contents?.data, "Inventory");

            // Armor value:
            total += getInvValue(data.inv_armor?.data, "Armor");
            total += getInvValue(data.equipment_contents?.data, "Equipment");
            total += getInvValue(data.wardrobe_equipped_slot?.data, "Wardrobe");

            // Storage value:
            total += getInvValue(data.ender_chest_contents?.data, "Ender Chest");
            total += getInvValue(data.bag_contents?.data, "Storage");
            total += getInvValue(data.personal_vault_contents?.data, "Vault");

            // Sacks value:

            /*
                backpack_icons
                personal_vault_contents
                sacks_counts
                wardrobe_contents
            */
           ChatLib.chat(` - Total Networth: ${formatNumber(total)}`);
        }).catch((err) => {
            // If there is an error, display the error message in the Minecraft chat.
            ChatLib.chat(`${LOGO + DARK_RED + err.cause ?? err}`);
        });
    }).catch((err) => {
        // If there is an error, display the error message in the Minecraft chat.
        ChatLib.chat(`${LOGO + RED + err.cause ?? err}`);
    });
}