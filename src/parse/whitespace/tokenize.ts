/** Consumes sequential whitespace from `tokens` beginning at `cursor` */
export default ((tokens: GenericToken[], cursor: number) : TokenizeResult<string> => {
    const count = tokens.length;

    let ws = '';
    let index = cursor;
    while (index < count && (
        tokens[index].value === ' '  ||
        tokens[index].value === '\n' ||
        tokens[index].value === '\r' ||
        tokens[index].value === '\t' ||
        tokens[index].value === '\b' ||
        tokens[index].value === '\f'
    )) {
        ws += tokens[index].value;
        index += 1;
    }

    if (cursor === index) {
        return [false];
    }
    return [true, index, ws];
});