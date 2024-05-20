import renderBeaconBeam from "../../BeaconBeam";
import RenderLib from "../../RenderLib/index";
import { DARK_GRAY, GOLD, YELLOW } from "./constants";
import { data } from "./data";


/**
 * General utility for rendering waypoints.
 */
const waypoints = [];

register("renderWorld", () => {
    const pX = Player.getRenderX();
    const pY = Player.getRenderY();
    const pZ = Player.getRenderZ();
    const pEye = Player.asPlayerMP().getEyeHeight();

    waypoints.forEach(waypoint => {
        waypoint.draw(pX, pY, pZ, pEye);
    });
});

register("worldUnload", () => {
    waypoints.forEach(waypoint => {
        waypoint.clear();
    });
});

export class Waypoint {
    #color;
    #waypoints;
    #simple;
    #box;
    #beam;
    #rounded;

    /**
     * Creates a new waypoint.
     * 
     * @param {Number[]} color - RGB color of the waypoint.
     */
    constructor(color, simple=false, box=true, beam=true, rounded=true) {
        waypoints.push(this);
        this.#color = color;
        this.#waypoints = [];
        this.#simple = simple;
        this.#box = box;
        this.#beam = beam;
        this.#rounded = rounded;
    }

    /**
     * Draws the waypoints on the screen.
     * 
     * @param {Number} pX - Player's x position.
     * @param {Number} pY - Player's y position.
     * @param {Number} pZ - Player's z position.
     * @param {Number} pEye - Player's eye height.
     */
    draw(pX, pY, pZ, pEye){
        this.#waypoints.forEach(waypoint => {
            const n = waypoint.length;
            const title = waypoint[n - 4];

            // Calculate the position of the waypoint
            let x = parseFloat(this.#rounded ? Math.round(waypoint[n - 3]) : waypoint[n - 3]) - 0.5;
            let y = parseFloat(this.#rounded ? Math.round(waypoint[n - 2]) : waypoint[n - 2]);
            let z = parseFloat(this.#rounded ? Math.round(waypoint[n - 1]) : waypoint[n - 1]) - 0.5;

            // Calculate the render distance of the waypoint
            const distance = Math.hypot(pX - x, pY - y, pZ - z);
            const renderDistance = Math.min(distance, 50);

            // Credit: https://github.com/Soopyboo32/SoopyV2/blob/master/src/utils/renderUtils.js
            const rX = pX + (x - pX) / (distance / renderDistance);
            const rY1 = pY + pEye + (y + 1 + (20 * distance / 300) - (pY + pEye)) / (distance / renderDistance);
            const rY2 = pY + pEye + (y + 1 + (20 * distance / 300) - (10 * distance / 300) - (pY + pEye)) / (distance / renderDistance);
            const rZ = pZ + (z - pZ) / (distance / renderDistance);
            const color = waypoint.length < 6 && !isNaN(waypoint[2]) ? this.#color : waypoint.slice(0, 3);

            // Render waypoint box
            if (this.#box) {
                RenderLib.drawEspBox(x, y, z, 1, 1, ...color, 1, data.vision || !this.#simple);
                RenderLib.drawInnerEspBox(x, y, z, 1, 1, ...color, 0.25, data.vision || !this.#simple);
            }

            // Render waypoint text
            if (!this.#simple) {
                Tessellator.drawString(GOLD + title, rX, rY1, rZ);
                Tessellator.drawString(`${DARK_GRAY}[${YELLOW + Math.round(distance)}m${DARK_GRAY}]`, rX, rY2, rZ);
            }

            // Render beacon beam
            if (this.#beam) renderBeaconBeam(x - 0.5, y, z - 0.5, ...color, 0.5, false);
        });
    }

    /**
     * Clears the list of waypoints.
     */
    clear() {
        this.#waypoints = [];
    }

    /**
     * Finds the closest waypoint to the given coordinate.
     * 
     * @param {Numer[]} coord - The coordinate to find the closest waypoint to.
     * @returns {Number[]} The closest waypoint to the given coordinate.
     */
    getClosest(coord) {
        const n = coord.length;
        let closest = [null, Infinity];

        this.#waypoints.forEach(waypoint => {
            const m = waypoint.length;
            const dX = waypoint[m - 3] - coord[n - 3];
            const dY = waypoint[m - 2] - coord[n - 2];
            const dZ = waypoint[m - 1] - coord[n - 1];
            const distance = Math.hypot(dX, dY, dZ);
            if (distance < closest[1]) closest = [waypoint, distance];
        });
        return closest;
    }

    /**
     * Gets the list of waypoints.
     * 
     * @returns {Number[]} The list of waypoints.
     */
    getWaypoints() {
        return this.#waypoints;
    }
    
    /**
     * Adds a waypoint to the list.
     * 
     * @param {Number[]} waypoint - The waypoint to add.
     */
    push(waypoint) {
        this.#waypoints.push(waypoint);
    }
}
