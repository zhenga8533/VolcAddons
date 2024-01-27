register("command", (args) => {
    ChatLib.chat(args[0]);
}).setName("kv", true).setAliases("kuudraView");
