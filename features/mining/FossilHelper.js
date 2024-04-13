import settings from "../../utils/settings";
import { registerWhen } from "../../utils/variables";


// Images stolen from: https://www.reddit.com/r/HypixelSkyblock/comments/1c0uj3u/fossil_guide_i_made_if_anyone_would_like_it/
const FOSSILS = {
    "8.3%": [Image.fromAsset("Spine.png")],
    "7.1%": [Image.fromAsset("Helix.png")],
    "7.7%": [Image.fromAsset("Footprint.png"), Image.fromAsset("Claw.png")],
    "10%": [Image.fromAsset("Webbed.png")],
    "12.5%": [Image.fromAsset("Tusk.png")],
    "9.1%": [Image.fromAsset("Clubbed.png")],
    "6.2%": [Image.fromAsset("Ugly.png")]
};
let possible = [];
const background = new Gui();

const renderFossil = register("guiRender", () => {
    background.func_146278_c(0);
    let y = 50;

    possible?.forEach(fossil => {
        fossil.draw(50, y, 300, 200);
        y += 250;
    });
}).unregister();

const trackClicks = register("guiMouseClick", () => {
    Client.scheduleTask(2, () => {
        const container = Player.getContainer().getItems();
        const fossil = container.find(item => item?.getName() === "§6Fossil");
        if (fossil === undefined) return;
        
        // Determine possible fossil types
        let progress = fossil.getLore()[6].split(' ');
        possible = FOSSILS[progress[progress.length - 1].removeFormatting()];

        trackClicks.unregister();
        renderFossil.register();
    });
}).unregister();

const untrackFossils = register("guiClosed", () => {
    trackClicks.unregister();
    untrackFossils.unregister();
    renderFossil.unregister();
}).unregister();

registerWhen(register("guiOpened", () => {
    Client.scheduleTask(2, () => {
        if (Player.getContainer().getName() !== "Fossil Excavator") return;
        trackClicks.register();
        untrackFossils.register();
    })
}), () => settings.fossilHelper);