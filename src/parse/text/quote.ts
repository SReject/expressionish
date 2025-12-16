import tokenizeEscape from './escape';
import TextToken from './token';

export default (tokens: GenericToken[], cursor: number) : TokenizeResult<TextToken> => {
    const count = tokens.length;

    if (
        cursor >= count ||
        tokens[cursor] == null ||
        tokens[cursor].value !== '"'
    ) {
        return [false];
    }

    const start = cursor;
    cursor += 1;

    let text : string = '';
    while (cursor < count) {
        if (tokens[cursor].value === '"') {
            return [
                true,
                cursor + 1,
                new TextToken({
                    position: start,
                    value: text
                })
            ]
        }

        const [tokenized, tokenizeCursor, tokenizeResult] = tokenizeEscape(tokens, cursor, '\\"nrt');
        if (tokenized) {
            cursor = tokenizeCursor;
            text += tokenizeResult.value;
            continue;
        }

        text += tokens[cursor].value;
        cursor += 1;
    }

    // TODO: Expressionish Errors
    throw new Error('end-quote missing');
}