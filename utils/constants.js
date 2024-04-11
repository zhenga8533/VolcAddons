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

/**
 * Fairy Soul waypoints.
 */
export const FAIRY_SOULS = {
    "Hub": [
        [-20, 90, -12], [-60, 108, 3], [-50, 132, 32], [-56, 161, 43], [-39, 191, 34], [-3,193, 32], [2, 181, 31], [10, 179, 22], [-207, 100, 66], [-214, 103, 89], 
        [-252, 132, 51], [-261, 56, 115], [-229, 123, 84], [-191, 102, 109], [-245, 75, 149], [-259, 114, 85], [26, 80, -65], [40, 68, -65], [-34, 67, -150], [-21, 79, -166], 
        [-187, 92, -104], [-16, 66, -110], [23, 79, -134], [-262, 102, 67], [-260, 96, 48], [-233, 86, 84], [-48, 76, 49], [40, 108, 78], [49, 121, 69], [43, 152, 73], 
        [57, 90, 79], [110, 67, 58], [155, 62, 28], [132, 144, 114], [82, 61, 196], [113, 102, 106], [148, 112, 88], [149, 116, 115], [111, 120, 127], [96, 106, 121], 
        [86, 89, 66], [-195, 55, 153], [-152, 67, 123], [87, 77, 43], [44, 68, -34], [-53, 70, -100], [-6, 66, -179], [34, 72, -162], [-142, 77, -31], [-208, 70, -80], 
        [72, 71, -190], [-94, 72, -128], [9, 75, 13], [176, 64, 42], [154, 98, -71], [104, 77, -133], [-24, 88, -63], [-183, 80, 29], [-133, 74, 133], [48, 78, 81], 
        [43, 120, 70], [-81, 70, -88], [-49, 90, -72], [22, 132, 25], [-166, 79, 93], [-225, 72, -21], [-32, 71, 21], [180, 63, -15], [147, 53, 88], [168, 60, -36], 
        [162, 46, 69], [70, 90, -149], [138, 66, 129], [72, 70, -99], [169, 60, 129], [-248, 74, 125], [-33, 76, -213], [-92, 59, -138], [30.5, 80, -93.5]
    ], 
    "The Farming Islands": [
        [96, 96, -287], [182, 99, -235], [183, 99, -305], [126, 91, -304], [99, 112, -275], [143, 90, -243], [155, 23, -204], [111, 63, -447], [263, 177, -565], 
        [138, 72, -587], [273, 141, -467], [387, 78, -365], [261, 133, -348], [145, 77, -374], [254, 70, -493], [193, 66, -468], [279, 112, -541], [271, 56, -361], 
        [152, 67, -361],[150, 60, -448]
    ], 
    "Gold Mine": [
        [-11, 76, -395], [-19, 142, -364], [-37, 78, -308], [-62, 104, -289], [-26, 94, -340], [17, 86, -312], [21, 36, -320], [-23, 113, -353], [-44, 100, -344], 
        [-47, 75, -298], [-1, 80, -337], [19, 57, -341]
    ], 
    "Deep Caverns": [
        [22, 156, -42], [3, 152, 85], [71, 167, -12], [-2, 255, -1], [3, 182, 50], [9, 170, 44], [57, 161, 19], [-18, 163, 26], [29, 149, 14], [-35, 127, 28], [44, 98, 23], 
        [-11, 102, -16], [18, 74, 74], [0, 65, 57], [-40, 72, 0], [-8, 74, -44], [-60, 37, 52], [-21, 25, 72], [3, 14, 51], [-71, 13, 5], [-76, 13, 24]
    ], 
    "Dwarven Mines": [
        [-21, 208, -59], [-139, 220, -89], [-9, 230, -135], [155, 189, 123], [34, 102, 86], [133, 104, 104], [22, 127, 184], [-110, 142, 143], [-116, 142, 154], 
        [-204, 131, 199], [-53, 205, 50]
    ], 
    "Spider's Den": [
        [-422, 106, -206], [-336, 111, -253], [-222, 74, -361], [-147, 78, -299], [-169, 62, -289], [-185, 135, -290], [-322, 95, -281], [-294, 36, -274], [-160, 62, -275], 
        [-336, 82, -153], [-297, 90, -169], [-279, 127, -177], [-309, 63, -185], [-301, 92, -171], [-140, 85, -335], [-204, 94, -241], [-203, 169, -320], [-309, 66, -245], 
        [-198, 160, -331]
    ], 
    "Crimson Isle": [
        [-383, 71, -883][-690, 122, -752], [-606, 154, -800], [-343, 235, -780], [-31, 178, -907], [-352, 191, -553], [-480, 104, -593], [-346, 75, -552], [-342, 101, -484], 
        [-462, 78, -698], [-361, 69, -425], [-396, 108, -764], [-310, 156, -1008], [-445, 110, -1026], [-726, 144, -891], [-380, 141, -1020], [-79, 139, -779], [14, 108, -769], 
        [-106, 89, -883], [-247, 44, -512], [-361, 133, -469], [-721, 125, -811], [-500, 127, -795], [-717, 164, -981], [-412, 58, -935], [-297, 81, -835], [-35, 116, -1055], 
        [-479, 114, -972], [-644, 125, -689]
    ],
    "The End": [
        [-723, 75, -222], [-609, 84, -230], [-587, 48, -293], [-545, 92, -257], [-492, 81, -275], [-583, 208, -272], [-587, 122, -276], [-517, 100, -295], [-492, 21, -175], 
        [-657, 36, -201], [-696, 116, -256], [-748, 106, -284]
    ], 
    "The Park": [
        [-315, 89, -72], [-294, 85, 31], [-390, 61, -6], [-357, 99, 79], [-450, 113, -87], [-471, 132, -125], [-408, 122, -92], [-454, 120, -58], [-404, 136, 6], 
        [-386, 108, -69], [-370, 112, -118]
    ], 
    "Jerry's Workshop": [[-95, 77, 20], [74, 109, -18], [-44, 87, 76], [56, 108, 64], [-7, 108, 107]], 
    "Rift": [[253, 123, 90]], 
    "Dungeon Hub": [[17, 124, -58], [1, 137, 75], [-139, 46, -1], [14, 60, 99], [-4, 21, -17], [-55, 82, -10], [10, 164, -10]]
}

/**
 * Rift waypoints.
 */
export const ENIGMA_SOULS = [
    [-15, 91, 94], [-27, 71, 90], [-6, 60, 226], [-142, 68, 174], [-137, 51, 120], [-129, 72, 77], [-27, 89, 136], [-137, 133, 156], [-108, 117, 123], [-115, 69, 61], 
    [43, 91, 56], [-168, 81, 12], [-204, 75, 49], [-93, 73, 36], [-102, 72, -103], [-34, 71, -88], [-106, 78, -101], [-95, 76, -82], [-94, 70, -84], [-38, 44, 130],
    [-88, 79, -102], [-76, 90, -149], [-106, 249, -149], [-74, 65, -119], [-77, 72, -176], [-21, 72, -18], [-88, 20, 0], [27, 71, -77], [42, 88, -91], [47, 68, -59], 
    [-34, 66, -25], [-23, 84, -92], [40, 70, 27], [38, 63, -198], [3, 68, -204], [-161, 98, -72], [255, 74, 160], [262, 118, 94], [182, 92, 124], [266, 60, 145], 
    [232, 94, 168], [256, 130, 75]
];
export const CAT_SOULS = [[-93, 69, 112], [0, 56, 63], [-139, 45, 15], [-62, 88, -81], [-24, 72, -198], [38, 65, -118], [8, 72, -15], [22, 43, -220], [152, 80, -14]];
export const RIFT_NPCS = {
    "alabaster" : ["Alabaster", -130, 73, 167],
    "alatar" : ["Alatar", -47, 116, 71],
    "alchemist" : ["Alchemist", -50, 70, -66],
    "argofay bughunter" : ["Bughunter", -85, 108, 97],
    "bughunter" : ["Bughunter", -85, 108, 97],
    "argofay bugshopper" : ["Bugshopper", -95, 110, 95],
    "bugshopper" : ["Bugshopper", -95, 110, 95],
    "argofay serialbather" : ["Serialbather", -138, 119, 116],
    "serialbather" : ["Serialbather", -138, 119, 116],
    "argofay sonfather" : ["Sonfather", -96, 100, 156],
    "sonfather" : ["Sonfather", -96, 100, 156],
    "argofay threebrother" : [
        ["Onebrother", -99, 76, 154], ["Twobrother", -93, 76, 109], ["Threebrother", -136, 75, 113]],
    "threebrother" : [
        ["Onebrother", -99, 76, 154], ["Twobrother", -93, 76, 109], ["Threebrother", -136, 75, 113]],
    "argofay trafficker" : [
        ["Cap Trafficker", -151, 112, 115], ["Top Trafficker", -138, 97, 113], ["Leggings Trafficker", -92, 90, 107], ["Boots Trafficker", -136, 88, 114]],
    "trafficker" : [
        ["Cap Trafficker", -151, 112, 115], ["Top Trafficker", -138, 97, 113], ["Leggings Trafficker", -92, 90, 107], ["Boots Trafficker", -136, 88, 114]],
    "argofay trailblazer" : ["Argofay Trailblazer", -98, 66, 148],
    "trailblazer" : ["Argofay Trailblazer", -98, 66, 148],
    "argofay tencounter" : ["Argofay Tencounter", -93, 99, 95],
    "tencounter" : ["Argofay Tencounter", -93, 99, 95],
    "arora" : ["Arora", -129, 73, 169],
    "ashera" : ["Ashera", -124, 73, 173],
    "barry" : ["Barry", -45, 54, -143],
    "blacksmith" : ["Blacksmith", -2, 68, -142],
    "cashier" : ["Cashier", 12, 58, -78],
    "chef" : ["Chef", -103, 72, -104],
    "chester" : ["Chester", -131, 73, 173],
    "chicken" : [
        ["Chicken 1", -54, 72, -158], ["Chicken 2", -57, 72, 161]],
    "cosmo" : ["Cosmo", -67, 70, -92],
    "cow" : [
        ["Cow 1", -43, 72, -167], ["Cow 2", -38, 72, -164]],
    "cowboy nick" : ["Cowboy Nick", -13, 70, -7],
    "creed" : ["Creed", -15, 73, -112],
    "cryptosis" : ["Cryptosis", 28, 71, -77],
    "dackinoru" : ["Dackinoru", -118, 73, 173],
    "damia" : ["Damia", 31, 72, -95],
    "deer" : ["Deer", 139, 70, -12],
    "detective amog" : [
        ["Amogus 1", -50, 68, -37], ["Amogus 2", 1, 71, -13], ["Amogus 3", -188, 71, -57], ["Amogus 4", 2, 68, -140], ["Amogus 5", -50, 68, -39],
        ["Amogus 6", -29, 64, -41], ["Amogus 7", -53, 68, -49], ["Amogus 8", -51, 68, -41]],
    "disinfestor" : [
        ["Disinfestor 1", -38, 71, -103], ["Disinfestor 2", -40, 70, -88], ["Disinfestor 3", -38, 77, -94], ["Disinfestor 4", -33, 77, -89]],
    "dr emmett" : ["Dr. Emmett", 0, 0, 0],
    "dr. emmett" : ["Dr. Emmett", 0, 0, 0],
    "dr hibble" : ["Dr. Hibble", -80, 73, 10],
    "dr. hibble" : ["Dr. Hibble", -80, 73, 10],
    "dr edwin" : ["Dr. Edwin", -80, 73, 10],
    "dr. edwin" : ["Dr. Edwin", -80, 73, 10],
    "dr phear" : ["Dr. Phear", -146, 36, 28],
    "dr. phear" : ["Dr. Phear", -146, 36, 28],
    "dust" : ["Dust", -12, 71, -100],
    "elise" : [
        ["Elise (Wizard Tower)", -51, 122, 70], ["Elise (Rift Gallery)", 10, 55, 76]],
    "fafnir" : ["Fafnir", -128, 73, 173],
    "fairylosopher" : [
        ["Fairylosopher 1", 262, 106, 76], ["Fairylosopher 2", 256, 130, 75], ["Fairylosopher 3", 256, 123, 84], ["Fairylosopher 4", 256, 123, 87],
        ["Fairylosopher 5", 253, 123, 90], ["Fairylosopher 6", 250, 123, 88], ["Fairylosopher 7", 250, 123, 85]],
    "frankie" : ["Frankie", -4, 73, -111],
    "game agent" : ["Game Agent", 12, 58, -64],
    "garlacius" : ["Garlacius", -129, 79, 171],
    "grandma" : ["Grandma", -71, 65, -60],
    "gunther" : ["Gunther", -69, 71, -62],
    "harriette" : ["Harriette", -2, 74, -109],
    "hound" : ["Hound", -70, 66, 148],
    "inverted sirius" : ["Inverted Sirius", -97, 75, 191],
    "sirius" : ["Inverted Sirius", -97, 75, 191],
    "jacquelle" : ["Jacquelle", -122, 120, 137],
    "jerry" : ["Jerry", -86, 20, 5],
    "joey mcpizza" : ["Joey McPizza", -106, 72, -103],
    "joliet" : ["Joliet", -32, 65, -43],
    "kat" : ["Kat", -35, 70, -91],
    "kay" : ["Kay", -191, 68, 59],
    "kiermet" : ["Kiermet", -135, 67, 158],
    "lazarus" : ["Lazarus", -128, 79, 166],
    "maddox the slayer" : ["Maddox the Slayer", 205, 77, 45],
    "maddox" : ["Maddox the Slayer", 205, 77, 45],
    "marcia" : ["Marcia", 3, 71, -11],
    "master tactician fink" : ["Master Tactician Fink", -192, 72, -57],
    "fink" : ["Master Tactician Fink", -192, 72, -57],
    "mole" : ["Mole", -160, 97, -76],
    "motes grubber" : [
        ["Motes Grubber (Wyld Woods)", -93, 65, 157], ["Motes Grubber (West Village)", -93, 71, -73]],
    "mushroom guy" : ["Mushroom Guy", -178, 75, 13],
    "nene" : ["Nene", 24, 89, -91],
    "phaser" : ["Phaser", 60, 70, -89],
    "plumber joe" : ["Plumber Joe", -62, 70, -78],
    "porhtal" : ["Porhtal", -158, 71, 162],
    "ramero" : ["Ramero", -49, 68, -39],
    "reed" : ["Reed", -212, 72, 61],
    "ribbit" : ["Ribbit", -137, 67, 159],
    "rock" : [
        ["Rock 1", 14, 49, -187], ["Rock 2", -16, 46, -175], ["Rock 3", -25, 47, -204], ["Rock 4", 20, 45, -222], ["Rock 5", 56, 45, -200],
        ["Rock 6", 56, 45, -199], ["Rock 7", 46, 47, -181], ["Rock 8", 28, 49, -192]],
    "roger" : ["Roger", -3, 70, -44],
    "roy" : ["Roy", -205, 75, 49],
    "seraphine" : ["Seraphine", -17, 71, -101],
    "seskel" : ["Seskel", -129, 73, 164],
    "seymour" : ["Seymour", -27, 71, -45],
    "shania" : ["Shania", -48, 72, -161],
    "sheep" : [
        ["Sheep 1", -59, 72, -167], ["Sheep 2", -55, 73, -167], ["Sheep 3", -55, 73, -167]],
    "shifted" : ["Shifted", -121, 73, 175],
    "sick farmer" : ["Sick Farmer", -43, 72, -160],
    "skylark" : ["Skylark", -72, 71, -115],
    "soma" : ["Soma", -17, 74, -108],
    "sorcerer okron" : ["Sorcerer Okron", -71, 81, -111],
    "okron" : ["Sorcerer Okron", -71, 81, -111],
    "stain" : ["Stain", -7, 74, -100],
    "taylor" : ["Taylor", -29, 64, -45],
    "tel kar" : ["Tel Kar", -113, 69, 62],
    "tybalt" : ["Tybalt", -129, 79, 169],
    "unbound explorer" : ["Unbound Explorer", -29, 72, 316],
    "unhinged kloon" : ["Unhinged Kloon", -57, 79, -14],
    "minikloon" : ["Unhinged Kloon", -57, 79, -14],
    "violetta" : ["Violetta", -4, 73, -105],
    "vreike" : ["Vreike", -124, 73, 173],
    "wizard" : ["Wizard", -48, 123, 78],
    "wizardman" : ["Wizardman", -45, 90, 70],
    "yoshua" : ["Yoshua", -69, 71, -118],
}
export const RIFT_ZONES = {
    "wizard tower" : ["Wizard Tower", -48, 122, 73],
    "wyld woods" : ["Wyld Woods", -80, 67, 132],
    "enigmas crib" : ["Enigma's Crib", -40, 71, 96],
    "broken cage" : ["Broken Cage", -153, 70, 163],
    "shifted tavern" : ["Shifted Tavern", -124, 73,171 ],
    "pumpgrotto" : ["Pumpgrotto", 0, 0, 0],
    "the bastion" : ["The Bastion", -19, 92, 84],
    "otherside" : ["Otherside", 0, 0, 0],
    "black lagoon" : ["Black Lagoon", 0, 0, 0],
    "lagoon cave" : ["Lagoon Cave", 0, 0, 0],
    "lagoon hut" : ["Lagoon Hut", -195, 68, 59],
    "leeches lair" : ["Leeche's Lair", 150, 36, 28],
    "around colosseum" : ["Around Colosseum", -190, 71, -53],
    "rift gallery entrance" : ["Rift Gallery Entrance", 87, 70, 72],
    "rift gallery" : ["Rift Gallery", 14, 55, 80],
    "west village" : ["West Village", -80, 70, -40],
    "dolphin trainer" : ["Dolphin Trainer", -67, 52, -96],
    "cake house" : ["Cake House", -91, 70, -83],
    "infested house" : ["Infested House", 38, 70, -91],
    "mirrorverse" : ["Mirrorverse", -82, 64, -118],
    "dreadfarm" : ["Dreadfarm", -82, 64, -118],
    "great beanstalk" : ["Great Beanstalk", -96, 72, -149],
    "village plaza" : ["Village Plaza", -2, 70, -50],
    "taylors" : ["Taylor's", -31, 71, -40],
    "lonely terrace" : ["Lonely Terrace", -39, 68, -31],
    "murder house" : ["Murder House", -50, 68, -40],
    "book in a book" : ["Book in a Book", 2, 62, -13],
    "half-eaten cave" : ["Half-eaten Cave", -9, 69, 4],
    "your island" : ["\"Your\" Island", -92, 20, -32],
    "barter bank show" : ["Barter Bank Show", 9, 58, -71],
    "barry center" : ["Barry Center", 9, 71, -100],
    "barry hq" : ["Barry HQ", 38, 54, -142],
    "deja vu alley" : ["Deja Vu Alley", 9, 70, -96],
    "living cave" : ["Living Cave", 15, 71, -158],
    "living stillness" : ["Living Stillness", 15, 71, -158],
    "colosseum" : ["Colosseum", -190, 71, -53],
    "barrier street" : ["Barrier Street", 31, 72, -90],
    "photon pathway" : ["Photon Pathway", 56, 70, -89],
    "stillgore chateau" : ["Stillgore Chateau", 197, 76, 42],
    "oubliette" : ["Oubliette", 217, 81, 128],
    "fairylosopher tower" : ["Fairylosopher Tower", 252, 106, 78],
}
