import request from "../../../requestV2";
import { getPlayerUUID } from "../../utils/player";
import settings from "../../utils/settings";
import { data } from "../../utils/variables";


register("chat", () => {
    
}).setCriteria("TROPHY FISH! You caught a Sulphur Skitter GOLD");

function updateTrophy() {
    // Make an API request to Hypixel API to get the player's bestiary data from their profile.
    request({
        url: `https://api.hypixel.net/skyblock/profile?key=${settings.apiKey}&profile=${data.profileId}`,
        json: true
    }).then((response) => {
        // Update the 'bestiary' variable with the bestiary data from the API response.
        const trophyData = response.profile.members["58e7ba62ed31445c8fa71cf5ed575940"].trophy_fish;
        const trophyFish = {};
        
        Object.keys(trophyData).forEach(fish => {
            if (fish.endsWith("_gold") || fish.endsWith("_silver") || fish.endsWith("_bronze") || fish.endsWith("_diamond") ||
                fish === "rewards" || fish === "total_caught") return;

            trophyFish[fish] = [
                trophyData[fish],
                trophyData[fish + "_bronze"] ?? 0,
                trophyData[fish + "_silver"] ?? 0,
                trophyData[fish + "_gold"] ?? 0,
            ];
        });

        print(JSON.stringify(trophyFish));
    }).catch((error) => {
        // If there is an error, display the error message in the Minecraft chat.
        if (error.cause !== "Invalid API key") ChatLib.chat(`${LOGO} ${RED}${error}!`);
        // delay(updateTrophy(), 3000);
        else if (settings.apiKey) ChatLib.chat(`${LOGO} ${RED}${error.cause}!`);
    });
}
updateTrophy();
