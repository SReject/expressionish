const types = require('../helpers/token-types.js');

const { TextToken } = require('./text.js');

const ifHandler = require('./if.js');
const variableHandler = require('./variable.js');
const lookupHandler = require('./lookup.js');

/**
 *
 * @param {Array<any>} output
 * @param {string[]} tokens
 * @returns
 */
const tokenize = (output, tokens, lookups) => {
    if (
        output.length > 0 ||
        !tokens.length ||
        tokens[0].value !== '``'
    ) {
        return false;
    }

    // copy tokens list, remove opening ``
    let tokensCopy = tokens.slice(1);

    let result = [];
    while (tokensCopy.length) {
        if (tokensCopy[0].value === '``') {
            break;
        }

        if (ifHandler.tokenize(result, tokensCopy, lookups)) {
            continue;
        }
        if (variableHandler.tokenize(result, tokensCopy, lookups)) {
            continue;
        }
        if (lookupHandler.tokenize(result, tokensCopy, lookups)) {
            continue;
        }

        if (result.length && result[result.length - 1].type === types.TEXT) {
            result[result.length - 1].value += tokensCopy.shift().value;
        } else {
            tokensCopy[0].type = types.TEXT;
            result.push(new TextToken(tokensCopy.shift()))
        }
    }

    // Remove closing ``
    if (!tokensCopy.length || tokensCopy[0].value !== '``') {
        return false;
    }
    tokensCopy.shift();

    // Escape block not the only token in the argument
    while (
        tokensCopy.length && (
            tokensCopy[0].value === ' ' ||
            tokensCopy[0].value === '\n' ||
            tokensCopy[0].value === '\r' ||
            tokensCopy[0].value === '\r\n'
        )
    ) {
        tokensCopy.shift();
    }
    if (!tokensCopy.length || (tokensCopy[0].value !== ',' && tokensCopy[0].value !== ']')) {
        return false;
    }

    tokens.splice(0, tokens.length - tokensCopy.length);
    output.push(...result);
    return true;
};

module.exports.tokenize = tokenize;