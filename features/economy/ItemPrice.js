import settings from "../../settings";
import { AQUA, BOLD, DARK_AQUA, DARK_GRAY, DARK_GREEN, DARK_PURPLE, GOLD, GRAY, GREEN, LIGHT_PURPLE, RED, WHITE, YELLOW } from "../../utils/constants";
import { commafy, convertToTitleCase, formatNumber } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { data, registerWhen } from "../../utils/variables";
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

function getEnchantmentValue(enchantments, bazaar, type) {
    value = 0;
    Object.entries(enchantments ?? {}).forEach(([enchant, enchantlvl]) => {
        enchant = enchant.toUpperCase();
        const maxEnchantLevel = MAX_ENCHANTS[enchant];
        
        if (!ENCHANTS.has(enchant) || enchantlvl < maxEnchantLevel) return;

        const enchantName = enchant === "EFFICIENCY" ? "SIL_EX" : `ENCHANTMENT_${enchant}_${enchantlvl}`;
        const enchantKey = enchant === "EFFICIENCY" ? "SIL_EX" : `ENCHANTMENT_${enchant}_${maxEnchantLevel}`;
        const base = bazaar?.[enchantKey];
        let multiplier = enchant === "EFFICIENCY" ? enchantlvl - 5 : 1;
        multiplier = STACKING_ENCHANTS.has(enchant) ? multiplier : 2 ** (enchantlvl - maxEnchantLevel);
        value += Math.max(base?.[type] * multiplier, bazaar?.[enchantName]?.[type] ?? bazaar?.[enchantKey]?.[type] ?? 0);
    });
    return value;
}

/**
 * Variables used to represent item modifier data.
 */
const STAR_PLACEMENT = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH"];
const GEMSTONE_SLOTS = {
    "JADE": GREEN, "AMBER": GOLD, "TOPAZ": YELLOW, "SAPPHIRE": AQUA, "AMETHYST": DARK_PURPLE, "RUBY": RED, "JASPER": LIGHT_PURPLE, "OPAL": WHITE
};
const MULTIUSE_SLOTS = new Set(["COMBAT", "DEFENSIVE", "MINING", "UNIVERSAL"]);
const REFORGES = {
    "coldfused": "ENTROPY_SUPPRESSOR", "dirty": "DIRT_BOTTLE", "fabled": "DRAGON_CLAW", "gilded": "MIDAS_JEWEL", "suspicious": "SUSPICIOUS_VIAL",
    "aote_stone": "AOTE_STONE", "withered": "WITHER_BLOOD", "bulky": "BULKY_STONE", "jerry_stone": "JERRY_STONE",
    "fanged": "FULL_JAW_FANGING_KIT", "precise": "OPTICAL_LENS", "spiritual": "SPIRIT_STONE", "headstrong": "SALMON_OPAL", "candied": "CANDY_CORN",
    "submerged": "DEEP_SEA_ORB", "perfect": "DIAMOND_ATOM", "reinforced": "RARE_DIAMOND", "renowned": "DRAGON_HORN", "spike": "DRAGON_SCALE",
    "hyper": "END_STONE_GEODE", "giant": "GIANT_TOOTH", "jaded": "JADERALD", "cubic": "MOLTEN_CUBE", "necrotic": "NECROMANCER_BROOCH",
    "empowered": "SADAN_BROOCH", "ancient": "PRECURSOR_GEAR", "undead": "PREMIUM_FLESH", "loving": "RED_SCARF", "RIDICULOUS": "red_nose",
    "bustling": "SKYMART_BROCHURE", "mossy": "OVERGROWN_GRASS", "festive": "FROZEN_BUBBLE", "glistening": "SHINY_PRISM",
    "strengthened": "SEARING_STONE", "waxed": "BLAZE_WAX", "fortified": "METEOR_SHARD", "rooted": "BURROWING_SPORES",
    "blooming": "FLOWERING_BOUQUET", "snowy": "TERRY_SNOWGLOBE", "blood_soaked": "PRESUMED_GALLON_OF_RED_PAINT", "salty": "SALT_CUBE",
    "treacherous": "RUSTY_ANCHOR", "lucky": "LUCKY_DICE", "stiff": "HARDENED_WOOD", "chomp": "KUUDRA_MANDIBLE", "pitchin": "PITCHIN_KOI",
    "ambered": "AMBERED_MATERIAL", "auspicious": "ROCK_GEMSTONE", "fleet": "DIAMONITE", "heated": "HOT_STUFF", "magnetic": "LAPIS_CRYSTAL",
    "mithraic": "PURE_MITHRIL", "refined": "REFINED_AMBER", "stellar": "PETRIFIED_STARFALL", "fruitful": "ONYX", "moil": "MOIL_LOG",
    "toil": "TOIL_LOG", "blessed": "BLESSED_FRUIT", "earthy": "LARGE_WALNUT", "blessed": "BLESSED_FRUIT", "bountiful": "GOLDEN_BALL"
}

/**
 * Variables used to represent and display advanced item value.
 */
const valueExample =
`${GRAY}Base Item: ${GREEN}In
${GRAY}Reforge: ${GREEN}The
${GRAY}Stars: ${GREEN}Jungle,
${GRAY}Recomb: ${GREEN}The
${GRAY}Potato Books: ${GREEN}Might
${GRAY}Art of War: ${GREEN}Jungle.
${GRAY}Gemstones: ${GREEN}The
${GRAY}Enchants: ${GREEN}Lion
${GRAY}Rune: ${GREEN}Sleeps
${DARK_AQUA}Total: ${GREEN}Tonight`;
const valueOverlay = new Overlay("itemPrice", ["all", "misc"],
() => settings.itemPrice == 1 || settings.itemPrice == 3, data.EL, "moveValue", valueExample);

/**
 * Figures out the enchantment value of the given item.
 * 
 * @param {Object} item - Item Object.
 * @returns {number} - Total value of item.
 */
let savedValues = {}
export function getItemValue(item) {
    valueOverlay.message = "";
    if (item === null) return 0;

    const auction = getAuction();
    const bazaar = getBazaar();
    const itemTag = item.getNBT().getCompoundTag("tag").toObject();
    const itemData = itemTag.ExtraAttributes;
    const itemID = itemData?.id;
    const itemUUID = itemData?.uuid;
    const auctionItem = auction?.[itemID];
    let value = (auctionItem?.lbin ?? 0) * item.getStackSize();

    // Check for Pet or Bazaar
    if (value === 0) {
        if (itemID === "PET") {
            const petInfo = JSON.parse(itemData?.petInfo);
            value = auction?.[`${petInfo?.tier}_${petInfo?.type}`]?.lbin ?? 0;
        } else if (itemID === "ENCHANTED_BOOK") {
            value = getEnchantmentValue(itemData?.enchantments, bazaar);
        } else value = (bazaar?.[itemID]?.[0] ?? 0) * item.getStackSize();
        savedValues[itemUUID] = [value, ""];
        return value;
    }

    // Base Value
    valueMessage = `${DARK_AQUA}${BOLD}Item: ${itemTag.display.Name}\n`;
    valueMessage += `- ${AQUA}Base: ${GREEN}+${formatNumber(value)}\n`;
    // Reforge Value
    const reforgeValue = bazaar?.[REFORGES?.[itemData?.modifier]]?.[0] ?? 0;
    if (reforgeValue !== 0) {
        value += reforgeValue;
        valueMessage += `- ${AQUA}Reforge: ${GREEN}+${formatNumber(reforgeValue)}\n`;
    }
    // Master Star Values
    let starValue = 0;
    for (let i = 0; i < Math.max(itemData?.dungeon_item_level - 5, 0); i++) starValue += bazaar[`${STAR_PLACEMENT[i]}_MASTER_STAR`]?.[0];
    if (starValue !== 0) {
        value += reforgeValue;
        valueMessage += `- ${AQUA}Master Stars: ${GREEN}+${formatNumber(starValue)}\n`;
    }
    // Recomb Value
    const recombValue = itemData?.rarity_upgrades === undefined ? 0 : bazaar["RECOMBOBULATOR_3000"]?.[0];
    if (recombValue !== 0) {
        value += recombValue;
        valueMessage += `- ${AQUA}Recomb: ${GREEN}+${formatNumber(recombValue)}\n`;
    }
    // Rune Value
    if (itemData?.runes !== undefined) {
        const runes = itemData?.runes
        const [runeKey, runeLevel] = Object.entries(runes)[0];
        const runeValue = auction[`${runeKey}_${runeLevel}`]?.lbin ?? 0;
        if (runeValue !== 0) {
            valueMessage += `- ${AQUA}Rune: ${GREEN}+${formatNumber(runeValue)}\n`;
            value += runeValue
        }
    }
    
    // Potato Book Values
    const potatoCount = itemData?.hot_potato_count;
    const hotPotatoCount = potatoCount === undefined ? 0 : Math.min(potatoCount, 10);
    const hotPotatoValue = hotPotatoCount * bazaar["HOT_POTATO_BOOK"][0];
    if (hotPotatoValue !== 0) {
        valueMessage += `\n- ${GOLD}${BOLD}Books:\n`;
        valueMessage += `   - ${YELLOW}HPB (${hotPotatoCount}/10): ${GREEN}+${formatNumber(hotPotatoValue)}\n`;
        const fumingPotatoCount = Math.max(potatoCount - 10, 0);
        const fumingPotatoValue = fumingPotatoCount * bazaar["FUMING_POTATO_BOOK"][0];
        if (fumingPotatoValue !== 0)
        valueMessage += `   - ${YELLOW}FPB (${fumingPotatoCount}/5): ${GREEN}+${formatNumber(fumingPotatoValue)}\n`;
        value += hotPotatoValue + fumingPotatoValue;
    }
    // Art of War Value
    const tzuValue = itemData?.art_of_war_count === undefined ? 0 : bazaar["THE_ART_OF_WAR"]?.[0];
    if (tzuValue !== 0) {
        value += tzuValue;
        valueMessage += `   - ${YELLOW}Sun Tzu: ${GREEN}+${formatNumber(tzuValue)}\n`;
    }
    // Art of Peace Value
    const peaceValue = itemData?.artOfPeaceApplied === undefined ? 0 : bazaar["THE_ART_OF_PEACE"]?.[0];
    if (peaceValue !== 0) {
        value += peaceValue;
        valueMessage += `   - ${YELLOW}Moon Tzu: ${GREEN}+${formatNumber(peaceValue)}\n`;
    }
    
    // Gem Values
    const gemsKeys = Object.keys(itemData?.gems ?? {});
    const powerScroll = itemData?.power_ability_scroll;
    if (gemsKeys.length !== 0 || powerScroll) {
        valueMessage += `\n- ${GOLD}${BOLD}Gemstones:\n`;

        if (powerScroll) {
            const powerScrollValue = auction?.[powerScroll]?.lbin ?? 0;
            const scrollColor = GEMSTONE_SLOTS[powerScroll.split('_')[0]];
            valueMessage += `   - ${scrollColor}${convertToTitleCase(powerScroll)}: ${GREEN}+${formatNumber(powerScrollValue)}\n`;
            value += powerScrollValue;
        }
    }

    gemsKeys.forEach((gemstone) => {
        const gemstoneData = itemData.gems[gemstone];
        const gemstoneTier = gemstoneData?.quality ?? gemstoneData;
        const gemstoneType = gemstone.split('_');

        let gemstoneValue = 0;
        let gemstoneName = "";
        if (gemstoneType[0] in GEMSTONE_SLOTS) {
            gemstoneName = `${gemstoneTier}_${gemstoneType?.[0]}_GEM`;
            gemstoneColor = GEMSTONE_SLOTS[gemstoneType[0]];
            gemstoneValue = bazaar[gemstoneName]?.[0] ?? 0;
        } else if (MULTIUSE_SLOTS.has(gemstoneType?.[0]) && gemstoneType?.[gemstoneType.length - 1] !== "gem") {
            gemstoneName = `${gemstoneTier}_${itemData.gems?.[gemstone + "_gem"]}_GEM`;
            gemstoneColor = GEMSTONE_SLOTS[itemData.gems?.[gemstone + "_gem"]];
            gemstoneValue = bazaar[gemstoneName]?.[0] ?? 0;
        }
        
        if (gemstoneValue !== 0) {
            value += gemstoneValue;
            valueMessage += `   - ${gemstoneColor}${convertToTitleCase(gemstoneName)}: ${GREEN}+${formatNumber(gemstoneValue)}\n`;
        }
    });
    
    // Enchantment Values
    const enchantOrderValue = getEnchantmentValue(itemData?.enchantments, bazaar, 0);
    const enchantInstaValue = getEnchantmentValue(itemData?.enchantments, bazaar, 1);
    if (enchantOrderValue !== 0) {
        value += enchantOrderValue;
        valueMessage += `\n- ${GOLD}${BOLD}Enchantments:\n`;
        valueMessage += `   - ${DARK_GREEN}Buy Order Value: ${GREEN}+${formatNumber(enchantOrderValue)}\n`;
        valueMessage += `   - ${DARK_GREEN}Insta Buy Value: ${GREEN}+${formatNumber(enchantInstaValue)}\n`;
    }
  
    // Wither Impact Scroll Values
    const witherScrolls = itemData?.ability_scroll ?? [];
    if (witherScrolls.length !== 0) valueMessage += `\n- ${GOLD}${BOLD}Wither Scrolls:\n`;
    witherScrolls.forEach(scroll => {
        const scrollValue = bazaar[scroll][0];
        if (scrollValue !== 0) {
            valueMessage += `   - ${DARK_GRAY}${convertToTitleCase(scroll)}: ${GREEN}+${formatNumber(scrollValue)}\n`;
            value += scrollValue;
        }
    });

    // Attribute Values
    const attributes = Object.keys(itemData?.attributes ?? {}).sort();
    let attributesValue = 0;
    if (attributes.length) valueMessage += `\n- ${GOLD}${BOLD}Attributes:\n`;
    attributes.forEach((attribute) => {
        const attributeLevel = itemData?.attributes[attribute];
        const attributeCount = 2 ** (attributeLevel - 1);
        const attributeValue = (Math.min(auctionItem?.attributes?.[attribute] ?? 0,
            auction?.ATTRIBUTE_SHARD?.attributes?.[attribute] ?? 0)) * attributeCount;

        attributesValue += attributeValue;
        valueMessage += `   - ${RED}${convertToTitleCase(attribute)} ${attributeLevel}: ${GREEN}+${formatNumber(attributeValue)}\n`;
    });
    const comboValue = auctionItem?.attribute_combos?.[attributes.join(" ")] ?? 0;
    if (comboValue > attributesValue) {
        valueMessage = valueMessage.split('\n').slice(0, -3).join('\n') + `\n${RED}Go(o)d Roll: ${GREEN}+${formatNumber(comboValue)}\n`;
        attributesValue = comboValue;
    }
    value += attributesValue;

    // Total Value
    valueMessage += `\n${DARK_AQUA}Total Value: ${GREEN}${formatNumber(value)}`;
  
    savedValues[itemUUID] = [value, valueMessage];
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
    const itemTag = item.getNBT().getCompoundTag("tag");
    const loreTag = itemTag.getCompoundTag("display").getTagMap().get("Lore");
    const itemUUID = itemTag.getCompoundTag("ExtraAttributes").getString("uuid");
    if (loreTag === null) return;

    const list = new NBTTagList(loreTag);
    for (let i = 0; i < list.getTagCount(); i++) {
        if (list.getStringTagAt(i).includes("Item Value:")) {
            valueOverlay.message = savedValues?.[itemUUID]?.[1] ?? "";
            return;
        }
    }

    // Add to item lore.
    const value = savedValues?.[itemUUID]?.[0] ?? getItemValue(item, settings.itemPrice === 1 ?? settings.itemPrice === 3);
    valueOverlay.message = savedValues?.[itemUUID]?.[1] ?? "";
    if (value !== 0 && (settings.itemPrice === 2 || settings.itemPrice === 3))
        list.appendTag(new NBTTagString(`§3§lItem Value: §6${commafy(value)}`));
}), () => settings.itemPrice);
register("guiClosed", () => {
    valueOverlay.message = "";
})
