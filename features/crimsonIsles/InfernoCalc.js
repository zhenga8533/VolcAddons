export function calcInferno(args) {
    switch (args[1]) {
        case "hypergolic":
        case "hg":
            const instaHypergolic = calcHypergolic(1);
            const orderHypergolic = calcHypergolic(0);
            const instaSellProfit = formatInt(items.HYPERGOLIC_GABAGOOL[0] - instaHypergolic);
            const instaOrderProfit = formatInt(items.HYPERGOLIC_GABAGOOL[1] - instaHypergolic);
            const orderInstaProfit = formatInt(items.HYPERGOLIC_GABAGOOL[0] - orderHypergolic);
            const orderOfferProfit = formatInt(items.HYPERGOLIC_GABAGOOL[1] - orderHypergolic);

            ChatLib.chat(`\n${GOLD}${BOLD}Insta Buy Price: ${RESET}${formatInt(instaHypergolic)}`);
            ChatLib.chat(`${GOLD}${BOLD}Insta Buy Profit (Insta Sell): ${RESET}${instaSellProfit}`);
            ChatLib.chat(`${GOLD}${BOLD}Insta Buy Profit (Sell Offer): ${RESET}${instaOrderProfit}`);
            ChatLib.chat(`${GREEN}${BOLD}Buy Order Price: ${RESET}${formatInt(orderHypergolic)}`);
            ChatLib.chat(`${GREEN}${BOLD}Buy Order Profit (Insta Sell): ${RESET}${orderInstaProfit}`);
            ChatLib.chat(`${GREEN}${BOLD}Buy Order Profit (Sell Offer): ${RESET}${orderOfferProfit}\n`);
            break;
        /*  INFERNO MINION LOOT TABLE:
            Chili Pepper 1/156
            Inferno Vertex 1/16,364
            Inferno Apex 1/1,570,909
            Reaper Pepper 1/458,182

            Minion Speed:
            base / (21 * (1 + flyCatchers + minExpander + infusion + beacon + powerCrystal + risingCelsius))
            base / 71.61 for MAX UPGRADES
        */
        case "inferno": // INFERNO MINION PROFIT
            const eyedrop = 1.3;
            infernoAction /= 21;

            // Drops
            const actions = minions * DAY_SECONDS / (2 * infernoAction);

            const drops = {
                "GABAGOOL": actions.toFixed(4),
                "CHILI": (actions / (156 / eyedrop)).toFixed(4),
                "VERTEX": (actions / (16364 / eyedrop)).toFixed(4),
                "APEX": (actions / (1570909 / eyedrop)).toFixed(4),
                "REAPER": (actions / (458182 / eyedrop)).toFixed(4)
            }
            const profit = {
                "GABAGOOL": drops.GABAGOOL * items.CRUDE_GABAGOOL[1],
                "CHILI": drops.CHILI * items.CHILI_PEPPER[1],
                "VERTEX": drops.VERTEX * items.INFERNO_VERTEX[1],
                "APEX": drops.APEX * data.apexPrice,
                "REAPER": drops.REAPER * items.REAPER_PEPPER[1]
            };

            // Fuel + Net Gain (Hydra Heads hard coded for now, I'll update once I get around to it :skull:)
            const fuel = minions * (items.HYPERGOLIC_GABAGOOL[0] + 6 * items.CRUDE_GABAGOOL_DISTILLATE[0] + 2 * items.INFERNO_FUEL_BLOCK[0] + 800000);
            const net = Object.values(profit).reduce((a, c) => a + c, 0) - fuel;

            // ChatLib the values
            ChatLib.chat(`\n${GOLD}${BOLD}Average Profit for ${minions} Inferno Minion(s) t${tier}`);
            ChatLib.chat(`${AQUA}${BOLD}Crude Gabagool ${GRAY}${BOLD}[${drops.GABAGOOL}]${AQUA}: ${RESET}${formatInt(profit.GABAGOOL)}`);
            ChatLib.chat(`${AQUA}${BOLD}Chili Pepper ${GRAY}${BOLD}[${drops.CHILI}]${AQUA}: ${RESET}${formatInt(profit.CHILI)}`);
            ChatLib.chat(`${AQUA}${BOLD}Inferno Vertex ${GRAY}${BOLD}[${drops.VERTEX}]${AQUA}: ${RESET}${formatInt(profit.VERTEX)}`);
            ChatLib.chat(`${AQUA}${BOLD}Inferno Apex ${GRAY}${BOLD}[${drops.APEX}]${AQUA}: ${RESET}${formatInt(profit.APEX)}`);
            ChatLib.chat(`${AQUA}${BOLD}Reaper Pepper ${GRAY}${BOLD}[${drops.REAPER}]${AQUA}: ${RESET}${formatInt(profit.REAPER)}\n`);
            ChatLib.chat(`${RED}${BOLD}Fuel Price: ${RESET}${formatInt(fuel)}`);
            ChatLib.chat(`${GREEN}${BOLD}Total Profit: ${RESET}${formatInt(net)}\n${PSA}`);
            break;
        case "gabagool": // GABAGOOL!!!
            // Heavy 15x
            infernoAction /= 16;
            const heavyGabagool = minions * 86400 / (2 * infernoAction) * items.CRUDE_GABAGOOL[1];
            const heavyPrice = minions * (items.HEAVY_GABAGOOL[0] + 6 * items.CRUDE_GABAGOOL_DISTILLATE[0] + 2 * items.INFERNO_FUEL_BLOCK[0]);
            const heavyProfit = heavyGabagool - heavyPrice;

            // Fuel 10x
            infernoAction *= 1.6;
            const fuelGabgool = minions * 86400 / (2 * infernoAction) * items.CRUDE_GABAGOOL[1];
            const fuelPrice = minions * (items.FUEL_GABAGOOL[0] + 6 * items.CRUDE_GABAGOOL_DISTILLATE[0] + 2 * items.INFERNO_FUEL_BLOCK[0]);
            const fuelProfit = fuelGabgool - fuelPrice;

            // Format ChatLib.chat
            ChatLib.chat(`\n${GOLD}${BOLD}Average Profit for ${minions} Inferno Minion(s) t${tier}`);
            ChatLib.chat(`${AQUA}${BOLD}Heavy Gabagool Drops: ${RESET}${formatInt(heavyGabagool)}`);
            ChatLib.chat(`${RED}${BOLD}Heavy Gabagool Cost: ${RESET}${formatInt(heavyPrice)}`);
            ChatLib.chat(`${GREEN}${BOLD}Heavy Gabagool Profit: ${RESET}${formatInt(heavyProfit)}\n`);
            ChatLib.chat(`${AQUA}${BOLD}Fuel Gabagool Drops: ${RESET}${formatInt(fuelGabgool)}`);
            ChatLib.chat(`${RED}${BOLD}Fuel Gabagool Cost: ${RESET}${formatInt(fuelPrice)}`);
            ChatLib.chat(`${GREEN}${BOLD}Fuel Gabagool Profit: ${RESET}${formatInt(fuelProfit)}\n${PSA}`);
            break;
        default:
            ChatLib.chat(`${LOGO} ${AQUA}Please enter as /va calc <hypergolic, <inferno, gabagool, vampire> ${ITALIC}[minions] [tier]${RESET}${AQUA}>`);
            break;
    }
}