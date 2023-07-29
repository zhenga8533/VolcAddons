import settings from "../../settings";
import { getBazaar } from "../../utils/bazaar";
import { commafy } from "../../utils/functions";
import { registerWhen } from "../../utils/variables";


/**
 * Variables used to represent item enchantment data.
 * "ENCHANTMENT_NAME": Minimum max craft.
 */
const MAX_ENCHANTS = {
    // Weapon Enchantments
    "BANE_OF_ARTHROPODS": 7,
    "CHAMPION": 1,
    "CLEAVE": 6,
    "CRITICAL": 7,
    "CUBISM": 6,
    "DIVINE_GIFT": 1,
    "DRAGON_HUNTER": 1,
    "ENDER_SLAYER": 7,
    "EXECUTE": 6,
    "EXPERIENCE": 5,
    "FIRE_ASPECT": 3,
    "FIRST_STRIKE": 5,
    "GIANT_KILLER": 7,
    "LETHALITY": 6,
    "LIFE_STEAL": 5,
    "LOOTING": 5,
    "LUCK": 7,
    "MANA_STEAL": 1,
    "PROSECUTE": 6,
    "SCAVENGER": 5,
    "SHARPNESS": 7,
    "SMITE": 7,
    "SMOLDERING": 1,
    "SYPHON": 5,
    "TABASCO": 3,
    "THUNDERBOLT": 6,
    "THUNDERBOLT": 7,
    "TITAN_KILLER": 7,
    "TRIPLE_STRIKE": 5,
    "VAMPIRISM": 6,
    "VENOMOUS": 6,
    "VICIOUS": 5,
    "ULTIMATE_CHIMERA": 1,
    "ULTIMATE_COMBO": 1,
    "ULTIMATE_FATAL_TEMPO": 1,
    "ULTIMATE_INFERNO": 1,
    "ULTIMATE_ONE_FOR_ALL": 1,
    "ULTIMATE_SOUL_EATER": 1,
    "ULTIMATE_SWARM": 1,
    "ULTIMATE_JERRY": 1,
    "ULTIMATE_WISE": 1,
    "CHANCE": 5,
    "INFINITE_QUIVER": 6,
    "OVERLOAD": 1,
    "POWER": 7,
    "SNIPE": 4,
    "ULTIMATE_REITERATE": 1,
    "ULTIMATE_REND": 1,
    // Armor Enchantments
    "BIG_BRAIN": 3,
    "TRANSYLVANIAN": 4,
    "BLAST_PROTECTION": 7,
    "FEROCIOUS_MANA": 1,
    "FIRE_PROTECTION": 7,
    "GROWTH": 7,
    "HARDENED_MANA": 1,
    "HECATOMB": 1,
    "MANA_VAMPIRE": 1,
    "PROJECTILE_PROTECTION": 6,
    "PROTECTION": 7,
    "REJUVENATE": 1,
    "RESPITE": 1,
    "STRONG_MANA": 1,
    "ULTIMATE_BANK": 1,
    "ULTIMATE_HABANERO_TACTICS": 4,
    "ULTIMATE_LAST_STAND": 1,
    "ULTIMATE_LEGION": 1,
    "ULTIMATE_NO_PAIN_NO_GAIN": 1,
    "ULTIMATE_WISDOM": 1,
    "REFLECTION": 1,
    "COUNTER_STRIKE": 5,
    "TRUE_PROTECTION": 1,
    "SMARTY_PANTS": 1,
    "FEATHER_FALLING": 6,
    "SUGAR_RUSH": 1,
    // Tool Enchantments
    "COMPACT": 1,
    "EFFICIENCY": 1,
    "FORTUNE": 4,
    "PRISTINE": 1,
    "CULTIVATING": 1,
    "DEDICATION": 4,
    "DELICATE": 5,
    "HARVESTING": 6,
    "REPLENISH": 1,
    "TURBO_CACTUS": 1,
    "TURBO_CANE": 1,
    "TURBO_CARROT": 1,
    "TURBO_MUSHROOMS": 1,
    "TURBO_POTATO": 1,
    "TURBO_WARTS": 1,
    "TURBO_WHEAT": 1,
    "SUNDER": 1,
    "TURBO_COCO": 1,
    "TURBO_MELON": 1,
    "TURBO_PUMPKIN": 1,
    "EXPERTISE": 1,
    "ULTIMATE_BOBBIN_TIME": 3,
    "ULTIMATE_FLASH": 1,
    // Equipment Enchantments
    "CAYENNE": 1,
    "GREEN_THUMB": 1,
    "PROSPERITY": 1,
    "QUANTUM": 3,
    "ULTIMATE_THE_ONE": 4,
};
const ENCHANTS = Object.keys(MAX_ENCHANTS);
const STACKING_ENCHANTS = ["EXPERTISE", "COMPACT", "CULTIVATING", "CHAMPION", "HECATOMB", "EFFICIENCY"];
const items = Object.keys(MAX_ENCHANTS).reduce((acc, key) => {
    acc[`ENCHANTMENT_${key}_${MAX_ENCHANTS[key]}`] = [0, 0];
    return acc;
}, {});
items["SIL_EX"] = [0, 0];
getBazaar(items);
let NBTTagString = Java.type("net.minecraft.nbt.NBTTagString");

/**
 * Figures out the enchantment value of the given item.
 * 
 * @param {Object} item - Item Object.
 * @returns {number[]} - [Buy order price, Insta buy price]
 */
function getEnchantValue(item) {
    let orderValue = 0;
    let instaValue = 0;
    const heldEnchants = item.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getCompoundTag("enchantments").toObject();
    
    Object.keys(heldEnchants).forEach(enchant => {
        // Check for enchant in dict and higher level than lowest max.
        let enchantlvl = heldEnchants[enchant];
        enchant = enchant.toUpperCase();
        if (ENCHANTS.includes(enchant) && enchantlvl >= MAX_ENCHANTS[enchant]) {
            let base = enchant === "EFFICIENCY" ? items[`SIL_EX`] : items[`ENCHANTMENT_${enchant}_${MAX_ENCHANTS[enchant]}`];
            let multiplier = enchant === "EFFICIENCY" ? enchantlvl - 5 : 1;
            multiplier = STACKING_ENCHANTS.includes(enchant) ? multiplier : 2 ** (enchantlvl - MAX_ENCHANTS[enchant]);
            orderValue += base[0] * multiplier;
            instaValue += base[1] * multiplier;
        }
    });

    return [orderValue, instaValue];
}

/**
 * Adds enchantment value tag onto item over all items hovered over.
 * 
 * @param {string} lore - Item lore.
 * @param {Object} item - Item object.
 */
registerWhen(register("itemTooltip", (lore, item) => {
    // Check item data to cancel lore append.
    const loreTag = item.getNBT().getCompoundTag("tag").getCompoundTag("display").getTagMap().get("Lore");
    if (loreTag === null) return;
    const list = new NBTTagList(loreTag);
    for (let i = 0; i < list.getTagCount(); i++) {
        if (list.getStringTagAt(i).includes("Buy Order Enchants:")) return;
    }

    // Add to item lore.
    const values = getEnchantValue(item);
    if (values[0] == 0) return;
    const orderText = `§5§lBuy Order Enchants: §6${commafy(values[0])}`;
    const instaText = `§5§lInsta Buy Enchants: §6${commafy(values[1])}`;
    list.appendTag(new NBTTagString(orderText));
    list.appendTag(new NBTTagString(instaText));
}), () => settings.itemPrice);
