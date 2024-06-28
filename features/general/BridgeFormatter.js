import { DARK_GREEN, GOLD, GRAY, WHITE, YELLOW } from "../../utils/Constants";
import { registerWhen } from "../../utils/RegisterTils";
import Settings from "../../utils/Settings";

registerWhen(
  register("chat", (_, player, msg, event) => {
    cancel(event);
    player = player.replace("replying to", GRAY + "replying to" + GOLD);
    ChatLib.chat(`${DARK_GREEN}Guild > ${GOLD}[BDG${YELLOW}++${GOLD}] ${player + WHITE}: ${msg}`);
  }).setCriteria("Guild > ${bridge}: ${player} » ${msg}"),
  () => Settings.bridgeFormat
);
