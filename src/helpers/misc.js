const hasOwnProperty = Object.prototype.hasOwnProperty;
module.exports.has = (subject, key) => hasOwnProperty.call(subject, key);

module.exports.removeWhitespace = tokens => {
    let result = '';
    while (
        tokens.length &&
        (
            tokens[0].value === ' ' ||
            tokens[0].value === '\n' ||
            tokens[0].value === '\r' ||
            tokens[0].value === '\r\n'
        )
    ) {
        result += tokens.shift().value;
    }
    return result;
};