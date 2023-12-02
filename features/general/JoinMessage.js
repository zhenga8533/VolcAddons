import settings from "../../utils/settings";
import { registerWhen } from "../../utils/variables";

registerWhen(register("chat", () => {
    ChatLib.command(`pc ${settings.partyMessage}`);
}).setCriteria("${player} joined the party!"), () => settings.partyMessage !== "");

registerWhen(register("chat", () => {
    ChatLib.command(`gc ${settings.guildMessage}`);
}).setCriteria("${player} joined the guild!"), () => settings.guildMessage !== "");
