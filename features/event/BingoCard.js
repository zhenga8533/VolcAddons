import settings from "../../utils/settings";
import { registerWhen } from "../../utils/variables";

registerWhen(register("guiOpened", () => {
    Client.scheduleTask(3, () => {
        if (Player.getContainer().getName() !== "Bingo Card") return;

        const community = [];
        const personal = [];

        
    });
}), () => settings.gardenTab);