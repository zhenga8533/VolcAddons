const files = [];
register("gameUnload", () => {
    files.forEach(file => {
        FileLib.write("VolcAddons", file.getPath(), JSON.stringify(file.getData(), null, 4));
    });
}).setPriority(Priority.HIGHEST);

export class Json {
    #data;
    #path;

    /**
     * Create a new persistant single object JSON file.
     * Currently using this to keep track of server based data.
     * 
     * @param {String} file - The name of the JSON file
     * @param {Boolean} save - Whether to save the file or not
     */
    constructor(file, save) {
        this.#path = "json/" + file;
        this.#data = JSON.parse(FileLib.read("VolcAddons", this.#path));
        if (save) files.push(this);
    }

    /**
     * Get the data of the JSON file
     * 
     * @returns {Object} The data of the JSON file
     */
    getData() {
        return this.#data;
    }

    /**
     * Set the data of the JSON file
     * 
     * @param {Object} data - The new data of the JSON file
     */
    getPath() {
        return this.#path;
    }
}
