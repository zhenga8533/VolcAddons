import { AQUA, BOLD, DARK_AQUA, GRAY, LOGO } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";
import { setTitle } from "../../utils/Title";

let lastMessage;

registerWhen(
  register("actionBar", (_, amount, category, now, __) => {
    const message = `${LOGO + AQUA}+${amount} SkyBlock XP ${GRAY}(${category}) ${DARK_AQUA}(${now}/100)`;
    if (lastMessage === message) return;
    lastMessage = message;

    ChatLib.chat(message);
    setTitle(`${AQUA + BOLD}+${amount} SkyBlock XP`, `${GRAY}(${category}) ${DARK_AQUA}(${now}/100)`, 10, 50, 10, 98);
  }).setCriteria("${hp}+${amount} SkyBlock XP (${category}) (${now}/100)${mana}"),
  () => Settings.levelAlert
);
