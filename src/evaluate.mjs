import * as errors from './errors.mjs';

const types = {
    QUOTE:        'QUOTE',
    ESCAPE:       'ESCAPE',
    VAR_START:    'VAR_START',
    VAR_NAME:     'VAR_NAME',
    BLOCK_START:  'ARG_START',
    BLOCK_SEP:    'ARG_SEP',
    BLOCK_END:    'ARG_END',
    TEXT:         'TEXT',
    LITERAL_TEXT: 'LITERAL_TEXT'
}
// characters that can be escaped outside of quoted text
const ESC_CHARS = '$",[]\\';

// characters that can be escaped inside of quoted text
const QUOTE_ESC_CHARS = '"\\';

const consumeEscapeSequence = (state, tokens, escapeChars) => {
    let cursor = state.cursor;
    const { value: tokenValue } = tokens[cursor];

    if (tokenValue !== '\\') {
        return;
    }

    if (tokens[cursor + 1] == null) {
        tokens[cursor].type = types.LITERAL_TEXT;
        state.consumed = true;
        state.cursor += 1;
        return;
    }

    // Retrieve the token following the escape token
    let {value: nextTokenValue, nextTokenPosition} = tokens[cursor + 1];

    // if the following token is more than one character long
    if (nextTokenValue.length > 1) {

        // remove first character from next token
        tokens[cursor + 1] = {
            position: nextTokenPosition + 1,
            value: nextTokenValue.slice(1)
        };

        // Insert the removed character as its own token following the \'s token
        tokens.splice(cursor + 1, 0, {
            position: nextTokenPosition,
            value: nextTokenValue[0]
        });

        // update nextToken related vars to point to inserted token
        nextTokenValue = nextTokenValue[0];
    }

    // character isn't escapable so treat the \ as literal text
    if (escapeChars.indexOf(nextTokenValue) === -1) {
        tokens[cursor].type = types.LITERAL_TEXT;
        state.consumed = true;
        state.cursor += 1;
        return;
    }

    // character is escapeable so remove the \ from the tokens list and add set the next token as being literal_text
    tokens.splice(cursor, 1);
    tokens[cursor].type = types.LITERAL_TEXT;
    state.consumed = true;
    state.cursor += 1;
};

const consumeQuotedText = (state, tokens) => {
    let cursor = state.cursor;
    const {value: tokenValue, position: tokenPosition } = tokens[cursor];

    if (tokenValue !== '"') {
        return;
    }

    const startPosition = tokenPosition;
    const startCursor = cursor;

    let result = '';

    cursor += 1;
    while (cursor < tokens.length) {
        const {value} = tokens[cursor];

        // end of quote
        if (value === '"') {
            // replace all tokens that make up the quoted text w/ a single LITERAL_TEXT token
            tokens.splice(
                startCursor,
                1 + (cursor - startCursor),
                {value: result, position: startPosition, type: types.LITERAL_TEXT}
            );

            state.consumed = true;
            state.cursor += 1;
            return;
        }

        // Process escape sequences inside of the quote
        const escState = {consumed: false, cursor};
        consumeEscapeSequence(escState, tokens, QUOTE_ESC_CHARS);
        if (escState.consumed) {
            cursor = escState.cursor;
            result += tokens[cursor - 1].value;
            continue;
        }

        result += value;
        cursor += 1;
    }

    // End quote wasn't encountered in the loop
    throw new errors.ExpressionSyntaxError(startPosition, 'end quote missing');
};

const varnameMatch = /^([a-z][a-z\d]+)(.*)$/i;
const consumeVariableName = (state, tokens) => {
    let cursor = state.cursor;
    const {value: tokenValue, position: tokenPosition } = tokens[cursor];

    if (tokenValue !== '$') {
        return;
    }

    let nextToken = tokens[cursor + 1],
        varnameResult;

    // if the next token doesn't start with a valid variable name treat the $ token as literal text
    if (nextToken == null || !(varnameResult = varnameMatch.exec(nextToken.value))) {
        tokens[cursor].type = types.LITERAL_TEXT;
        state.consumed = true;
        state.cursor += 1;
        return;
    }

    // there are characters trailing the variable name: "$varname.extra_characters"
    if (varnameResult[2] !== '') {
        const nextPosition = nextToken.position;
        // remove the varname from the extra characters, and update the token's start position
        nextToken.value = varnameResult[2];
        nextToken.position = nextPosition + varnameResult[1].length;

        // Insert a new token for the variable name
        tokens.splice(cursor + 1, 0, {
            value: varnameResult[1],
            position: nextPosition
        });
    }

    // remove the $ token
    tokens.splice(cursor, 1);

    // update the token's type to VAR_NAME
    tokens[cursor].type = types.VAR_NAME;

    // indicate the cursor has moved
    state.consumed = true;
    state.cursor += 1;
}

export default function evaluate(variables, options) {

    // validate handlers list
    if (!Array.isArray(variables)) {
        throw new TypeError('handlers list not an array');
    }

    // validate options.expression
    if (options == null) {
        throw new TypeError('options not specified');
    }
    if (options.expression == null) {
        throw new TypeError('expression not specified');
    }
    if (typeof options.expression !== 'string') {
        throw new TypeError('expression must be a string');
    }

    // validate options.trigger
    if (options.trigger == null) {
        throw new TypeError('No trigger defined in options');
    }

    // split the expression into tokens then those tokens to a Token object
    //   {position: number, value: string}
    let tokens = options
            .expression
            .split(/(?<=["\\$[,\]])|(?=["\\$[,\]])/g)
            .map((function (value) {
                const position = this.position;
                this.position += value.length;
                return {
                    value,
                    position
                }
            }).bind({position: 0}));

    /*
    FIRST PASS:
    - Process escape sequences into LITERAL_TEXT entities
    - Process quoted text sequences into LITERAL_TEXT entities
    - process $varname sequences into VARNAME entities
    */
    let cursor = 0;
    while (cursor < tokens.length) {

        // Non-signifacant token
        if (tokens[cursor].value === '' || '"$\\[,]'.indexOf(tokens[cursor].value) === -1) {
            tokens[cursor].type = types.LITERAL_TEXT;
            cursor += 1;
            continue;
        }

        const state = {cursor, consumed: false};

        // Process next token as escape sequence
        consumeEscapeSequence(state, tokens, ESC_CHARS);
        if (state.consumed) {
            cursor = state.cursor;
            continue;
        }

        // Process next token as quoted text
        consumeQuotedText(state, tokens);
        if (state.consumed) {
            cursor = state.cursor;
            continue;
        }

        // process next token as a variable name
        consumeVariableName(state, tokens);
        if (state.consumed) {
            cursor = state.cursor;
            continue;
        }

        // Move cursor to next token
        cursor += 1;
    }

    /*
    SECOND PASS: Concatinate successive LITERAL_TEXT entities into a single entity
    */
    cursor = 1;
    while (cursor < tokens.length) {
        let token = tokens[cursor];
        if (
            token.type === types.LITERAL_TEXT &&
            tokens[cursor - 1].type === types.LITERAL_TEXT
        ) {
            tokens[cursor - 1].value += token.value;
            tokens.splice(cursor, 1);
            continue;
        }
        cursor += 1;
    }

    /*
    THIRD PASS: Flatten if need be
    */
    if (
        tokens.length === 1 &&
        tokens[0].type === types.LITERAL_TEXT
    ) {

        return tokens[0].value
    }

    tokens = tokens.map(token => {
        if (token.type === types.LITERAL_TEXT) {
            return token.value;
        }
        return token;
    });

    return tokens;
}