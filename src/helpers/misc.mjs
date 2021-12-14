const hasOwnProperty = Object.prototype.hasOwnProperty;
export const has = (subject, key) => hasOwnProperty.call(subject, key);

export const removeWhitespace = tokens => {
    let result = '';
    while (tokens.length && tokens[0].value === ' ') {
        result += tokens.shift().value;
    }
    return result;
};