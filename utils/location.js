import settings from "./settings";
import { delay } from "./thread";
import { setRegisters } from "./variables";
import { AQUA, BOLD, DARK_AQUA, DARK_GRAY, LOGO, WHITE } from "./constants";


class Location {
    #world = undefined;
    #zone = undefined;
    #tier = 0;
    #server = undefined

    constructor() {
        this.SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
        
        /**
         * Set registers.
         */
        register("chat", (id) => {
            this.#server = id;
        }).setCriteria("Sending to server ${id}...");

        register("tick", () => {
            if (!World.isLoaded()) return;

            let zoneLine = Scoreboard?.getLines()?.find((line) => line.getName().startsWith(" §7⏣")) ??
                Scoreboard?.getLines()?.find((line) => line.getName().startsWith(" §5ф"));
            this.#zone = zoneLine === undefined ? "None" :
                zoneLine.getName().removeFormatting().substring(3);
        });
        
        register("worldLoad", () => {
            this.findWorld();
        }).setPriority(Priority.LOWEST);

        register("worldUnload", () => {
            this.#world = undefined;
            setRegisters(off = settings.skyblockToggle && !Scoreboard.getTitle().removeFormatting().includes("SKYBLOCK"));
        }).setPriority(Priority.LOWEST);

        register("serverDisconnect", () => {
            this.#world = undefined;
            setRegisters(off = true);
        });
    }

    /**
     * Returns Location.#world
     * 
     * @returns {String} - Current world name i.e. "Gold Mine".
     */
    getWorld() {
        return this.#world;
    }

    /**
     * Returns Location.#zone
     * 
     * @returns {String} - Current world name i.e. "Plot - 1".
     */
    getZone() {
        return this.#zone;
    }

    /**
     * Returns Location.#tier
     * 
     * @returns {String} - Current tier of Kuudra or 0 if not in Kuudra.
     */
    getTier() {
        return this.#tier;
    }

    /**
     * Returns Location.#server
     * 
     * @returns {String} - Current server id i.e. "m188AJ".
     */
    getServer() {
        return this.#server;
    }

    /**
     * Calculates Skyblock season using epoch time and offset.
     * 
     * @returns {String} - Current Skyblock season.
     */
    getSeason() {
        const now = new Date().getTime() / 1_000;
        const sbYear = ((now - 5_866_500) % 8_928_000) / 8_928_000;
        return sbYear < 0.25 ? "Spring" :
            sbYear < 0.5 ? "Summer" :
            sbYear < 0.75 ? "Autumn" : "Winter";
    }

    /**
     * Used to output current location data to chat for testing.
     */
    test() {
        ChatLib.chat(
`${LOGO + DARK_AQUA + BOLD}World Test:
 ${DARK_GRAY} - ${AQUA}World: ${WHITE + this.#world}
 ${DARK_GRAY} - ${AQUA}Tier: ${WHITE + this.#tier}
 ${DARK_GRAY} - ${AQUA}Server: ${WHITE + this.#server}`
        );
    }

    /**
     * Private.
     */
    findWorld = (noFind = 0) => {
        // Make sure Hypixel world is loaded
        if (!World.isLoaded() || noFind > 9) return;
    
        // Get world from tab list
        let world = TabList.getNames()?.find(tab => tab.startsWith("§r§b§lArea:") || tab.startsWith("§r§b§lDungeon:"));
        if (world === undefined) Client.scheduleTask(20, () => this.findWorld(noFind + 1));
        else {
            // Get world formatted
            this.#world = world.removeFormatting().split(' ').splice(1).join(' ');
    
            // Get tier for Kuudra
            if (this.#world === "Kuudra") {
                delay(() => {
                    const zone = this.getZone();
                    this.#tier = parseInt(zone.charAt(zone.length - 2));
                }, 1000);
            }
    
            // Call functions when world is loaded
            delay(() => {
                setRegisters(off = settings.skyblockToggle && !Scoreboard.getTitle().removeFormatting().includes("SKYBLOCK"));
            }, 1000);
        }
    }
}
export default new Location;
