export default ASM => {
    const { desc, L, OBJECT, JumpCondition, BOOLEAN } = ASM;

    print('Start Test');

    ASM.injectBuilder(
        'net/minecraft/client/gui/FontRenderer',
        'renderString',
        desc('I', L('java/lang/String'), 'F', 'F', 'I', 'Z', L('net/minecraft/util/math/Matrix4f'), L('net/minecraft/client/renderer/IRenderTypeBuffer'), 'Z', 'I', 'I'),
        ASM.At(ASM.At.HEAD)
    )
    .methodMaps({
        func_180455_b: 'renderString',
    })
    .instructions($ => {
        $.array(0, OBJECT, $ => {}).invokeJS('modifyText')
        const result = $.astore()
        $.aload(result.index)
        $.instanceof('org/mozilla/javascript/Undefined')
        $.ifClause([JumpCondition.TRUE], $ => {
            $.aload(result.index)
            $.checkcast(BOOLEAN)
            $.invokeVirtual(BOOLEAN, 'booleanValue', desc('Z'))
            $.ifClause([JumpCondition.FALSE], $ => {
                ChatLib.chat('E')
            });
        });
    })
    .execute();

    print('End Test');
};
