import settings from "../../utils/settings";
import { data, registerWhen } from "../../utils/variables";
import { getWorld } from "../../utils/worlds";
import { Overlay } from "../../utils/overlay";


const commissionExample = 
`§r§9§lCommissions:§r
§r §r§fUmber Collector: §r§c0%§r
§r §r§fCorpse Looter: §r§c0%§r
§r §r§fScrap Collector: §r§c0%§r
§r §r§fCitrine Gemstone Collector: §r§c0%§r`;
const commissionOverlay = new Overlay("commissionsDisplay", ["Crystal Hollows", "Dwarven Mines"], () => true, data.CDL, "moveCommissions", commissionExample);

registerWhen(register("step", () => {
    if (!World.isLoaded()) return;
    const tab = TabList.getNames();
    commissionOverlay.message = "";

    let index = tab.findIndex(name => name === "§r§9§lCommissions:§r");
    while (tab[index] !== "§r") {
        commissionOverlay.message += `${tab[index]}\n`;
        index++;
    }
}).setFps(4), () => (getWorld() === "Crystal Hollows" || getWorld() === "Dwarven Mines") && settings.commissionsDisplay);
