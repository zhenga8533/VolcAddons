const files = [];
register("gameUnload", () => {
  files.forEach((file) => {
    try {
      FileLib.write("VolcAddons", file.getPath(), JSON.stringify(file.getData(), null, 4));
    } catch (e) {
      console.error(`Error saving JSON file: ${file.getPath()}`);
    }
  });
}).setPriority(Priority.HIGH);

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
  constructor(file, isData, save = true, path = "") {
    if (save) files.push(this);
    this.#file = file;
    this.#path = (isData ? "data/" : "json/") + path + file;

    // Load the data from the file
    if (isData && FileLib.exists("VolcAddons", this.#path)) {
      try {
        this.#data = JSON.parse(FileLib.read("VolcAddons", this.#path));
      } catch (e) {
        this.#data = {};
        console.error(`Error loading JSON file: ${file}`);
      }
    } else this.reset();

    // Check if the file exists
    if (this.#data === null) {
      this.#data = {};
      FileLib.write("VolcAddons", this.#path, "{}");
    }
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
   * Set the data of the JSON file.
   *
   * @param {Object} data - The data to set
   */
  setData(data) {
    this.#data = data;
  }

  /**
   * Get the path of the JSON file.
   *
   * @returns {String} The path of the JSON file.
   */
  getPath() {
    return this.#path;
  }

  /**
   * Set the data of the JSON file.
   */
  reset() {
    try {
      this.#data = JSON.parse(FileLib.read("VolcAddons", "json/" + this.#file));
    } catch (e) {
      this.#data = {};
      console.error(`Error loading JSON file: ${this.#file}`);
    }
  }
}
