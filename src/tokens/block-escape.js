const types = require('../helpers/token-types.js');

const { TextToken } = require('./text.js');

const ifHandler = require('./if.js');
const variableHandler = require('./variable.js');

/**
 *
 * @param {Array<any>} output
 * @param {string[]} tokens
 * @returns
 */
const tokenize = (output, tokens) => {
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

        if (ifHandler.tokenize(result, tokensCopy)) {
            continue;
        }
        if (variableHandler.tokenize(result, tokensCopy)) {
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
    while (tokensCopy.length && tokensCopy[0].value === ' ') {
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