import settings from "../../settings";
import { getAttributeItems, getAuction } from "../../utils/auction";
import { getBazaar } from "../../utils/bazaar";
import { commafy, convertToTitleCase, removeReforges } from "../../utils/functions";
import { registerWhen } from "../../utils/variables";


/**
 * Variables used to represent item enchantment data.
 * "ENCHANTMENT_NAME": Minimum max craft.
 */
const MAX_ENCHANTS = {
    // Weapon Enchantments
    "BANE_OF_ARTHROPODS": 7, "CHAMPION": 1, "CLEAVE": 6, "CRITICAL": 7, "CUBISM": 6, "DIVINE_GIFT": 1, "DRAGON_HUNTER": 1, "ENDER_SLAYER": 7,
    "EXECUTE": 6, "EXPERIENCE": 5, "FIRE_ASPECT": 3, "FIRST_STRIKE": 5, "GIANT_KILLER": 7, "LETHALITY": 6, "LIFE_STEAL": 5, "LOOTING": 5,
    "LUCK": 7, "MANA_STEAL": 1, "PROSECUTE": 6, "SCAVENGER": 5, "SHARPNESS": 7, "SMITE": 7, "SMOLDERING": 1, "SYPHON": 5, "TABASCO": 3,
    "THUNDERBOLT": 6, "THUNDERBOLT": 7, "TITAN_KILLER": 7, "TRIPLE_STRIKE": 5, "VAMPIRISM": 6, "VENOMOUS": 6, "VICIOUS": 5, "ULTIMATE_CHIMERA": 1,
    "ULTIMATE_COMBO": 1, "ULTIMATE_FATAL_TEMPO": 1, "ULTIMATE_INFERNO": 1, "ULTIMATE_ONE_FOR_ALL": 1, "ULTIMATE_SOUL_EATER": 1,
    "ULTIMATE_SWARM": 1, "ULTIMATE_JERRY": 1, "ULTIMATE_WISE": 1, "CHANCE": 5, "INFINITE_QUIVER": 6, "OVERLOAD": 1, "POWER": 7,  "SNIPE": 4,
    "ULTIMATE_REITERATE": 1, "ULTIMATE_REND": 1,
    // Armor Enchantments
    "BIG_BRAIN": 3, "TRANSYLVANIAN": 4,  "BLAST_PROTECTION": 7, "FEROCIOUS_MANA": 5, "FIRE_PROTECTION": 7, "GROWTH": 7, "HARDENED_MANA": 5,
    "HECATOMB": 1, "MANA_VAMPIRE": 1, "PROJECTILE_PROTECTION": 6, "PROTECTION": 7, "REJUVENATE": 1, "RESPITE": 1, "STRONG_MANA": 5,
    "ULTIMATE_BANK": 1, "ULTIMATE_HABANERO_TACTICS": 4, "ULTIMATE_LAST_STAND": 1, "ULTIMATE_LEGION": 1, "ULTIMATE_NO_PAIN_NO_GAIN": 1,
    "ULTIMATE_WISDOM": 1, "REFLECTION": 1, "COUNTER_STRIKE": 5, "TRUE_PROTECTION": 1, "SMARTY_PANTS": 1, "FEATHER_FALLING": 6, "SUGAR_RUSH": 1,
    // Tool Enchantments
    "COMPACT": 1, "EFFICIENCY": 1, "FORTUNE": 4, "PRISTINE": 1, "CULTIVATING": 1, "DEDICATION": 4, "DELICATE": 5, "HARVESTING": 6, "REPLENISH": 1,
    "TURBO_CACTUS": 1, "TURBO_CANE": 1, "TURBO_CARROT": 1, "TURBO_MUSHROOMS": 1, "TURBO_POTATO": 1, "TURBO_WARTS": 1, "TURBO_WHEAT": 1,
    "SUNDER": 1, "TURBO_COCO": 1, "TURBO_MELON": 1, "TURBO_PUMPKIN": 1, "EXPERTISE": 1, "ULTIMATE_BOBBIN_TIME": 3, "ULTIMATE_FLASH": 1,
    // Equipment Enchantments
    "CAYENNE": 1, "GREEN_THUMB": 1, "PROSPERITY": 1, "QUANTUM": 3, "ULTIMATE_THE_ONE": 4,
};
const ENCHANTS = new Set(Object.keys(MAX_ENCHANTS));
const STACKING_ENCHANTS = new Set(["EXPERTISE", "COMPACT", "CULTIVATING", "CHAMPION", "HECATOMB", "EFFICIENCY"]);
const enchants = Object.keys(MAX_ENCHANTS).reduce((acc, key) => {
    acc[`ENCHANTMENT_${key}_${MAX_ENCHANTS[key]}`] = [0, 0];
    return acc;
}, {});
enchants["SIL_EX"] = [0, 0];
getBazaar(enchants);

/**
 * Variables used to represent item modifier data.
 * "ENCHANTMENT_NAME": [Offer Price, Insta Price].
 */
const modifiers = {
    // General
    "RECOMBOBULATOR_3000": [0, 0], "HOT_POTATO_BOOK": [0, 0], "FUMING_POTATO_BOOK": [0, 0], "ART_OF_WAR": [0, 0],
    // Dungeons
    "WITHER_SHIELD_SCROLL": [0, 0], "IMPLOSION_SCROLL": [0, 0], "SHADOW_WARP_SCROLL": [0, 0],
    "FIRST_MASTER_STAR": [0, 0], "SECOND_MASTER_STAR": [0, 0], "THIRD_MASTER_STAR": [0, 0], "FOURTH_MASTER_STAR": [0, 0],
    "FIFTH_MASTER_STAR": [0, 0],
    // Gems
    "FLAWLESS_JADE_GEM": [0, 0], "FLAWLESS_AMBER_GEM": [0, 0], "FLAWLESS_TOPAZ_GEM": [0, 0], "FLAWLESS_SAPPHIRE_GEM": [0, 0],
    "FLAWLESS_AMETHYST_GEM": [0, 0], "FLAWLESS_JASPER_GEM": [0, 0], "FLAWLESS_RUBY_GEM": [0, 0], "FLAWLESS_OPAL_GEM": [0, 0],
    "PERFECT_JADE_GEM": [0, 0], "PERFECT_AMBER_GEM": [0, 0], "PERFECT_TOPAZ_GEM": [0, 0], "PERFECT_SAPPHIRE_GEM": [0, 0],
    "PERFECT_AMETHYST_GEM": [0, 0], "PERFECT_JASPER_GEM": [0, 0], "PERFECT_RUBY_GEM": [0, 0], "PERFECT_OPAL_GEM": [0, 0]
};
const STAR_PLACEMENT = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH"];
const GEMSTONE_SLOTS = new Set(["JADE", "AMBER", "TOPAZ", "SAPPHIRE", "AMETHYST", "RUBY", "JASPER", "OPAL"]);
const MULTIUSE_SLOTS = new Set(["COMBAT", "DEFENSIVE", "MINING", "UNIVERSAL"]);
getBazaar(modifiers);

/**
 * Figures out the enchantment value of the given item.
 * 
 * @param {Object} item - Item Object.
 * @returns {number} - Total value of item.
 */
export function getItemValue(item) {
    if (item === null) return 0;
    const auction = getAuction();
    const heldItem = item.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").toObject();
    const itemName = removeReforges("all", item.getNBT().getCompoundTag("tag").getCompoundTag("display").getString("Name").removeFormatting());
    let value = auction[itemName] || 0;
    
    // Enchantment values
    Object.entries(heldItem.enchantments || {}).forEach(([enchant, enchantlvl]) => {
        enchant = enchant.toUpperCase();
        const maxEnchantLevel = MAX_ENCHANTS[enchant];
        if (ENCHANTS.has(enchant) && enchantlvl >= maxEnchantLevel) {
            const enchantKey = enchant === "EFFICIENCY" ? "SIL_EX" : `ENCHANTMENT_${enchant}_${maxEnchantLevel}`;
            const base = enchants[enchantKey];
            const isStackingEnchant = STACKING_ENCHANTS.has(enchant);
            let multiplier = enchant === "EFFICIENCY" ? enchantlvl - 5 : 1;
            multiplier = isStackingEnchant ? multiplier : 2 ** (enchantlvl - maxEnchantLevel);
            value += base[0] * multiplier;
        }
    });
  

    // Modifier values

    // Recomb
    value += heldItem.rarity_upgrades === undefined ? 0 : modifiers["RECOMBOBULATOR_3000"][0];

    // Rune
    if (heldItem.runes !== undefined) {
        const [rune, _] = Object.entries(heldItem.runes);
        const runeCost = auction[`${rune[0].charAt(0).toUpperCase() + rune[0].slice(1).toLowerCase()} Rune ${['I', 'II', 'III'][rune[1] - 1]}`];
        value += runeCost === undefined ? 0 : runeCost;
    }
  
    // Potato Books
    const hotPotatoCount = heldItem.hot_potato_count;
    value += (hotPotatoCount === undefined ? 0 : Math.min(hotPotatoCount, 10) * modifiers["HOT_POTATO_BOOK"][0]) +
        (hotPotatoCount === undefined ? 0 : Math.max(hotPotatoCount - 10, 0) * modifiers["FUMING_POTATO_BOOK"][0]);
    
    // Art of War
    value += heldItem.art_of_war_count === undefined ? 0 : modifiers["ART_OF_WAR"][0];
  
    // Master Stars
    const upgradeLevel = heldItem.upgrade_level;
    const stars = Math.max(upgradeLevel - 5, 0);
    for (let i = 0; i < stars; i++) {
        value += modifiers[`${STAR_PLACEMENT[i]}_MASTER_STAR`][0];
    }
  
    // Wither Impact Scrolls
    (heldItem.ability_scroll || []).forEach(scroll => {
        value += modifiers[scroll][0];
    });

    // Gems
    const gemsKeys = Object.keys(heldItem.gems || {});
    gemsKeys.forEach((gemstone) => {
        const gemstoneData = heldItem.gems[gemstone];
        const gemstoneTier = gemstoneData?.quality || gemstoneData;
        const gemstoneType = gemstone.split('_');

        let gemstoneValue = 0;
        if (GEMSTONE_SLOTS.has(gemstoneType[0]))
            gemstoneValue = modifiers[`${gemstoneTier}_${gemstoneType[0]}_GEM`]?.[0] || 0;
        else if (MULTIUSE_SLOTS.has(gemstoneType[0]) && gemstoneType[gemstoneType.length - 1] !== "gem")
            gemstoneValue = modifiers[`${gemstoneTier}_${heldItem.gems[gemstone + "_gem"]}_GEM`]?.[0] || 0;
        value += gemstoneValue;
    });

    // Attributes
    const attributes = Object.keys(heldItem.attributes || {});
    const attributeItems = getAttributeItems();
    let attributeValue = 0;
    attributes.forEach((attribute) => {
        const attributeTier = heldItem.attributes[attribute];
        attribute = attribute === "mending" ? "bVitality" : `b${convertToTitleCase(attribute)}`;
        attributeValue = Math.max(attributeValue,
            (attributeItems[itemName.split(' ')[1]]?.attributes?.[attribute] || 
            attributeItems["Attribute Shard"]?.attributes?.[attribute] || 0)
        * (2 ** (attributeTier - 1)));
    })
    value += attributeValue;
  
    return value;
}

/**
 * Adds enchantment value tag onto item over all items hovered over.
 * 
 * @param {string} lore - Item lore.
 * @param {Object} item - Item object.
 */
let NBTTagString = Java.type("net.minecraft.nbt.NBTTagString");
registerWhen(register("itemTooltip", (lore, item) => {
    // Check item data to cancel lore append.
    const loreTag = item.getNBT().getCompoundTag("tag").getCompoundTag("display").getTagMap().get("Lore");
    if (loreTag === null) return;
    const list = new NBTTagList(loreTag);
    for (let i = 0; i < list.getTagCount(); i++) {
        if (list.getStringTagAt(i).includes("Item Value:")) return;
    }

    // Add to item lore.
    const value = getItemValue(item);
    if (value !== 0)
        list.appendTag(new NBTTagString(`§5§lItem Value: §6${commafy(value)}`));
}), () => settings.itemPrice);
