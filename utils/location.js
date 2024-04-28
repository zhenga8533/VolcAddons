import settings from "./settings";
import { setPlayer } from "../features/combat/HealthAlert";
import { delay } from "./thread";
import { setRegisters } from "./variables";
import { AQUA, BOLD, DARK_AQUA, DARK_GRAY, LOGO, WHITE } from "./constants";


class Location {
    #world = undefined;
    #tier = 0;
    #server = undefined
    #season = undefined;

    constructor() {
        this.SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
        
        /**
         * Set registers.
         */
        register("chat", (id) => {
            this.#server = id;
        }).setCriteria("Sending to server ${id}...");
        
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
     * Returns Location.#tier
     * 
     * @returns {String} - Current tier of Kuudra or 0 if not in Kuudra.
     */
    getTier() {
        return this.#tier;
    }

    /**
     * Returns Location.#tier
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
     * Returns Location.#zone
     * 
     * @returns {String} - Current zone player is standing in.
     */
    findZone() {
        let zoneLine = Scoreboard?.getLines()?.find((line) => line.getName().includes("⏣"));
        if (zoneLine === undefined) zoneLine = Scoreboard?.getLines()?.find((line) => line.getName().includes("ф"));
        return zoneLine === undefined ? "None" : zoneLine.getName().removeFormatting();
    }

    /**
     * Used to output current location data to chat for testing.
     */
    test() {
        ChatLib.chat(
`${LOGO + DARK_AQUA + BOLD}World Test:
 ${DARK_GRAY} - ${AQUA}World: ${WHITE + this.#world}
 ${DARK_GRAY} - ${AQUA}Tier: ${WHITE + this.#tier}
 ${DARK_GRAY} - ${AQUA}Server: ${WHITE + this.#server}
 ${DARK_GRAY} - ${AQUA}Season: ${WHITE + this.#season}`
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
            // Set season
            Scoreboard.getLines().find(line => {
                this.#season = this.SEASONS.find(s => line.getName().includes(s)) ?? this.#season;
            });
    
            // Get world formatted
            this.#world = world.removeFormatting().split(' ').splice(1).join(' ');
    
            // Get tier for Kuudra
            if (this.#world === "Kuudra") {
                delay(() => {
                    const zone = this.findZone();
                    this.#tier = parseInt(zone.charAt(zone.length - 2));
                }, 1000);
            }
    
            // Call functions when world is loaded
            delay(() => {
                setRegisters(off = settings.skyblockToggle && !Scoreboard.getTitle().removeFormatting().includes("SKYBLOCK"));
                setPlayer();
            }, 1000);
        }
    }
}
export default new Location;
