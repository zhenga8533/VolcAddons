import request from "../../../requestV2";
import { AQUA, DARK_AQUA, DARK_GRAY, DARK_GREEN, DARK_RED, GRAY, GREEN, LOGO, RED, YELLOW } from "../../utils/constants";
import { convertToTitleCase, decode, formatNumber } from "../../utils/functions";
import { getItemValue } from "./ItemPrice";


function getInvValue(inv, type) {
    // Check if API is on
    if (inv === undefined) {
        ChatLib.chat(` ${DARK_GRAY}- ${RED + type} API is turned off!`);
        return 0;
    }

    // Decode inventory NBT
    let items = decode(inv);
    let total = 0;

    // Loop through inventory data
    for (let i = 0; i < items.func_74745_c(); i++) {
        let nbt = new NBTTagCompound(items.func_150305_b(i));
        total += getItemValue(nbt, false);
    }

    // Return value and message
    const color = total === 0 ? RED : GREEN;
    return [total, ` ${DARK_GRAY}- ${AQUA + type} Value: ${color + formatNumber(total)}\n`];
}

function setInv(name, values) {
    let value = 0;
    let msg = `${DARK_AQUA + name} Value:\n`;
    for (let i = 0; i < values.length; i++) {
        value += values[i][0];
        msg += values[i][1];
    }
    new TextComponent(` ${DARK_GRAY}- ${AQUA + name} Value: ${GREEN + formatNumber(value)}`).setHoverValue(msg.trim()).chat();
    values.length = 0;

    return value;
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
            ChatLib.chat(`\n${LOGO + DARK_AQUA}${username}'s ${profile.cute_name} Networth:\n`);
            let total = 0;
            let invValues = [];

            // Inventory value
            invValues.push(getInvValue(data.inv_contents?.data, "Inventory"));
            invValues.push(getInvValue(data.inv_armor?.data, "Armor"));
            invValues.push(getInvValue(data.equipment_contents?.data, "Equipment"));
            total += setInv("Player's", invValues);

            // Storage value
            invValues.push(getInvValue(data.wardrobe_contents?.data, "Wardrobe"));
            invValues.push(getInvValue(data.ender_chest_contents?.data, "Ender Chest"));
            invValues.push(getInvValue(data.personal_vault_contents?.data, "Vault"));
            total += setInv("Storage's", invValues);

            // Backpack values
            const backpacks = data.backpack_contents;
            const packs = Object.keys(backpacks).length;

            for (let i = 0; i < packs; i++) {
                let backpack = backpacks[i.toString()];
                invValues.push(getInvValue(backpack?.data, `Backpack ${i + 1}`));
            }

            invValues.sort((a, b) => b[0] - a[0]);
            total += setInv("Backpacks'", invValues);

            // Bag values
            const bags = data.bag_contents;
            Object.keys(bags).forEach(bag => invValues.push(getInvValue(bags[bag]?.data, convertToTitleCase(bag))));
            total += setInv("Bags'", invValues);

            // Total
           ChatLib.chat(`${DARK_GRAY}Hover over values to see breakdown.`);
           ChatLib.chat(`\n${LOGO + DARK_AQUA}Total Networth: ${DARK_GREEN + formatNumber(total)}`);
        }).catch((err) => {
            // If there is an error, display the error message in the Minecraft chat.
            ChatLib.chat(`${LOGO + DARK_RED + err.cause ?? err}`);
        });
    }).catch((err) => {
        // If there is an error, display the error message in the Minecraft chat.
        ChatLib.chat(`${LOGO + RED + err.cause ?? err}`);
    });
}