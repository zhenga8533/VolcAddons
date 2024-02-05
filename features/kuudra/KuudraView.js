import request from "../../../requestV2";
import { AQUA, BOLD, DARK_AQUA, DARK_GRAY, DARK_PURPLE, DARK_RED, GOLD, GRAY, LOGO, RED, WHITE } from "../../utils/constants";
import { convertToTitleCase, formatNumber } from "../../utils/functions/format";
import { decode } from "../../utils/functions/misc";


/**
 * Checks if given inventory contains any required gear to print out.
 * 
 * @param {String} inv - Inventory NBT data.
 * @param {String} type - Inventory name.
 * @param {Array[]} aurora - Tracked aurora armor pieces [tier, stars, message]
 * @param {Array[]} terror - Tracked terror armor pieces [tier, stars, message]
 * @returns 
 */
function containsGoods(inv, type, aurora, terror) {
    if (inv === undefined) {
        ChatLib.chat(`${DARK_GRAY}- ${RED + type} API is OFF!`);
        return;
    }

    // Goods to be contained
    const GOODS = new Set(["NECRON_BLADE", "HYPERION", "VALKYRIE", "ASTRAEA", "SCYLLA", "TERMINATOR", "RAGNAROCK_AXE"]);
    const TIERS = ["HOT", "BURNING", "FIERY", "INFERNAL"];
    const PIECE = ["HELMET", "CHESTPLATE", "LEGGINGS", "BOOTS"];
    

    // Decode inventory NBT
    let items = decode(inv);

    // Loop through inventory data
    for (let i = 0; i < items.func_74745_c(); i++) {
        // Get item data
        let nbt = new NBTTagCompound(items.func_150305_b(i));
        let tag = nbt.getCompoundTag("tag");
        let attributes = tag.getCompoundTag("ExtraAttributes");
        let id = attributes.getString("id");
        let args = id.split('_');
        let display = tag.getCompoundTag("display");
        let name = display.getString("Name");

        // Check if item is a good :)
        if (GOODS.has(id)) {
            let data = name;
            let lore = tag.getCompoundTag("display").toObject()["Lore"];
            lore.forEach(line => data += `\n${line}`);
            new TextComponent(`${DARK_GRAY}- ${name}`).setHoverValue(data).chat();
        } else if (args[1] === "AURORA" || args[1] === "TERROR") {
            let type = args[1] === "AURORA" ? aurora : terror;
            let piece = type[PIECE.indexOf(args[2])];
            let tier = TIERS.indexOf(args[0]);
            let level = attributes.getInteger("upgrade_level");
            if (tier > piece[0] || (tier === piece[0] && level > piece[1])) {
                piece[0] = tier;
                piece[1] = level;
                piece[2] = name;
            }
        }
    }
}

/**
 * /kv command to display useful information for Kuudar.
 */
register("command", (name) => {
    if (name === undefined) {
        ChatLib.chat(`${LOGO + RED}Couldn't find any profile with name undefined...`);
        ChatLib.chat(`${LOGO + RED}Please input as: ${WHITE}/kv [ign]`);
        return;
    }

    // Convert username to player UUID
    request({
        url: `https://api.mojang.com/users/profiles/minecraft/${name}`,
        json: true
    }).then(res => {
        // Call Hypixel API
        request({
            url: `https://api.hypixel.net/v2/skyblock/profiles?key=4e927d63a1c34f71b56428b2320cbf95&uuid=${res.id}`,
            json: true
        }).then(response => {
            if (response.profiles === null) {
                ChatLib.chat(`${LOGO + RED}Couldn't find any profile with name ${name}...`);
                return;
            }

            const profile = response.profiles.find(prof => prof.selected);
            const data = profile.members[res.id];
            ChatLib.chat(`\n${LOGO + DARK_RED + BOLD + name}'s Kuudra View:\n`);

            // Loop through inventory to check gear.
            ChatLib.chat(`${DARK_AQUA + BOLD}Gear:`);
            const inventory = data?.inventory;
            const aurora = [[-1, -1, `${RED}Headless`], [-1, -1, `${RED}Heartless`], [-1, -1, `${RED}Pantsgrab`], [-1, -1, `${RED}Socksless`]];
            const terror = [[-1, -1, `${RED}Headless`], [-1, -1, `${RED}Heartless`], [-1, -1, `${RED}Pantsgrab`], [-1, -1, `${RED}Socksless`]];
            if (inventory === undefined) ChatLib.chat(`${DARK_GRAY}- ${RED}Inventory API is OFF!`);
            else {
                containsGoods(inventory?.inv_contents?.data, "Inventory", aurora, terror);
                containsGoods(inventory?.ender_chest_contents?.data, "Ender Chest", aurora, terror);
                containsGoods(inventory?.wardrobe_contents?.data, "Wardrobe", aurora, terror);

                // Loop over backpacks
                const backpacks = inventory.backpack_contents;
                const packs = backpacks === undefined ? 0 : Object.keys(backpacks).length;
                for (let i = 0; i < packs; i++) {
                    containsGoods(backpacks[i.toString()]?.data, "Backpack", aurora, terror);
                }
                if (packs === 0) ChatLib.chat(`${DARK_GRAY}- ${RED}Backpack API is OFF!`);

                // Chat out Aurora/Terror pieces in one message
                ChatLib.chat(`${DARK_AQUA + BOLD}Armor:`);
                new TextComponent(`${DARK_GRAY}- ${AQUA}Aurora Pieces`).setHoverValue(`${DARK_PURPLE}Aurora Pieces\n${aurora.map(inner => inner[2]).join('\n')}`).chat();
                new TextComponent(`${DARK_GRAY}- ${AQUA}Terror Pieces`).setHoverValue(`${DARK_PURPLE}Terror Pieces\n${terror.map(inner => inner[2]).join('\n')}`).chat();
            }
            
            // Check for accessory power
            ChatLib.chat(`${DARK_AQUA + BOLD}Misc:`);
            ChatLib.chat(`${DARK_GRAY}- ${AQUA}Magical Power: ${WHITE + (data?.accessory_bag_storage?.highest_magical_power ?? RED + "I NEED MORE POWER.")}`);

            // Check for Gdrag
            const pets = data?.pets_data?.pets;
            let gdrag = [`${RED}Not found!`];
            pets.forEach(pet => {
                if (pet.type !== "GOLDEN_DRAGON") return;

                if (pet.exp >= 210_255_385) {
                    gdrag[0] = `${GRAY}[Lvl 200] ${GOLD}Golden Dragon`;
                    gdrag.push(convertToTitleCase(pet.heldItem));
                } else if (gdrag[0].startsWith(RED))
                    gdrag[0] = `${GRAY}[Lvl ${RED}< 200] ${GOLD}Golden Dragon`;
            });
            new TextComponent(`${DARK_GRAY}- ${AQUA}GDrag: ${gdrag[0]}`).setHoverValue(gdrag.join('\n')).chat();

            // Bank
            let money = profile?.banking?.balance ?? 0;
            if (money === 0) ChatLib.chat(`${DARK_GRAY}- ${RED}Bank API is OFF!`);
            else {
                money +=  data?.currencies?.coin_purse ?? 0;
                ChatLib.chat(`${DARK_GRAY}- ${AQUA}Bank: ${WHITE + formatNumber(money)}`);
            }

            // Check completions
            const tiers = data?.nether_island_player_data?.kuudra_completed_tiers;
            if (tiers !== undefined) {
                let completions = `${DARK_GRAY}- ${AQUA}Completions: `;
                const tiers_key = Object.keys(tiers);
                if (tiers_key.length === 0) completions += `${RED}None........`

                tiers_key.forEach(tier => {
                    if (tier.startsWith("highest")) return;
                    completions += `${WHITE + tiers[tier]} ${GRAY}| `;
                });
                ChatLib.chat(completions.slice(0, -5));
            } else ChatLib.chat(`${DARK_GRAY}- ${AQUA}Completions: ${RED}None...`);

            // Reputation
            const barb = data?.nether_island_player_data?.barbarians_reputation ?? 0;
            const mage = data?.nether_island_player_data?.mages_reputation ?? 0;
            ChatLib.chat(`${DARK_GRAY}- ${AQUA}Reputation: ${RED + barb} ${GRAY}| ${DARK_PURPLE + mage}`);
        }).catch(err => console.error(`VolcAddons: ${err.cause ?? err}`));
    }).catch(_ => ChatLib.chat(`${LOGO + DARK_RED}API overloaded, please try again later!`));
}).setName("kv", true).setAliases("kuudraView");
