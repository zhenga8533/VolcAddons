export class Json {
    /**
     * Create a new persistant single object JSON file.
     * 
     * @param {String} file - The name of the JSON file
     */
    constructor(file) {
        this.data = JSON.parse(FileLib.read("VolcAddons", "json/" + file));

        register("gameUnload", () => {
            FileLib.write("VolcAddons", "json/" + file, JSON.stringify(this.data, null, 4));
        });
    }

    /**
     * Get the data of the JSON file
     * 
     * @returns {Object} The data of the JSON file
     */
    getData() {
        return this.data;
    }
}
