import { data, registerWhen } from "../../utils/variables";


/**
 * Removes any identical chat messages in spamlist from chat.
 */
registerWhen(register("chat", (text, event) => {
    for (let i = 0; i < data.spamlist.length; i++) {
        const pattern = data.spamlist[i];
        const regexPattern = pattern.replace(/\${\w+}/g, '(.*?)');
        const regex = new RegExp('^' + regexPattern + '$', 'i');
    
        if (regex.test(text)) {
            cancel(event);
            return;
        }
    };
}).setCriteria("${text}"), () => data.spamlist.length !== 0);
