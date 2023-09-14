import request from "../../../requestV2";
import { AQUA, BLUE, DARK_AQUA, DARK_GRAY, DARK_PURPLE, GOLD, GRAY, GREEN, LIGHT_PURPLE, WHITE } from "../../utils/constants";
import { convertToTitleCase } from "../../utils/functions";
import { Overlay } from "../../utils/overlay";
import { getPlayerUUID } from "../../utils/player";
import settings from "../../utils/settings";
import { data } from "../../utils/variables";


/**
 * Variables used to track and display trophy fishes.
 */
const trophyExample =
`&6Trophy Fishing:
&fBlobfish&f: &323477 &816649 &76249 &6518 &b61
&fGusher&f: &39627 &86838 &72556 &6210 &b23
&9Lava Horse&f: &36831 &84939 &71733 &6143 &b16
&9Mana Ray&f: &31487 &81076 &7380 &630 &b1
&fObfuscated Fish 1&f: &31423 &81056 &7339 &625 &b3
&aSlugfish&f: &31000 &8716 &7260 &623 &b1
&9Vanille&f: &31000 &8734 &7244 &621 &b1
&5Karate Fish&f: &3974 &8697 &7259 &617 &b1
&9Obfuscated Fish 3&f: &3961 &8681 &7257 &622 &b1
&aObfuscated Fish 2&f: &3846 &8588 &7243 &612 &b3
&5Skeleton Fish&f: &3717 &8520 &7173 &623 &b1
&9Volcanic Stonefish&f: &3451 &8316 &7122 &612 &b1
&fSulphur Skitter&f: &3446 &8326 &7109 &610 &b1
&6Golden Fish&f: &3437 &8298 &7127 &611 &b1
&aFlyfish&f: &3214 &8144 &766 &63 &b1
&fSteaming Hot Flounder&f: &3111 &879 &730 &61 &b1
&5Soul Fish&f: &373 &850 &720 &61 &b2
&5Moldfin&f: &360 &837 &721 &61 &b1`;
const trophyOverlay = new Overlay("trophyCounter", ["Crimson Isle"], () => true, data.FL, "moveTrophy", trophyExample);
trophyOverlay.message = `${GOLD}Trophy Fishing:\n`;

const trophyColors = {
    blobfish: WHITE,
    gusher: WHITE,
    skeleton_fish: DARK_PURPLE,
    lava_horse: BLUE,
    golden_fish: GOLD,
    mana_ray: BLUE,
    flyfish: GREEN,
    obfuscated_fish_1: WHITE,
    obfuscated_fish_2: GREEN,
    volcanic_stonefish: BLUE,
    steaming_hot_flounder: WHITE,
    sulphur_skitter: WHITE,
    moldfin: DARK_PURPLE,
    soul_fish: DARK_PURPLE,
    vanille: BLUE,
    obfuscated_fish_3: BLUE,
    karate_fish: DARK_PURPLE,
    slugfish: GREEN
}

register("chat", () => {
    
}).setCriteria("TROPHY FISH! You caught a Sulphur Skitter GOLD");

function updateTrophy() {
    // Make an API request to Hypixel API to get the player's bestiary data from their profile.
    request({
        url: `https://api.hypixel.net/skyblock/profile?key=${settings.apiKey}&profile=${data.profileId}`,
        json: true
    }).then((response) => {
        // Update the 'bestiary' variable with the bestiary data from the API response.
        const trophyData = response.profile.members[getPlayerUUID()].trophy_fish;
        if (trophyData === undefined) return;
        const trophyFish = {};
        
        Object.keys(trophyData).forEach(fish => {
            if (fish.endsWith("_gold") || fish.endsWith("_silver") || fish.endsWith("_bronze") || fish.endsWith("_diamond") ||
                fish === "rewards" || fish === "total_caught") return;

            trophyFish[fish] = [
                trophyData[fish],
                trophyData[fish + "_bronze"] ?? 0,
                trophyData[fish + "_silver"] ?? 0,
                trophyData[fish + "_gold"] ?? 0,
                trophyData[fish + "_diamond"] ?? 0
            ];
        });

        // Sort by highest catches
        const trophyEntries = Object.entries(trophyFish);
        trophyEntries.sort((a, b) => b[1][0] - a[1][0]);
        data.trophyFish = {};
        for ([key, value] of trophyEntries) data.trophyFish[key] = value;

        // Set counter message
        if (settings.trophyCounter === 1) {
            Object.keys(data.trophyFish).forEach(fish => {
                const total = data.trophyFish[fish][0];
                if (total === 0) return;
                const title = trophyColors[fish] + convertToTitleCase(fish);
                const bronze = DARK_GRAY + data.trophyFish[fish][1];
                const silver = GRAY + data.trophyFish[fish][2];
                const gold = GOLD + data.trophyFish[fish][3];
                const diamond = AQUA + data.trophyFish[fish][4];
                
                trophyOverlay.message += `${title}${WHITE}: ${DARK_AQUA}${total} ${bronze} ${silver} ${gold} ${diamond}\n`;
            })
        }
    }).catch((err) => {
        console.error(`[VolcAddons] ${err.cause ?? err}`);
    });
}
updateTrophy();
