import request from "../../../requestV2";
import { AQUA, BLUE, DARK_AQUA, DARK_GRAY, DARK_GREEN, DARK_PURPLE, DARK_RED, GOLD, GRAY, GREEN, LIGHT_PURPLE, LOGO, RED, WHITE, YELLOW } from "../../utils/constants";
import { convertToTitleCase, formatNumber } from "../../utils/functions/format";
import { decode } from "../../utils/functions/misc";
import settings from "../../utils/settings";
import { getItemValue } from "./ItemPrice";
import { getAuction, getBazaar } from "./Economy";


/**
 * Decodes inventory NBT into an array of items and add their value up.
 * 
 * @param {String} inv - NBT string of the inventory data
 * @param {String} type - Name of the inventory
 * @returns {Type[]} [total value, value String]
 */
function getInvValue(inv, type) {
    // Check if API is on
    if (inv === undefined) return [0, ` ${DARK_GRAY}- ${RED + type} API is turned off!\n`];

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

/**
 * Adds up values in a specific category to print out a message of total value with a hover value. Also returns total value.
 * 
 * @param {String} name - Name of the container
 * @param {Type[]} values - Array of the value totals and strings
 * @param {String} extra - Any extra details to add to the bottom of message hover value.
 * @returns {Number} - Total value of all containers added together.
 */
function setInv(name, values, extra=undefined) {
    let value = 0;
    let msg = `${DARK_AQUA + name} Value:\n`;

    // Add up category values
    if (values.length === 0) msg += ` ${DARK_GRAY}- ${RED}${name} API is turned off!`;
    for (let i = 0; i < values.length; i++) {
        value += values[i][0];
        if (i < 48) msg += values[i][1];
        else if (i === 48) msg += `${GRAY}and ${values.length - 48} more!`;
    }
    if (extra !== undefined) msg += extra;

    new TextComponent(` ${DARK_GRAY}- ${AQUA + name} Value: ${GREEN + formatNumber(value)}`).setHoverValue(msg.trim()).chat();
    values.length = 0;
    return value;
}

/**
 * Fetches the networth of a player's Hypixel SkyBlock profile.
 * 
 * @param {String} username - Minecraft username to fetch networth for.
 * @param {String} fruit - Cute name (fruit) of the SkyBlock profile.
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
            // Check if user exists
            const profiles = response.profiles;
            if (profiles === null) {
                ChatLib.chat(`${LOGO + RED}Player '${username}' does not exist...`);
                return;
            }

            // Ask for desired profile
            if (fruit === undefined) {
                ChatLib.chat(`\n${LOGO + DARK_AQUA}Please select desired profile:`);

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
            const player = profile.members[res.id];
            const data = player.inventory;
            if (data === undefined) {
                ChatLib.chat(`${LOGO + RED + username}'s inventory API is turned off!`);
                return;
            }

            // Otherwise calculate networth for inputted profile
            const auction = getAuction();
            const bazaar = getBazaar();
            ChatLib.chat(`\n${LOGO + DARK_AQUA}${username}'s ${profile.cute_name} Networth:\n`);
            let total = 0;
            let invValues = [];

            // Inventory value
            invValues.push(getInvValue(data.inv_contents?.data, "Inventory"));
            invValues.push(getInvValue(data.inv_armor?.data, "Armor"));
            invValues.push(getInvValue(data.equipment_contents?.data, "Equipment"));
            total += setInv("Player", invValues);

            // Currency value
            const currencies = player.currencies;
            invValues.push([currencies?.coin_purse, ` ${DARK_GRAY}- ${AQUA}Purse Value: ${GREEN + formatNumber(currencies?.coin_purse)}\n`]);

            if (profile.banking?.balance === undefined) invValues.push([0, ` ${DARK_GRAY}- ${RED}Bank API is turned off!\n`]);
            else invValues.push([profile.banking?.balance, ` ${DARK_GRAY}- ${AQUA}Bank Value: ${GREEN + formatNumber(profile.banking?.balance)}\n`]);

            const essences = currencies?.essence;
            let essenceValue = 0;
            if (essences !== undefined) Object.keys(essences).forEach(essence => {
                essenceValue += bazaar["ESSENCE_" + essence][settings.priceType] * essences[essence].current;
            });
            invValues.push([essenceValue, ` ${DARK_GRAY}- ${AQUA}Essence Value: ${GREEN + formatNumber(essenceValue)}\n`]);

            total += setInv("Currency", invValues);

            // Storage value
            invValues.push(getInvValue(data.wardrobe_contents?.data, "Wardrobe"));
            invValues.push(getInvValue(data.ender_chest_contents?.data, "Ender Chest"));
            invValues.push(getInvValue(data.personal_vault_contents?.data, "Vault"));
            total += setInv("Storage", invValues);

            // Backpack values
            const backpacks = data.backpack_contents;
            const packs = backpacks === undefined ? 0 : Object.keys(backpacks).length;

            for (let i = 0; i < packs; i++) {
                let backpack = backpacks[i.toString()];
                invValues.push(getInvValue(backpack?.data, `Backpack ${i + 1}`));
            }
            invValues.sort((a, b) => b[0] - a[0]);
            total += setInv("Backpack", invValues);

            // Bag values
            const bags = data.bag_contents;
            if (bags !== undefined) Object.keys(bags).forEach(bag => invValues.push(getInvValue(bags[bag]?.data, convertToTitleCase(bag))));
            const sacks = data.sacks_counts;
            let sacksValue = 0;
            if (sacks !== undefined) Object.keys(sacks).forEach(product => sacksValue += (bazaar[product]?.[settings.priceType] ?? 0) * sacks[product]);
            invValues.push([sacksValue, ` ${DARK_GRAY}- ${AQUA}Sacks Value: ${GREEN + formatNumber(sacksValue)}`]);
            total += setInv("Bag", invValues);

            // Pets values
            const pets = player.pets_data.pets;
            let mia = 0;
            pets.forEach(pet => {
                const tier = pet.tier;
                const petName = `${tier}_${pet.type}`;
                let lbin = auction[petName]?.lbin ?? 0;
                const color = tier === "MYTHIC" ? LIGHT_PURPLE :
                    tier === "LEGENDARY" ? GOLD :
                    tier === "EPIC" ? DARK_PURPLE :
                    tier === "RARE" ? BLUE :
                    tier === "UNCOMMON" ? GREEN : WHITE;
                if (pet.skin !== null) {
                    const skinValue = auction["PET_SKIN_" + pet.skin]?.lbin ?? 0;
                    if (skinValue === 0) mia++;
                    lbin += skinValue;
                }
                invValues.push([lbin, `${color + convertToTitleCase(petName) + DARK_GRAY}: ${GREEN + formatNumber(lbin)}\n`]);
            });
            invValues.sort((a, b) => b[0] - a[0]);
            total += setInv("Pet", invValues, mia === 0 ? undefined : `\n${DARK_GRAY}also ${mia} unaccounted skins...`);

            // Total
           ChatLib.chat(`${DARK_GRAY}Hover over values to see breakdown.`);
           ChatLib.chat(`\n${LOGO + DARK_AQUA}Total Networth: ${DARK_GREEN + formatNumber(total)}`);
        }).catch((err) => ChatLib.chat(LOGO + DARK_RED + (err.cause ?? err)));
    }).catch((err) => ChatLib.chat(LOGO + DARK_RED + (err.cause ?? err)));
}
