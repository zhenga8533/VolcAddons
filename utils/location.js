import settings from "./settings";
import { AQUA, BOLD, DARK_AQUA, DARK_GRAY, LOGO, WHITE } from "./constants";
import { setRegisters } from "./register";
import { delay } from "./thread";


class Location {
    #world = undefined;
    #zone = undefined;
    #tier = 0;
    #server = undefined;
    #season = undefined;
    #time = 0;

    constructor() {
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

        register("step", this.setSeason).setDelay(10);
        this.setSeason();
        
        register("worldLoad", () => {
            this.findWorld();
        }).setPriority(Priority.LOWEST);

        register("serverDisconnect", () => {
            this.#world = undefined;
            setRegisters(true);
        });

        register("command", () => {
            this.test();
        }).setName("worldTest");
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
     * Returns Location.#season
     * 
     * @returns {String} - Current Skyblock season.
     */
    getSeason() {
        return this.#season;
    }

    /**
     * Sets Location.#season using epoch time and SB time offset.
     */
    setSeason() {
        const now = new Date().getTime() / 1_000;
        this.#time = (now - 107_704) % 446_400;
        // const sbMonth = this.#time / 37_200;
        // const sbDay = (this.#time % 37_200) / 1_200;
        const ratio = this.#time / 446_400;

        this.#season = ratio < 0.25 ? "Spring" :
            ratio < 0.5 ? "Summer" :
            ratio < 0.75 ? "Autumn" : "Winter";
    }

    /**
     * Used to output current location data to chat for testing.
     */
    test() {
        ChatLib.chat(
`${LOGO + DARK_AQUA + BOLD}World Test:
 ${DARK_GRAY} - ${AQUA}World: ${WHITE + this.#world}
 ${DARK_GRAY} - ${AQUA}Tier: ${WHITE + this.#tier}
 ${DARK_GRAY} - ${AQUA}Season: ${WHITE + this.#season}
 ${DARK_GRAY} - ${AQUA}Server: ${WHITE + this.#server}`
        );
    }

    /**
     * Private.
     */
    findWorld = (noFind = 0) => {
        // Make sure Hypixel world is loaded)
        if (noFind > 9) return;
        else if (!World.isLoaded()) delay(() => this.findWorld(noFind + 1), 1000);
    
        // Get world from tab list
        let world = TabList.getNames()?.find(tab => tab.startsWith("§r§b§lArea:") || tab.startsWith("§r§b§lDungeon:"));
        if (world === undefined) delay(() => this.findWorld(noFind + 1), 1000);
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
                Client.showTitle(" ", "", 0, 1, 0);  // Fix first title not showing
            }, 1000);
        }
    }
}
export default new Location;
