const hasOwnProperty = Object.prototype.hasOwnProperty;
module.exports.has = (subject, key) => hasOwnProperty.call(subject, key);

module.exports.removeWhitespace = tokens => {
    let result = '';
    while (tokens.length && tokens[0].value === ' ') {
        result += tokens.shift().value;
    }
    return result;
};