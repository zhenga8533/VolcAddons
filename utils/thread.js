const Threading = Java.type("gg.essential.api.utils.Multithreading");

export function delay(func, time) {
    if (time)
        Threading.schedule(() => { func() }, time, java.util.concurrent.TimeUnit.MILLISECONDS);
    else
        Threading.runAsync(() => { func() });
}
