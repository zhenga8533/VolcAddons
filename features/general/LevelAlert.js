import settings from "../../utils/Settings";
import { AQUA, BOLD, DARK_AQUA, GRAY, LOGO } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";


let lastMessage;

registerWhen(register("actionBar", (_, amount, category, now, __) => {
    const message = `${LOGO + AQUA}+${amount} SkyBlock XP ${GRAY}(${category}) ${DARK_AQUA}(${now}/100)`;
    if (lastMessage === message) return;
    lastMessage = message;

    ChatLib.chat(message);
    Client.showTitle(`${AQUA + BOLD}+${amount} SkyBlock XP`, `${GRAY}(${category}) ${DARK_AQUA}(${now}/100)`, 10, 50, 10);
}).setCriteria("${hp}+${amount} SkyBlock XP (${category}) (${now}/100)${mana}"), () => settings.levelAlert);
