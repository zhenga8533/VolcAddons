import axios from "../../../axios";
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

let networthIDs = [3745];
/**
 * Fetches the networth of a player's Hypixel SkyBlock profile.
 * 
 * @param {String} username - Minecraft username to fetch networth for.
 * @param {String} fruit - Cute name (fruit) of the SkyBlock profile.
 */
export function getNetworth(username, fruit) {
    // Get UUID of entered username
    new Message(`${LOGO + YELLOW}Fetching API data...`).setChatLineId(3745).chat();
    axios.get(`https://sky.shiiyu.moe/api/v2/profile/${username}`).then(response => {
        ChatLib.clearChat(networthIDs);
        networthIDs = [3745];
        let networthID = 3746;

        // Check if user exists
        if (response.data.error !== undefined) {
            networthIDs.push(networthID);
            new Message(`${LOGO + RED}Couldn't find any profile with name ${username}...`).setChatLineId(networthID++).chat();
            return;
        }

        // Ask for desired profile
        const profiles = response.data.profiles;
        if (fruit === undefined) {
            networthIDs.push(networthID);
            new Message(`\n${LOGO + DARK_AQUA}Please select desired profile:`).setChatLineId(networthID++).chat();

            let i = 1;
            Object.keys(profiles).forEach(key => {
                fruit = profiles[key].cute_name;
                networthIDs.push(networthID);
                new Message(` ${GRAY + (i++)}. `, new TextComponent((profiles[key].current ? GREEN : AQUA) + fruit)
                    .setClickAction("run_command")
                    .setClickValue(`/va nw ${username} ${fruit}`)
                    .setHoverValue(`${YELLOW}Click to calculate networth for ${fruit} profile.`)
                ).setChatLineId(networthID++).chat();
            });
            return;
        }

        // Check for correct profile and API
        const selected = Object.keys(profiles).find(key => profiles[key].cute_name.toLowerCase() === fruit.toLowerCase());
        const player = profiles[selected]?.raw;
        if (player === undefined) {
            ChatLib.chat(`${LOGO + RED + fruit} profile was not found!`);
            return;
        }
        const inv = player.inventory;
        if (inv === undefined) {
            ChatLib.chat(`${LOGO + RED + username}'s inventory API is turned off!`);
            return;
        }

        // Otherwise calculate networth for inputted profile
        const auction = getAuction();
        const bazaar = getBazaar();
        ChatLib.chat(`\n${LOGO + DARK_AQUA}${username}'s ${fruit} Networth:\n`);
        let total = 0;
        let invValues = [];

        // Inventory value
        invValues.push(getInvValue(inv.inv_contents?.data, "Inventory"));
        invValues.push(getInvValue(inv.inv_armor?.data, "Armor"));
        invValues.push(getInvValue(inv.equipment_contents?.data, "Equipment"));
        total += setInv("Player", invValues);

        // Currency value
        const currencies = player.currencies;
        invValues.push([currencies?.coin_purse, ` ${DARK_GRAY}- ${AQUA}Purse Value: ${GREEN + formatNumber(currencies?.coin_purse)}\n`]);

        if (currencies?.bank === undefined) invValues.push([0, ` ${DARK_GRAY}- ${RED}Bank API is turned off!\n`]);
        else invValues.push([currencies?.bank, ` ${DARK_GRAY}- ${AQUA}Bank Value: ${GREEN + formatNumber(currencies?.bank)}\n`]);

        const essences = currencies?.essence;
        let essenceValue = 0;
        if (essences !== undefined) Object.keys(essences).forEach(essence => {
            essenceValue += bazaar["ESSENCE_" + essence][settings.priceType] * essences[essence].current;
        });
        invValues.push([essenceValue, ` ${DARK_GRAY}- ${AQUA}Essence Value: ${GREEN + formatNumber(essenceValue)}\n`]);

        total += setInv("Currency", invValues);

        // Storage value
        invValues.push(getInvValue(inv.wardrobe_contents?.data, "Wardrobe"));
        invValues.push(getInvValue(inv.ender_chest_contents?.data, "Ender Chest"));
        invValues.push(getInvValue(inv.personal_vault_contents?.data, "Vault"));
        total += setInv("Storage", invValues);

        // Backpack values
        const backpacks = inv.backpack_contents;
        const packs = backpacks === undefined ? 0 : Object.keys(backpacks).length;

        for (let i = 0; i < packs; i++) {
            let backpack = backpacks[i.toString()];
            invValues.push(getInvValue(backpack?.data, `Backpack ${i + 1}`));
        }
        invValues.sort((a, b) => b[0] - a[0]);
        total += setInv("Backpack", invValues);

        // Bag values
        const bags = inv.bag_contents;
        if (bags !== undefined) Object.keys(bags).forEach(bag => invValues.push(getInvValue(bags[bag]?.data, convertToTitleCase(bag))));
        const sacks = inv.sacks_counts;
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
    }).catch(err => ChatLib.chat(LOGO + DARK_RED + (err.cause ?? err)));
}
