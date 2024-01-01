import settings from "../../utils/settings";
import { delay } from "../../utils/thread";
import { registerWhen } from "../../utils/variables";

registerWhen(register("chat", () => {
    delay(() => ChatLib.command(`pc ${settings.partyMessage}`), 100);
}).setCriteria("${player} joined the party."), () => settings.partyMessage !== "");

registerWhen(register("chat", () => {
    delay(() => ChatLib.command(`gc ${settings.guildMessage}`), 100);
}).setCriteria("${player} joined the guild!"), () => settings.guildMessage !== "");
