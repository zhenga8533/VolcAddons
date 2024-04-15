import { GREEN, LOGO, RED } from "../../utils/constants";
import { data } from "../../utils/variables";


register("guiOpened", () => {
    Client.scheduleTask(2, () => {
        if (!Player.getContainer().getName().startsWith("Previous Fire Sales")) return;
        const items = Player.getContainer().getItems();

        for (let i = 1; i < 5; i++) {
            for (let j = 1; j < 8; j++) {
                let skin = items[i * 9 + j];
                if (skin === null) break;
                let skinID = skin.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getString("id");
                if (!data.skins.includes(skinID)) data.skins.push(skinID);
            }
        }
    });
});

register("command", () => {
    if (data.skins.length === 0) {
        ChatLib.chat(`${LOGO + RED}Please open all Fire Sale menus first to register all valid skins!`)
        return;
    }

    let missingSkins = "";

    ChatLib.chat(missingSkins || `${LOGO + GREEN}No missing skins!`);
}).setName("missingSkins");
