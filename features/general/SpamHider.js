import { data, registerWhen } from "../../utils/variables";


/**
 * Removes any identical chat messages in spamlist from chat.
 */
registerWhen(register("chat", (text, event) => {
    for (let pattern in data.spamlist) {
        let regexPattern = pattern.replace(/\${\w+}/g, '(.*?)');
        let regex = new RegExp('^' + regexPattern + '$', 'i');
    
        if (regex.test(text)) {
            cancel(event);
            break;
        }
    }
}).setCriteria("${text}"), () => data.spamlist.length !== 0);
