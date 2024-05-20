/**
 * Color codes.
 */
export const BLACK = '§0';
export const DARK_BLUE = '§1';
export const DARK_GREEN = '§2';
export const DARK_AQUA = '§3';
export const DARK_RED = '§4';
export const DARK_PURPLE = '§5';
export const GOLD = '§6';
export const GRAY = '§7';
export const DARK_GRAY = '§8';
export const BLUE = '§9';
export const GREEN = '§a';
export const AQUA = '§b';
export const RED = '§c';
export const LIGHT_PURPLE = '§d';
export const YELLOW = '§e';
export const WHITE = '§f';

export const COLOR_TABLE = {
    '§0': Renderer.color(0, 0, 0, 200),
    '§1': Renderer.color(0, 0, 139, 200),
    '§2': Renderer.color(1, 50, 32, 200),
    '§3': Renderer.color(2, 41, 42, 200),
    '§4': Renderer.color(116, 57, 84, 200),
    '§5': Renderer.color(108, 57, 142, 200),
    '§6': Renderer.color(148, 122, 84, 200),
    '§7': Renderer.color(128, 128, 128, 200),
    '§8': Renderer.color(169, 169, 169, 200),
    '§9': Renderer.color(83, 89, 181, 200),
    '§a': Renderer.color(80, 145, 113, 200),
    '§b': Renderer.color(83, 154, 181, 200),
    '§c': Renderer.color(148, 89, 117, 200),
    '§d': Renderer.color(148, 89, 181, 200),
    '§e': Renderer.color(255, 255, 0, 200),
    '§f': Renderer.color(148, 154, 181, 200),
}

/**
 * Formatting codes.
 */
export const OBFUSCATED = '§k';
export const BOLD = '§l';
export const STRIKETHROUGH = '§m';
export const UNDERLINE = '§n';
export const ITALIC = '§o';
export const RESET = '§r';

/**
 * Sounds.
 */
export const AMOGUS = new Sound({source: "amogus.ogg"});
export const MUSIC = new Sound({source: "music.ogg"});

/**
 * Minecraft Class Constants
 */
export let SMA = Java.type("net.minecraft.entity.SharedMonsterAttributes");
export let NBTTagString = Java.type("net.minecraft.nbt.NBTTagString");
export const EntityWither = Java.type("net.minecraft.entity.boss.EntityWither");
export const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand");
export const PLAYER_CLASS = Java.type("net.minecraft.client.entity.EntityOtherPlayerMP").class;
export const WOLF_CLASS = Java.type("net.minecraft.entity.passive.EntityWolf").class;
export const GIANT_CLASS = Java.type("net.minecraft.entity.monster.EntityGiantZombie").class;
export const ZOMBIE_CLASS = Java.type("net.minecraft.entity.monster.EntityZombie").class;
export const SPIDER_CLASS = Java.type("net.minecraft.entity.monster.EntitySpider").class;
export const ENDERMAN_CLASS = Java.type("net.minecraft.entity.monster.EntityEnderman").class;
export const BLAZE_CLASS = Java.type("net.minecraft.entity.monster.EntityBlaze").class;
export const GOLEM_CLASS = Java.type("net.minecraft.entity.monster.EntityIronGolem").class;
export const GUARDIAN_CLASS = Java.type("net.minecraft.entity.monster.EntityGuardian").class;
export const GHAST_CLASS = Java.type("net.minecraft.entity.monster.EntityGhast").class;
export const CUBE_CLASS = Java.type("net.minecraft.entity.monster.EntityMagmaCube").class;
export const CHEST_CLASS = Java.type("net.minecraft.tileentity.TileEntityChest").class;
export const STAND_CLASS = EntityArmorStand.class;
export const WITHER_CLASS = EntityWither.class;

export const InventoryBasic = Java.type("net.minecraft.inventory.InventoryBasic");
export const GuiInventory = Java.type("net.minecraft.client.gui.inventory.GuiInventory")
export const GuiChest = Java.type("net.minecraft.client.gui.inventory.GuiChest");
export const GuiTextField = Java.type("net.minecraft.client.gui.GuiTextField");

/**
 * Java Class Constants
 */
export const Toolkit = Java.type("java.awt.Toolkit");
export const DataFlavor = Java.type("java.awt.datatransfer.DataFlavor");

/**
 * VolcAddons setting constants.
 */
export const HEADER = 
`
${GOLD + BOLD}VolcAddons ${JSON.parse(FileLib.read("VolcAddons", "metadata.json")).version}
${WHITE}Made By Volcaronitee
`;
export const LOGO = `${GRAY}[${GOLD}VolcAddons${GRAY}] `;
export const CONTRACT =
`VolcAddons Module User Agreement & Terms of Service

This Agreement ("Agreement") is entered into between VolcAddons and user, collectively referred to as the "Parties," with respect to the use of the Minecraft modification created by The Pirate King.

1. License Grant

1.1 Mod Creator hereby grants User a non-exclusive, non-transferable license to use the Mod in accordance with the terms and conditions of this Agreement.

2. Acceptable Use

2.1 User agrees to use the Mod solely for personal, non-commercial purposes and in compliance with the rules and policies set forth by Minecraft and its developer, Mojang AB as well any involved servers, i.e. Hypixel.

2.2 User acknowledges that the Mod is provided "as-is" and that Mod Creator does not provide any warranties or guarantees regarding the performance, functionality, or compatibility of the Mod.

2.3 User acknowledges that the Mod Creator holds no responsibility in any punishments that may result from use of the Mod.

3. Restrictions

3.1 User agrees not to reverse engineer, decompile, or modify the Mod in any way that may violate applicable laws or regulations.

3.2 User shall not distribute, sell, or transfer the Mod to any third party without the express written consent of Mod Creator.

4. Support and Updates

4.1 Mod Creator may, at their sole discretion, provide support or updates for the Mod.

5. Termination

5.1 Mod Creator reserves the right to terminate this Agreement and revoke the license granted herein if User violates any of the terms and conditions set forth in this Agreement.

6. Governing Law

6.1 This Agreement shall be governed by and construed in accordance with the laws of the "Code of Hammurabi".

7. Entire Agreement

7.1 This Agreement constitutes the entire agreement between the Parties regarding the use of the Mod and supersedes all prior agreements and understandings, whether oral or written.

8. Contact Information

8.1 For questions or concerns regarding this Agreement, please contact Mod Creator at "grapefruited" on Discord.

IN WITNESS WHEREOF, the Parties hereto have executed this Agreement as of the date first above written.

Mod Creator:

VolcAddons
Volcaronitee

User (Enter IGN below):

_____________*

*The Parties agree that digital signatures and electronic acceptance of this Agreement shall have the same legal force and effect as traditional, ink-on-paper signatures.`;

/**
 * Button presets. compact this please
 */
export const BUTTON_PRESETS = {
    "inv": {
        "inv13": ["inv1", 3, "auction", "golden_horse_armor"],
        "inv40": ["inv4", 0, "sacks", "chest"],
        "inv41": ["inv4", 1, "fishingbag", "fish"],
        "inv42": ["inv4", 2, "potionbag", "potion"],
        "inv43": ["inv4", 3, "quiver", "arrow"],
        "inv44": ["inv4", 4, "accessorybag", "redstone_block"],
        "inv14": ["inv1", 4, "bazaar", "gold_ingot"],
        "inv10": ["inv1", 0, "hex", "book"],
        "inv12": ["inv1", 2, "anvil", "anvil"],
        "inv11": ["inv1", 1, "et", "enchanting_table"]
    }
}

/**
 * Reforge names and categories.
 */
export const REFORGES = {
    "weapon": new Set([
        "Epic", "Fair", "Fast", "Gentle", "Heroic", "Legendary", "odd", "Sharp", "Spicy", "Coldfused", "Dirty", "Fabled", "Gilded", "Suspicious",
        "Warped", "Withered", "Bulky", "Fanged",
        "Awkward", "Deadly", "Fine", "Grand", "Hasty", "Neat", "Rapid", "Rich", "Unreal", "Precise", "Spiritual", "Headstrong",
        "Great", "Rugged", "Lush", "Lumberjacks", "Double-Bit", "Moil", "Toil", "Blessed", "Earthy"
    ]),
    "armor": new Set([
        "Clean", "Fierce", "Heavy", "Light", "Mythic", "Pure", "Titanic", "Smart", "Wise", "Candied", "Submerged", "Perfect", "Reinforced",
        "Renowned", "Spiked", "Hyper", "Giant", "Jaded", "Cubic", "Necrotic", "Empowered", "Ancient", "Undead", "Loving", "Ridiculous",
        "Bustling", "Mossy", "Festive",
        "Very", "Highly", "Extremely", "Not so", "Thicc", "Absolutely", "Even More"
    ]),
    "misc": new Set([
        "Glistening", "Strengthened", "Waxed", "Fortified", "Rooted", "Blooming", "Snowy", "Blood-Soaked",
        "Salty", "Treacherous", "Lucky", "Stiff", "Dirty", "Chomp", "Pitchin",
        "Ambered", "Auspicious", "Fleet", "Heated", "Magnetic", "Mithraic", "Refined", "Stellar", "Fruitful",
        "Robust", "Zooming", "Peasants", "Green Thumb", "Blessed", "Bountiful",
        "Lvl"
    ])
};

export const CAT_SOULS = [[-93, 69, 112], [0, 56, 63], [-139, 45, 15], [-62, 88, -81], [-24, 72, -198], [38, 65, -118], [8, 72, -15], [22, 43, -220], [152, 80, -14]];
