import { getBazaar } from "../../utils/bazaar";


/**
 * Variables used to represent item enchantment data.
 * "ENCHANTMENT_NAME": [max tier, max tier if uncraftable else low tier]
 */
const MAX_ENCHANTS = {
    // Weapon Enchantments
    "BANE_OF_ARTHROPODS": [7, 7],
    // "CHAMPION": [],
    "CLEAVE": [6, 6],
    "CRITICAL": [7, 7],
    "CUBISM": [6, 6],
    "DIVINE_GIFT": [3, 1],
    "DRAGON_HUNTER": [5, 1],
    "ENDER_SLAYER": [7, 7],
    "EXECUTE": [6, 6],
    "EXPERIENCE": [5, 5],
    "FIRE_ASPECT": [3, 3],
    "FIRST_STRIKE": [5, 5],
    "GIANT_KILLER": [7, 7],
    "LETHALITY": [6, 6],
    "LIFE_STEAL": [5, 5],
    "LOOTING": [5, 5],
    "LUCK": [7, 7],
    "MANA_STEAL": [3, 1],
    "PROSECUTE": [6, 6],
    "SCAVENGER": [5, 5],
    "SHARPNESS": [7, 7],
    "SMITE": [7, 7],
    "SMOLDERING": [5, 1],
    "SYPHON": [5, 5],
    "TABASCO": [3, 3],
    "THUNDERBOLT": [6, 6],
    "TITAN_KILLER": [7, 7],
    "TRIPLE_STRIKE": [5, 5],
    "VAMPIRISM": [6, 6],
    "VENOMOUS": [6, 6],
    "VICIOUS": [5, 5],
    "CHIMERA": [5, 1],
    "COMBO": [5, 1],
    "FATAL_TEMPO": [5, 1],
    "INFERNO": [5, 1],
    "ONE_FOR_ALL": [1, 1],
    "SOUL_EATER": [5, 1],
    "SWARM": [5, 1],
    "ULTIMATE_JERRY": [5, 1],
    "ULTIMATE_WISE": [5, 1],
    "CHANCE": [5, 5],
    "INFINITE_QUIVER": [10, 6],
    "OVERLOAD": [5, 1],
    "POWER": [7, 7],
    "SNIPE": [4, 4],
    "DUPLEX": [5, 1],
    "REND": [5, 1],
    // Armor Enchantments
    "BIG_BRAIN": [5, 3],
    "TRANSYLVANIAN": [5, 4],
    "BLAST_PROTECTION": [7, 7],
    "FEROCIOUS_MANA": [10, 1],
    "FIRE_PROTECTION": [7, 7],
    "GROWTH": [7, 7],
    "HARDENED_MANA": [10, 1],
    // "HECATOMB": [],
    "MANA_VAMPIRE": [10, 1],
    "PROJECTILE_PROTECTION": [10, 1],
    "PROTECTION": [7, 7],
    "REJUVENATE": [5, 1],
    "RESPITE": [5, 1],
    "STRONG_MANA": [10, 1],
    "BANK": [5, 1],
    "HABANERO_TACTICS": [5, 1],
    "LAST_STAND": [5, 1],
    "LEGION": [5, 1],
    "NO_PAIN_NO_GAIN": [5, 1],
    "WISDOM": [5, 1],
    "REFLECTION": [5, 1],
    "COUNTER_STRIKE": [5, 5],
    "TRUE_PROTECION": [1, 1],
    "SMARTY_PANTS": [5, 1],
    "FEATHER_FALLING": [10, 6],
    "SUGAR_RUSH": [3, 1],
    // Tool Enchantments
    // "COMPACT": [, ],
    // "EFFICIENCY": [, ],
    "FORTUNE": [4, 4],
    "PRISTINE": [5, 1],
    // "CULTIVATING": [, ],
    "DEDICATION": [4, 4],
    "DELICATE": [5, 5],
    "HARVESTING": [6, 6],
    "REPLENISH": [1, 1],
    "TURBO_CACTI": [5, 1],
    "TURBO_CANE": [5, 1],
    "TURBO_CARROT": [5, 1],
    "TURBO_MUSHROOMS": [5, 1],
    "TURBO_POTATO": [5, 1],
    "TURBO_WARTS": [5, 1],
    "TURBO_WHEAT": [5, 1],
    "SUNDER": [5, 1],
    "TURBO_COCOA": [5, 1],
    "TURBO_MELON": [5, 1],
    "TURBO_PUMPKIN": [5, 1],
    "EXPERTISE": [],
    "BOBBIN_TIME": [5, 1],
    "FLASH": [5, 1],
    // Equipment Enchantments
    "CAYENNE": [5, 1],
    "GREEN_THUMB": [5, 1],
    "PROSPERITY": [5, 1],
    "QUANTUM": [5, 3],
    "THE_ONE": [5, 4],
};

const items = Object.keys(MAX_ENCHANTS).reduce((acc, key) => {
    acc[`ENCHANTMENT_${key}_${MAX_ENCHANTS[key][1]}`] = [0, 0];
    return acc;
}, {});
getBazaar(items);

/**
 * Tracks Book of Stats and Champion to detect when Wither Impact stops giving xp.
 * Announces a title whenever it does fail.
 */
register("command", () => {
    
}).setName("vaitem");
