const BZ_API = 'https://api.hypixel.net/skyblock/bazaar';

register("step", () => {
    if (Player.getName() != "Volcaronitee") return;

    // WIP
}).setDelay(600);

register("chat", (count, product, amount) => {
    if (Player.getName() != "Volcaronitee") return;

    // WIP
}).setCriteria("[Bazaar] Sell Offer Setup! ${count}x ${product} for ${amount} coins.");