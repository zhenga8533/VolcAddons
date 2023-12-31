import { data, registerWhen } from "../../utils/variables";


/**
 * Removes any identical chat messages in spamlist from chat.
 */
registerWhen(register("chat", (text, event) => {
    if (!(text in data.spamlist)) return;

    cancel(event);
}).setCriteria("${text}"), () => data.spamlist.size !== 0);
