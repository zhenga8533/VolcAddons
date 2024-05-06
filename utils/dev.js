import { GREEN, LOGO } from "./constants";


register("command", () => {
    TabList.getNames().forEach(name => {
        print(name);
    });
    ChatLib.chat(`${LOGO + GREEN}Succesfully printed TabList names to console!`);
}).setName("printTab");

register("command", () => {
    Scoreboard.getLines().forEach(line => {
        print(line.getName());
    });
    ChatLib.chat(`${LOGO + GREEN}Succesfully printed Scoreboard lines to console!`);
}).setName("printScore");
