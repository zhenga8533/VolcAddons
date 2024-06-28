import { data } from "../../utils/Data";
import { registerWhen } from "../../utils/RegisterTils";

/**
 * Removes any identical chat messages in spamlist from chat.
 */
registerWhen(
  register("chat", (text, event) => {
    for (let i in data.spamlist) {
      let regexPattern = data.spamlist[i].replace(/\${\w+}/g, "(.*?)");
      let regex = new RegExp("^" + regexPattern + "$", "i");

      if (regex.test(text)) {
        cancel(event);
        break;
      }
    }
  }).setCriteria("${text}"),
  () => data.spamlist.length !== 0
);
