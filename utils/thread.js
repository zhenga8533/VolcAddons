const Multithreading = Java.type("gg.essential.api.utils.Multithreading");

export function delay(func, time) {
    if (time)
        Multithreading.schedule(() => { func() }, time, java.util.concurrent.TimeUnit.MILLISECONDS);
    else
        Multithreading.runAsync(() => { func() });
}
