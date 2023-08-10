import settings from "../../settings";
import { commafy } from "../../utils/functions";
import { registerWhen } from "../../utils/variables";
import { getAuction, getBazaar } from "./Economy";


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

function getEnchantmentValue(enchantments, bazaar) {
    value = 0;
    Object.entries(enchantments || {}).forEach(([enchant, enchantlvl]) => {
        enchant = enchant.toUpperCase();
        const maxEnchantLevel = MAX_ENCHANTS[enchant];
        
        if (ENCHANTS.has(enchant) && enchantlvl >= maxEnchantLevel) {
            const enchantName = enchant === "EFFICIENCY" ? "SIL_EX" : `ENCHANTMENT_${enchant}_${enchantlvl}`;
            const enchantKey = enchant === "EFFICIENCY" ? "SIL_EX" : `ENCHANTMENT_${enchant}_${maxEnchantLevel}`;
            const base = bazaar?.[enchantKey];
            let multiplier = enchant === "EFFICIENCY" ? enchantlvl - 5 : 1;
            multiplier = STACKING_ENCHANTS.has(enchant) ? multiplier : 2 ** (enchantlvl - maxEnchantLevel);
            value += Math.max(base?.[0] * multiplier, bazaar?.[enchantName]?.[0]);
        }
    });
    return value;
}

/**
 * Variables used to represent item modifier data.
 */
const STAR_PLACEMENT = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH"];
const GEMSTONE_SLOTS = new Set(["JADE", "AMBER", "TOPAZ", "SAPPHIRE", "AMETHYST", "RUBY", "JASPER", "OPAL"]);
const MULTIUSE_SLOTS = new Set(["COMBAT", "DEFENSIVE", "MINING", "UNIVERSAL"]);

/**
 * Figures out the enchantment value of the given item.
 * 
 * @param {Object} item - Item Object.
 * @returns {number} - Total value of item.
 */
export function getItemValue(item) {
    if (item === null) return 0;

    const auction = getAuction();
    const bazaar = getBazaar();
    const itemData = item.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").toObject();
    const itemID = itemData?.id
    const auctionItem = auction?.[itemID];
    let value = auctionItem?.lbin || 0;

    // Check for Pet or Bazaar
    if (value === 0) {
        if (itemID === "PET") {
            const petInfo = JSON.parse(itemData?.petInfo);
            value = auction?.[`${petInfo?.tier}_${petInfo?.type}`]?.lbin || 0;
        } else if (itemID === "ENCHANTED_BOOK") {
            value = getEnchantmentValue(itemData?.enchantments, bazaar);
        } else value = bazaar?.[itemID]?.[0] || 0;
        return value;
    }
    
    // Enchantment Values
    value += getEnchantmentValue(itemData?.enchantments, bazaar);

    // Recomb Value
    value += itemData?.rarity_upgrades === undefined ? 0 : bazaar["RECOMBOBULATOR_3000"]?.[0];

    // Rune Value
    if (itemData?.runes !== undefined) {
        const runes = itemData?.runes
        const [runeKey, runeValue] = Object.entries(runes)[0];
        value += auction[`${runeKey}_${runeValue}`]?.lbin || 0;
    }
  
    // Potato Book Values
    const hotPotatoCount = itemData?.hot_potato_count;
    value += (hotPotatoCount === undefined ? 0 : Math.min(hotPotatoCount, 10) * bazaar["HOT_POTATO_BOOK"][0]) +
        (hotPotatoCount === undefined ? 0 : Math.max(hotPotatoCount - 10, 0) * bazaar["FUMING_POTATO_BOOK"][0]);
    
    // Art of War Value
    value += itemData?.art_of_war_count === undefined ? 0 : bazaar["THE_ART_OF_WAR"]?.[0];
  
    // Master Star Values
    const upgradeLevel = itemData?.upgrade_level;
    const stars = Math.max(upgradeLevel - 5, 0);
    for (let i = 0; i < stars; i++) {
        value += bazaar[`${STAR_PLACEMENT[i]}_MASTER_STAR`]?.[0];
    }
  
    // Wither Impact Scroll Values
    (itemData?.ability_scroll || []).forEach(scroll => {
        value += bazaar[scroll][0];
    });

    // Gem Values
    const gemsKeys = Object.keys(itemData?.gems || {});
    gemsKeys.forEach((gemstone) => {
        const gemstoneData = itemData.gems[gemstone];
        const gemstoneTier = gemstoneData?.quality || gemstoneData;
        const gemstoneType = gemstone.split('_');

        let gemstoneValue = 0;
        if (GEMSTONE_SLOTS.has(gemstoneType[0]))
            gemstoneValue = bazaar[`${gemstoneTier}_${gemstoneType?.[0]}_GEM`]?.[0] || 0;
        else if (MULTIUSE_SLOTS.has(gemstoneType?.[0]) && gemstoneType?.[gemstoneType.length - 1] !== "gem")
            gemstoneValue = bazaar[`${gemstoneTier}_${itemData.gems?.[gemstone + "_gem"]}_GEM`]?.[0] || 0;
        value += gemstoneValue;
    });

    // Attribute Values
    const attributes = Object.keys(itemData?.attributes || {}).sort();
    let attributeValue = 0;
    attributes.forEach((attribute) => {
        const attributeCount = 2 ** (itemData?.attributes[attribute] - 1);
        attributeValue += (auctionItem?.attributes?.[attribute] || 0) * attributeCount;
    });
    attributeValue = Math.max(attributeValue, auctionItem?.attribute_combos?.[attributes.join(" ")] || 0);
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
        list.appendTag(new NBTTagString(`§3§lItem Value: §6${commafy(value)}`));
}), () => settings.itemPrice);
