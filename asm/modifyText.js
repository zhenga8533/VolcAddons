const modifiedWords = [
    { phrase: 'hello', replacement: 'hi', enabled: true },
    { phrase: 'world', replacement: 'planet', enabled: true }
];

/**
 * Modify the original text based on the defined modified words.
 * 
 * @param {string} originalText - The original text to be modified.
 * @returns {string} The modified text.
 */
function modifyText(originalText) {
    ChatLib.chat(originalText);
    let modifiedText = originalText;

    for (const word of modifiedWords) {
        if (word.enabled) {
            modifiedText = modifiedText.replace(new RegExp(word.phrase, 'gi'), word.replacement);
        }
    }

    return modifiedText;
}

export default () => {
    return true;
}
