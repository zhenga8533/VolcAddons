let Executors = Java.type("java.util.concurrent.Executors");
const Threading = Java.type("gg.essential.api.utils.Multithreading");
const threads = [];

export class NonPooledThread {
  #callback;
  #executor;

  /**
   * Creates a new non-pooled thread.
   * Stolen from https://github.com/Soopyboo32/soopyApis/tree/master
   *
   * @param {Function} callback - The function to be executed.
   */
  constructor(callback) {
    threads.push(this);
    this.#callback = callback;
    this.#executor = Executors.newSingleThreadExecutor();
  }

  /**
   * Executes the thread.
   */
  execute() {
    this.#executor.execute(this.#callback);
  }

  /**
   * Shuts down the thread.
   */
  shutdown() {
    this.#executor.shutdown();
  }
}

/**
 * Backup kill all threads.
 */
register("gameUnload", () => {
  threads.forEach((thread) => {
    thread.shutdown();
  });
}).setPriority(Priority.LOWEST);

/**
 * Adds a delay before executing a function or runs the function asynchronously.
 *
 * @param {Function} func - The function to be executed after the delay.
 * @param {Number} time - The delay time in milliseconds (optional). If not provided, the function will run asynchronously.
 */
export function delay(func, time) {
  if (time) {
    // Schedule the function to be executed after the specified delay.
    // The time value is converted to milliseconds using java.util.concurrent.TimeUnit.MILLISECONDS.
    Threading.schedule(
      () => {
        func();
      },
      time,
      java.util.concurrent.TimeUnit.MILLISECONDS
    );
  } else {
    // Run the function asynchronously without any delay.
    Threading.runAsync(() => {
      func();
    });
  }
}
