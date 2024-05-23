const files = [];
register("gameUnload", () => {
    files.forEach(file => {
        FileLib.write("VolcAddons", file.getPath(), JSON.stringify(file.getData(), null, 4));
    });
}).setPriority(Priority.HIGHEST);

export class Json {
    #data;
    #file;
    #path;

    /**
     * Create a new persistant single object JSON file.
     * 
     * @param {String} file - The name of the JSON file
     * @param {Boolean} save - Whether to save the file or not
     */
    constructor(file, isData, save=true) {
        if (save) files.push(this);
        this.#file = file;
        this.#path = (isData ? "data/" : "json/") + file;

        // Load the data from the file
        if (isData && FileLib.exists("VolcAddons", "data/" + file)) {
            this.#data = JSON.parse(FileLib.read("VolcAddons", "data/" + file));
        } else this.reset();
    }

    /**
     * Get the data of the JSON file.
     * 
     * @returns {Object} The data of the JSON file.
     */
    getData() {
        return this.#data;
    }

    /**
     * Get the path of the JSON file.
     */
    getPath() {
        return this.#path;
    }

    /**
     * Set the data of the JSON file.
     */
    reset() {
        this.#data = JSON.parse(FileLib.read("VolcAddons", "json/" + this.#file));
    }
}
