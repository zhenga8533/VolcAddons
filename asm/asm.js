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

export default ASM => {
    const { desc, L, OBJECT, JumpCondition, BOOLEAN } = ASM;

    print("Start Test");

    ASM.injectBuilder(
        'net/minecraft/client/gui/FontRenderer',
        'renderStringAtPos',
        desc("Ljava/lang/String;", "FFIZLnet/minecraft/client/renderer/Matrix4f;Lnet/minecraft/client/renderer/IRenderTypeBuffer;ZII)V"),
        ASM.At(ASM.At.HEAD)
    )
    .instructions($ => {
        $.aload(0);
        $.invokeJS("modifyText");
        const result = $.astore();

        // Check if the result is undefined to prevent crashes
        $.aload(result.index);
        $.instanceof('org/mozilla/javascript/Undefined');
        $.ifClause([JumpCondition.TRUE], $ => {
            $.return();
        });
    })
    .execute();

    print("End Test");
};
